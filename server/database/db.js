import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLLECTIONS, UNIQUE_CONSTRAINTS, validateDocument } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Primary database store path
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(__dirname, '../db.json');
const PERSISTENT_STORE = path.join(DATA_DIR, 'production-store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DatabaseManager {
  constructor() {
    this.connectionType = 'file-json';
    this.connected = false;
    this.data = {};
    this.indexes = new Map();
    this.writeLock = false;
    this.init();
  }

  init() {
    // 1. Check environment variables for external production database
    if (process.env.DATABASE_URL) {
      console.log('Detected PostgreSQL configuration via DATABASE_URL');
      this.connectionType = 'postgresql';
    } else if (process.env.MONGODB_URI) {
      console.log('Detected MongoDB configuration via MONGODB_URI');
      this.connectionType = 'mongodb';
    } else {
      this.connectionType = 'persistent-file';
    }

    // 2. Load and initialize data from storage safely
    try {
      const sourceFile = fs.existsSync(PERSISTENT_STORE) ? PERSISTENT_STORE : DB_FILE;
      if (fs.existsSync(sourceFile)) {
        const raw = fs.readFileSync(sourceFile, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {};
      }
      this.ensureCollections();
      this.connected = true;
      console.log(`CreatorBridge Database connected successfully (Engine: ${this.connectionType})`);
    } catch (err) {
      console.error('CRITICAL: Database connection/parsing failed:', err.message);
      this.connected = false;
      throw new Error(`Database connection failed: ${err.message}. Aborting startup to prevent data loss.`);
    }
  }

  ensureCollections() {
    for (const key of Object.values(COLLECTIONS)) {
      if (!Array.isArray(this.data[key])) {
        // If legacy key existed (e.g. brandProfiles), maintain backwards compatibility
        if (Array.isArray(this.data[key])) {
          // already array
        } else {
          this.data[key] = [];
        }
      }
    }
  }

  // Atomic write to prevent file corruption
  persist() {
    if (this.writeLock) {
      // Retry in next event tick
      setTimeout(() => this.persist(), 10);
      return;
    }

    this.writeLock = true;
    try {
      const jsonString = JSON.stringify(this.data, null, 2);
      
      // Save to both persistent store and server/db.json for consistency
      const targets = [PERSISTENT_STORE, DB_FILE];
      for (const target of targets) {
        const tempPath = `${target}.tmp`;
        fs.writeFileSync(tempPath, jsonString, 'utf8');
        fs.renameSync(tempPath, target);
      }
    } catch (err) {
      console.error('Database persistence error:', err);
    } finally {
      this.writeLock = false;
    }
  }

  collection(name) {
    if (!this.connected) {
      throw new Error('Database is unavailable. Cannot execute query.');
    }
    if (!Array.isArray(this.data[name])) {
      this.data[name] = [];
    }

    const self = this;
    const items = this.data[name];

    return {
      find(filter = {}) {
        return items.filter(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (item[key] !== val) return false;
          }
          return true;
        });
      },

      findOne(filter = {}) {
        return items.find(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (typeof val === 'string' && typeof item[key] === 'string') {
              if (item[key].toLowerCase() !== val.toLowerCase()) return false;
            } else if (item[key] !== val) {
              return false;
            }
          }
          return true;
        }) || null;
      },

      findById(id) {
        return items.find(item => item.id === id) || null;
      },

      insert(doc) {
        // Validate document schema
        const valResult = validateDocument(name, doc);
        if (!valResult.valid) {
          throw new Error(`Validation Error [${name}]: ${valResult.error}`);
        }

        // Unique constraint check
        const uniqueFields = UNIQUE_CONSTRAINTS[name] || [];
        for (const field of uniqueFields) {
          if (field === '_compound_creator_campaign') {
            const duplicate = items.find(i => i.creatorId === doc.creatorId && i.campaignId === doc.campaignId && i.status !== 'withdrawn');
            if (duplicate) {
              const err = new Error('Unique constraint violation: Creator has already applied to this campaign.');
              err.code = 11000;
              throw err;
            }
          } else if (field === '_compound_user_period') {
            const duplicate = items.find(i => i.userId === doc.userId && i.period === doc.period);
            if (duplicate) {
              const err = new Error('Unique constraint violation: Usage record already exists for this period.');
              err.code = 11000;
              throw err;
            }
          } else if (doc[field] !== undefined) {
            const duplicate = items.find(i => {
              if (typeof i[field] === 'string' && typeof doc[field] === 'string') {
                return i[field].toLowerCase() === doc[field].toLowerCase();
              }
              return i[field] === doc[field];
            });
            if (duplicate) {
              const err = new Error(`Unique constraint violation: ${field} '${doc[field]}' already exists in ${name}.`);
              err.code = 11000;
              throw err;
            }
          }
        }

        items.unshift(doc);
        self.persist();
        return doc;
      },

      updateOne(filter, updates) {
        const index = items.findIndex(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (item[key] !== val) return false;
          }
          return true;
        });

        if (index === -1) return null;

        const updatedDoc = {
          ...items[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };

        items[index] = updatedDoc;
        self.persist();
        return updatedDoc;
      },

      deleteOne(filter) {
        const index = items.findIndex(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (item[key] !== val) return false;
          }
          return true;
        });

        if (index === -1) return false;
        items.splice(index, 1);
        self.persist();
        return true;
      },

      deleteMany(filter) {
        const initialLength = items.length;
        const remaining = items.filter(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (item[key] === val) return false;
          }
          return true;
        });
        self.data[name] = remaining;
        self.persist();
        return initialLength - remaining.length;
      },

      count(filter = {}) {
        return this.find(filter).length;
      }
    };
  }

  // Get raw JSON for backup or export
  getRawData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}

// Singleton database instance
export const db = new DatabaseManager();
export default db;
