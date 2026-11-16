/**
 * CreatorBridge Database Schemas & Validation Engine
 * Defines models, validation rules, unique constraints, and indexes
 * for all 17 system entities.
 */

export const COLLECTIONS = {
  USERS: 'users',
  CREATOR_PROFILES: 'creatorProfiles',
  BRAND_PROFILES: 'brandProfiles',
  CAMPAIGNS: 'campaigns',
  APPLICATIONS: 'applications',
  COLLABORATIONS: 'collaborations',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  NOTIFICATIONS: 'notifications',
  CALENDAR_TASKS: 'calendarTasks',
  MEMBERSHIP_PLANS: 'membershipPlans',
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  USAGE_RECORDS: 'usageRecords',
  SESSIONS: 'sessions',
  AUDIT_LOGS: 'auditLogs'
};

// Unique constraints per collection: array of field names that must be unique
export const UNIQUE_CONSTRAINTS = {
  [COLLECTIONS.USERS]: ['email'],
  [COLLECTIONS.SESSIONS]: ['id'],
  [COLLECTIONS.MEMBERSHIP_PLANS]: ['id'],
  [COLLECTIONS.APPLICATIONS]: ['_compound_creator_campaign'], // custom compound check
  [COLLECTIONS.USAGE_RECORDS]: ['_compound_user_period']
};

// Default index definitions for high-performance lookup
export const INDEXES = {
  [COLLECTIONS.USERS]: ['id', 'email', 'role'],
  [COLLECTIONS.CREATOR_PROFILES]: ['id', 'email', 'followersCount', 'location'],
  [COLLECTIONS.BRAND_PROFILES]: ['id', 'email', 'businessName'],
  [COLLECTIONS.CAMPAIGNS]: ['id', 'brandId', 'category', 'status', 'creatorPayment'],
  [COLLECTIONS.APPLICATIONS]: ['id', 'campaignId', 'creatorId', 'brandId', 'status'],
  [COLLECTIONS.COLLABORATIONS]: ['id', 'campaignId', 'creatorId', 'brandId', 'status', 'paymentStatus'],
  [COLLECTIONS.MESSAGES]: ['id', 'conversationId', 'senderId'],
  [COLLECTIONS.CONVERSATIONS]: ['id', 'participantId', 'brandId'],
  [COLLECTIONS.NOTIFICATIONS]: ['id', 'userId', 'isRead'],
  [COLLECTIONS.CALENDAR_TASKS]: ['id', 'creatorId', 'collaborationId', 'dueDate'],
  [COLLECTIONS.MEMBERSHIP_PLANS]: ['id', 'active'],
  [COLLECTIONS.SUBSCRIPTIONS]: ['id', 'userId', 'status', 'planId'],
  [COLLECTIONS.PAYMENTS]: ['id', 'orderId', 'paymentId', 'campaignId'],
  [COLLECTIONS.INVOICES]: ['id', 'invoiceNumber', 'userId'],
  [COLLECTIONS.USAGE_RECORDS]: ['userId', 'period'],
  [COLLECTIONS.SESSIONS]: ['id', 'userId', 'expiresAt'],
  [COLLECTIONS.AUDIT_LOGS]: ['userId', 'action', 'timestamp']
};

/**
 * Validation rules per collection
 */
export function validateDocument(collection, doc) {
  if (!doc || typeof doc !== 'object') {
    return { valid: false, error: 'Document must be an object' };
  }

  switch (collection) {
    case COLLECTIONS.USERS:
      if (!doc.id) return { valid: false, error: 'User id is required' };
      if (!doc.email || !doc.email.includes('@')) return { valid: false, error: 'Valid email is required' };
      if (!['brand', 'creator', 'admin'].includes(doc.role)) return { valid: false, error: 'Role must be brand, creator, or admin' };
      if (!doc.passwordHash && !doc.isGoogleUser) return { valid: false, error: 'passwordHash is required' };
      break;

    case COLLECTIONS.CAMPAIGNS:
      if (!doc.id) return { valid: false, error: 'Campaign id is required' };
      if (!doc.brandId) return { valid: false, error: 'brandId is required' };
      if (!doc.title || doc.title.trim().length < 3) return { valid: false, error: 'Title must be at least 3 characters' };
      if (typeof doc.budget !== 'number' || doc.budget <= 0) return { valid: false, error: 'Valid positive budget required' };
      break;

    case COLLECTIONS.APPLICATIONS:
      if (!doc.id) return { valid: false, error: 'Application id is required' };
      if (!doc.campaignId) return { valid: false, error: 'campaignId is required' };
      if (!doc.creatorId) return { valid: false, error: 'creatorId is required' };
      if (!doc.brandId) return { valid: false, error: 'brandId is required' };
      if (!['pending', 'accepted', 'rejected', 'withdrawn'].includes(doc.status)) {
        return { valid: false, error: 'Invalid application status' };
      }
      break;

    case COLLECTIONS.COLLABORATIONS:
      if (!doc.id) return { valid: false, error: 'Collaboration id is required' };
      if (!doc.campaignId) return { valid: false, error: 'campaignId is required' };
      if (!doc.creatorId) return { valid: false, error: 'creatorId is required' };
      if (!doc.brandId) return { valid: false, error: 'brandId is required' };
      break;

    case COLLECTIONS.MEMBERSHIP_PLANS:
      if (!doc.id) return { valid: false, error: 'Plan id is required' };
      if (!doc.name) return { valid: false, error: 'Plan name is required' };
      if (typeof doc.discounted_price !== 'number' || doc.discounted_price <= 0) {
        return { valid: false, error: 'discounted_price must be a positive number' };
      }
      if (typeof doc.original_price !== 'number' || doc.original_price < doc.discounted_price) {
        return { valid: false, error: 'original_price must be >= discounted_price' };
      }
      break;

    case COLLECTIONS.SESSIONS:
      if (!doc.id) return { valid: false, error: 'Session id (token) is required' };
      if (!doc.userId) return { valid: false, error: 'userId is required' };
      if (!doc.expiresAt || typeof doc.expiresAt !== 'number') {
        return { valid: false, error: 'Numeric expiresAt timestamp required' };
      }
      break;

    default:
      // Allow custom collections with id
      if (!doc.id) return { valid: false, error: 'Document id is required' };
  }

  return { valid: true };
}
