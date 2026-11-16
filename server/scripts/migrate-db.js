/**
 * CreatorBridge Database Migration Utility
 * Migrates and normalizes legacy data from server/db.json
 * to the structured models with backup, audit, and validation checks.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLLECTIONS, validateDocument } from '../database/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '../..');
const DB_FILE = path.join(ROOT_DIR, 'server/db.json');
const BACKUP_FILE = path.join(ROOT_DIR, `server/data/db.backup-${Date.now()}.json`);
const TARGET_STORE = path.join(ROOT_DIR, 'server/data/production-store.json');

export async function runMigration() {
  console.log('=====================================================');
  console.log('STARTING CREATORBRIDGE DATABASE MIGRATION SCRIPT');
  console.log('=====================================================\n');

  if (!fs.existsSync(DB_FILE)) {
    console.error('Source db.json does not exist. Nothing to migrate.');
    process.exit(1);
  }

  // 1. Create immediate timestamped backup
  console.log(`1. Creating safety backup at: ${BACKUP_FILE}`);
  const rawData = fs.readFileSync(DB_FILE, 'utf8');
  fs.mkdirSync(path.dirname(BACKUP_FILE), { recursive: true });
  fs.writeFileSync(BACKUP_FILE, rawData, 'utf8');
  console.log('   ✅ Backup created successfully.');

  // 2. Parse source data
  const source = JSON.parse(rawData);
  const target = {};

  // 3. Initialize all collections
  for (const col of Object.values(COLLECTIONS)) {
    target[col] = [];
  }

  console.log('\n2. Migrating and Validating Collections:');

  // Users
  if (Array.isArray(source.users)) {
    source.users.forEach(u => {
      const userDoc = {
        id: u.id,
        name: u.name || u.fullName || 'User',
        email: u.email.toLowerCase().trim(),
        passwordHash: u.passwordHash,
        phone: u.phone || '',
        role: u.role || 'creator',
        avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        location: u.location || 'India',
        businessName: u.businessName || (u.role === 'brand' ? u.name : undefined),
        profileCompleted: u.profileCompleted ?? true,
        membership: u.membership || null,
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString()
      };
      const v = validateDocument(COLLECTIONS.USERS, userDoc);
      if (v.valid) {
        target[COLLECTIONS.USERS].push(userDoc);
      } else {
        console.warn(`   ⚠️ Skipping invalid user ${u.id}: ${v.error}`);
      }
    });
    console.log(`   ✅ Users migrated: ${target[COLLECTIONS.USERS].length}`);
  }

  // BrandProfiles
  if (Array.isArray(source.brandProfiles)) {
    target[COLLECTIONS.BRAND_PROFILES] = [...source.brandProfiles];
    console.log(`   ✅ BrandProfiles migrated: ${target[COLLECTIONS.BRAND_PROFILES].length}`);
  }

  // CreatorProfiles
  if (Array.isArray(source.creators)) {
    target[COLLECTIONS.CREATOR_PROFILES] = [...source.creators];
    console.log(`   ✅ CreatorProfiles migrated: ${target[COLLECTIONS.CREATOR_PROFILES].length}`);
  }

  // Campaigns
  if (Array.isArray(source.campaigns)) {
    target[COLLECTIONS.CAMPAIGNS] = [...source.campaigns];
    console.log(`   ✅ Campaigns migrated: ${target[COLLECTIONS.CAMPAIGNS].length}`);
  }

  // Applications
  if (Array.isArray(source.applications)) {
    target[COLLECTIONS.APPLICATIONS] = [...source.applications];
    console.log(`   ✅ Applications migrated: ${target[COLLECTIONS.APPLICATIONS].length}`);
  }

  // Collaborations
  if (Array.isArray(source.collaborations)) {
    target[COLLECTIONS.COLLABORATIONS] = [...source.collaborations];
    console.log(`   ✅ Collaborations migrated: ${target[COLLECTIONS.COLLABORATIONS].length}`);
  }

  // CalendarTasks
  if (Array.isArray(source.calendarTasks)) {
    target[COLLECTIONS.CALENDAR_TASKS] = [...source.calendarTasks];
    console.log(`   ✅ CalendarTasks migrated: ${target[COLLECTIONS.CALENDAR_TASKS].length}`);
  }

  // Messages & Conversations
  if (Array.isArray(source.conversations)) {
    target[COLLECTIONS.CONVERSATIONS] = [...source.conversations];
  }
  if (source.messages) {
    if (Array.isArray(source.messages)) {
      target[COLLECTIONS.MESSAGES] = source.messages;
    } else if (typeof source.messages === 'object') {
      const flattened = [];
      Object.entries(source.messages).forEach(([convId, msgs]) => {
        if (Array.isArray(msgs)) {
          msgs.forEach(m => flattened.push({ ...m, conversationId: convId }));
        }
      });
      target[COLLECTIONS.MESSAGES] = flattened;
    }
    console.log(`   ✅ Messages migrated: ${target[COLLECTIONS.MESSAGES].length}`);
  }

  // Notifications
  if (Array.isArray(source.notifications)) {
    target[COLLECTIONS.NOTIFICATIONS] = [...source.notifications];
    console.log(`   ✅ Notifications migrated: ${target[COLLECTIONS.NOTIFICATIONS].length}`);
  }

  // Payments / Transactions
  if (Array.isArray(source.transactions)) {
    target[COLLECTIONS.PAYMENTS] = source.transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: 'INR',
      status: t.status,
      date: t.date,
      campaignId: t.campaignId,
      campaignTitle: t.campaignTitle,
      counterpartyName: t.counterpartyName,
      counterpartyRole: t.counterpartyRole,
      invoiceNumber: t.invoiceNumber,
      createdAt: t.date ? new Date(t.date).toISOString() : new Date().toISOString()
    }));
    console.log(`   ✅ Payments migrated: ${target[COLLECTIONS.PAYMENTS].length}`);
  }

  // Membership Plans (Exact authoritative plans)
  target[COLLECTIONS.MEMBERSHIP_PLANS] = [
    {
      id: 'creator_pro',
      name: 'Creator Pro',
      original_price: 599,
      discounted_price: 299,
      currency: 'INR',
      discount_percentage: 50,
      billing_interval: 'monthly',
      features: [
        'Unlimited campaign applications',
        'AI Script Writer',
        '30 AI scripts per month',
        'Advanced creator portfolio',
        'Creator analytics',
        'Application tracking',
        'Priority support'
      ],
      limits: {
        aiScriptsMonthly: 30,
        unlimitedApplications: true
      },
      active: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'creator_premium',
      name: 'Creator Premium',
      original_price: 1399,
      discounted_price: 599,
      currency: 'INR',
      discount_percentage: 57.18,
      billing_interval: 'monthly',
      features: [
        'Everything in Creator Pro',
        '100 AI scripts per month',
        'Advanced analytics',
        'Portfolio insights',
        'Profile promotion credits',
        'Priority support',
        'Exclusive creator resources'
      ],
      limits: {
        aiScriptsMonthly: 100,
        unlimitedApplications: true
      },
      active: true,
      updatedAt: new Date().toISOString()
    }
  ];
  console.log(`   ✅ Authoritative Membership Plans established: ${target[COLLECTIONS.MEMBERSHIP_PLANS].length}`);

  // 4. Write verified production store
  const targetJson = JSON.stringify(target, null, 2);
  fs.writeFileSync(TARGET_STORE, targetJson, 'utf8');
  fs.writeFileSync(DB_FILE, targetJson, 'utf8');

  console.log('\n3. Migration complete! Target store populated at:');
  console.log(`   👉 ${TARGET_STORE}`);
  console.log(`   👉 ${DB_FILE}`);
  console.log('=====================================================\n');
}

// Auto-run if executed directly via node
if (process.argv[1] && process.argv[1].endsWith('migrate-db.js')) {
  runMigration().then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
