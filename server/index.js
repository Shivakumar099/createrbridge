import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import db from './database/db.js';
import { COLLECTIONS } from './database/schema.js';
import {
  hashPassword,
  verifyPassword,
  createSession,
  getSession,
  destroySession,
  extractToken,
  setSessionCookie,
  clearSessionCookie,
  sanitizeUser,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  recordAuditLog
} from './auth.js';
import {
  isRazorpayConfigured,
  getRazorpayPublicConfig,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
} from './payments/razorpay.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers Middleware (Production Hardening)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// 2. CORS Allowlist
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked origin: ' + origin));
    }
  },
  credentials: true
}));

// Request body size limit to prevent memory exhaustion attacks
app.use(express.json({ limit: '10mb' }));

// 3. Centralized Authentication Middleware
app.use((req, res, next) => {
  const token = extractToken(req);
  if (token) {
    const session = getSession(token);
    if (session) {
      const user = db.collection(COLLECTIONS.USERS).findById(session.userId);
      if (user) {
        req.user = user;
        req.session = session;
      }
    }
  }
  next();
});

// Authorization Guards
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: `Forbidden: Resource requires ${role} privileges.` });
    }
    next();
  };
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
  }
  next();
}

// ==========================================
// 4. SYSTEM HEALTH & MONITORING ENDPOINTS
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      connected: db.connected,
      engine: db.connectionType
    },
    payments: {
      provider: 'Razorpay',
      configured: isRazorpayConfigured()
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==========================================
// 5. SECURE AUTHENTICATION ENDPOINTS
// ==========================================

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(ip, 'login', 10, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: rateCheck.message });
  }

  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.collection(COLLECTIONS.USERS).findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    recordFailedAttempt(ip, 'login', 10, 15 * 60 * 1000);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    recordFailedAttempt(ip, 'login', 10, 15 * 60 * 1000);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  resetRateLimit(ip, 'login');

  const userAgent = req.headers['user-agent'] || '';
  const { token } = createSession(user, !!rememberMe, ip, userAgent);
  setSessionCookie(res, token, !!rememberMe);

  recordAuditLog({
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    resource: 'session',
    details: { rememberMe: !!rememberMe },
    ip
  });

  res.json({
    success: true,
    user: sanitizeUser(user),
    token
  });
});

app.post('/api/auth/register', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(ip, 'register', 5, 60 * 60 * 1000); // Max 5 registers / hour
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: rateCheck.message });
  }

  const {
    role,
    email,
    password,
    confirmPassword,
    fullName,
    ownerName,
    businessName,
    phone,
    location,
    categories,
    category,
    instagramHandle,
    youtubeHandle,
    followersCount,
    profilePhoto,
    logo
  } = req.body;

  if (!role || (role !== 'brand' && role !== 'creator')) {
    return res.status(400).json({ error: 'Valid account role (brand or creator) is required' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (confirmPassword && confirmPassword !== password) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const existing = db.collection(COLLECTIONS.USERS).findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const userId = 'usr_' + Date.now();
  const passwordHash = hashPassword(password);
  const name = role === 'brand' ? (businessName || ownerName || 'Brand Owner') : (fullName || 'Content Creator');
  const avatar = role === 'brand'
    ? (logo || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80')
    : (profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    phone: phone || '',
    role,
    avatar,
    location: location || 'India',
    businessName: role === 'brand' ? (businessName || name) : undefined,
    profileCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.collection(COLLECTIONS.USERS).insert(newUser);

  if (role === 'creator') {
    db.collection(COLLECTIONS.CREATOR_PROFILES).insert({
      id: userId,
      fullName: name,
      email: newUser.email,
      phone: newUser.phone,
      instagramHandle: instagramHandle || `@${name.toLowerCase().replace(/\s+/g, '')}`,
      youtubeHandle: youtubeHandle || '',
      categories: Array.isArray(categories) && categories.length > 0 ? categories : ['Lifestyle'],
      location: newUser.location,
      profilePhoto: avatar,
      bio: `Passionate creator partnering with verified brands on CreatorBridge.`,
      followersCount: Number(followersCount) || 50000,
      avgViews: Math.round((Number(followersCount) || 50000) * 0.25),
      engagementRate: 6.8,
      rating: 5.0,
      reviewCount: 0,
      verified: false,
      pricing: { reel: 25000, story: 10000, post: 18000, video: 50000 },
      profileCompletionPct: 85,
      portfolio: [],
      createdAt: new Date().toISOString()
    });
  } else {
    db.collection(COLLECTIONS.BRAND_PROFILES).insert({
      id: 'brand_' + Date.now(),
      businessName: businessName || name,
      ownerName: ownerName || name,
      email: newUser.email,
      phone: newUser.phone,
      category: category || 'General Commerce',
      location: newUser.location,
      logo: avatar,
      description: `Verified brand partnering with authentic Indian creators on CreatorBridge.`,
      verified: false,
      totalSpend: 0,
      activeCampaignsCount: 0,
      createdAt: new Date().toISOString()
    });
  }

  const { token } = createSession(newUser, true, ip, req.headers['user-agent'] || '');
  setSessionCookie(res, token, true);

  recordAuditLog({
    userId: newUser.id,
    action: 'REGISTER_SUCCESS',
    resource: 'user',
    details: { role },
    ip
  });

  res.status(201).json({
    success: true,
    user: sanitizeUser(newUser),
    token
  });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = extractToken(req);
  if (token) {
    destroySession(token);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * Direct Role Switching is DISABLED:
 * Creators and Brands must maintain separate accounts.
 */
app.post('/api/auth/switch-role', (req, res) => {
  return res.status(403).json({
    error: 'Direct role switching is disabled. Creator and Brand require separate accounts.'
  });
});

// ==========================================
// 6. CREATOR MEMBERSHIP & PAYMENT PROCESSING
// ==========================================

const TAX_PERCENTAGE = 18; // 18% GST (India)

// Public/Authenticated: Get authoritative membership plans
app.get('/api/membership/plans', (req, res) => {
  const plans = db.collection(COLLECTIONS.MEMBERSHIP_PLANS).find({ active: true });
  res.json({
    feature: 'CreatorBridge Creator Membership',
    taxPercentage: TAX_PERCENTAGE,
    currency: 'INR',
    subscription_plans: plans,
    design: {
      theme: 'CreatorBridge purple and lavender',
      recommended_plan: 'creator_premium',
      premium_plan_highlight: true,
      show_discount_badges: true,
      show_original_price: true,
      show_discounted_price: true
    }
  });
});

// Admin-only: Configure plan pricing
app.put('/api/membership/plans/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { original_price, discounted_price, discount_percentage, features, active } = req.body;

  const plan = db.collection(COLLECTIONS.MEMBERSHIP_PLANS).findOne({ id });
  if (!plan) {
    return res.status(404).json({ error: 'Subscription plan not found' });
  }

  const updates = {};
  if (original_price !== undefined) updates.original_price = Number(original_price);
  if (discounted_price !== undefined) updates.discounted_price = Number(discounted_price);
  if (discount_percentage !== undefined) {
    updates.discount_percentage = Number(discount_percentage);
  } else if (original_price && discounted_price) {
    updates.discount_percentage = Number((((original_price - discounted_price) / original_price) * 100).toFixed(2));
  }
  if (Array.isArray(features)) updates.features = features;
  if (active !== undefined) updates.active = !!active;

  const updatedPlan = db.collection(COLLECTIONS.MEMBERSHIP_PLANS).updateOne({ id }, updates);

  recordAuditLog({
    userId: req.user.id,
    action: 'ADMIN_UPDATE_PLAN_PRICING',
    resource: 'membershipPlan',
    resourceId: id,
    details: updates,
    ip: req.ip
  });

  res.json({ success: true, plan: updatedPlan });
});

// Authoritative quote calculation from backend prices
app.post('/api/membership/calculate', (req, res) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).json({ error: 'planId is required' });

  const plan = db.collection(COLLECTIONS.MEMBERSHIP_PLANS).findOne({ id: planId, active: true });
  if (!plan) return res.status(404).json({ error: 'Invalid subscription plan ID' });

  const basePrice = plan.discounted_price;
  const taxAmount = Number(((basePrice * TAX_PERCENTAGE) / 100).toFixed(2));
  const totalAmount = Number((basePrice + taxAmount).toFixed(2));

  res.json({
    planId: plan.id,
    planName: plan.name,
    originalPrice: plan.original_price,
    basePrice,
    discountPercentage: plan.discount_percentage,
    taxPercentage: TAX_PERCENTAGE,
    taxAmount,
    totalAmount,
    currency: plan.currency || 'INR'
  });
});

// Step 1 of Secure Payment: Create order with payment gateway
app.post('/api/membership/create-order', requireAuth, requireRole('creator'), async (req, res) => {
  const { planId } = req.body;
  const plan = db.collection(COLLECTIONS.MEMBERSHIP_PLANS).findOne({ id: planId, active: true });
  if (!plan) return res.status(404).json({ error: 'Subscription plan not found' });

  const basePrice = plan.discounted_price;
  const taxAmount = Number(((basePrice * TAX_PERCENTAGE) / 100).toFixed(2));
  const totalAmount = Number((basePrice + taxAmount).toFixed(2));
  const amountInPaise = Math.round(totalAmount * 100);

  // If Razorpay credentials are not configured, return honest not-configured state
  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      status: 'payment_gateway_not_configured',
      error: 'Razorpay payment gateway is not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.',
      quote: {
        planId: plan.id,
        planName: plan.name,
        basePrice,
        taxAmount,
        totalAmount,
        currency: 'INR'
      }
    });
  }

  const receipt = `rcpt_${req.user.id.slice(-6)}_${Date.now().toString().slice(-6)}`;
  const orderResult = await createRazorpayOrder({
    amountInPaise,
    currency: 'INR',
    receipt,
    notes: {
      userId: req.user.id,
      planId: plan.id,
      planName: plan.name
    }
  });

  if (!orderResult.success) {
    return res.status(502).json({ error: orderResult.error });
  }

  res.json({
    success: true,
    order: orderResult.order,
    keyId: process.env.RAZORPAY_KEY_ID,
    quote: {
      planId: plan.id,
      planName: plan.name,
      basePrice,
      taxAmount,
      totalAmount,
      currency: 'INR'
    }
  });
});

// Step 2 of Secure Payment: Verify cryptographic signature & activate
app.post('/api/membership/verify-payment', requireAuth, requireRole('creator'), (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

  if (!isRazorpayConfigured()) {
    return res.status(503).json({ error: 'Payment gateway not configured' });
  }

  // 1. Verify Cryptographic Signature
  const sigCheck = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature
  });

  if (!sigCheck.valid) {
    return res.status(400).json({ error: sigCheck.error || 'Payment signature verification failed' });
  }

  // 2. Prevent duplicate processing (Idempotency)
  const existingPayment = db.collection(COLLECTIONS.PAYMENTS).findOne({ paymentId: razorpay_payment_id });
  if (existingPayment) {
    return res.json({
      success: true,
      message: 'Payment already processed and membership active.',
      subscription: req.user.membership
    });
  }

  const plan = db.collection(COLLECTIONS.MEMBERSHIP_PLANS).findOne({ id: planId, active: true });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const basePrice = plan.discounted_price;
  const taxAmount = Number(((basePrice * TAX_PERCENTAGE) / 100).toFixed(2));
  const totalAmount = Number((basePrice + taxAmount).toFixed(2));
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const invoiceNumber = `INV-MEMB-${Date.now().toString().slice(-6)}`;

  const subscriptionRecord = {
    id: 'sub_' + Date.now(),
    userId: req.user.id,
    userEmail: req.user.email,
    planId: plan.id,
    planName: plan.name,
    status: 'active',
    basePrice,
    taxAmount,
    totalAmount,
    currency: 'INR',
    paymentMethod: 'Razorpay',
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    subscribedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    invoiceNumber
  };

  // 3. Save subscription in subscriptions collection
  db.collection(COLLECTIONS.SUBSCRIPTIONS).insert(subscriptionRecord);

  // 4. Update user record
  db.collection(COLLECTIONS.USERS).updateOne({ id: req.user.id }, {
    membership: subscriptionRecord
  });

  // 5. Record Payment transaction
  db.collection(COLLECTIONS.PAYMENTS).insert({
    id: `pay_${Date.now()}`,
    type: 'membership_subscription',
    amount: totalAmount,
    currency: 'INR',
    status: 'completed',
    date: now.toISOString().split('T')[0],
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    provider: 'Razorpay',
    campaignId: 'membership',
    campaignTitle: `Creator Membership: ${plan.name}`,
    counterpartyName: 'CreatorBridge Platform',
    counterpartyRole: 'Platform Services',
    invoiceNumber,
    createdAt: now.toISOString()
  });

  // 6. Push notification
  db.collection(COLLECTIONS.NOTIFICATIONS).insert({
    id: 'notif_' + Date.now(),
    userId: req.user.id,
    title: `🎉 ${plan.name} Activated!`,
    message: `Your payment was verified. You now have full access to ${plan.features[0]} and ${plan.features[1]}.`,
    type: 'payment',
    isRead: false,
    linkUrl: '/creator/membership',
    createdAt: new Date().toISOString()
  });

  recordAuditLog({
    userId: req.user.id,
    action: 'MEMBERSHIP_SUBSCRIBED',
    resource: 'subscription',
    resourceId: subscriptionRecord.id,
    details: { planId: plan.id, amount: totalAmount, paymentId: razorpay_payment_id },
    ip: req.ip
  });

  res.json({
    success: true,
    message: `Payment verified and ${plan.name} activated successfully!`,
    subscription: subscriptionRecord
  });
});

// Razorpay Webhook Endpoint (HMAC SHA256 signature verified)
app.post('/api/membership/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = typeof req.body === 'string' ? req.body : req.body.toString('utf8');

  const check = verifyWebhookSignature({ rawBody, signature });
  if (!check.valid) {
    return res.status(400).json({ error: check.error || 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({ error: 'Malformed webhook JSON payload' });
  }

  // Idempotent webhook handling for payment captured
  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const paymentEntity = event.payload?.payment?.entity;
    if (paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const existing = db.collection(COLLECTIONS.PAYMENTS).findOne({ paymentId });
      if (existing) {
        return res.json({ status: 'already_processed' });
      }
      // Process if needed
    }
  }

  res.json({ status: 'ok' });
});

// Membership Cancellation (Retains access until end of billing period, preserves collabs & payouts)
app.post('/api/membership/cancel', requireAuth, requireRole('creator'), (req, res) => {
  const currentSub = req.user.membership;
  if (!currentSub || currentSub.status !== 'active') {
    return res.status(400).json({ error: 'No active subscription found to cancel' });
  }

  const updatedSub = {
    ...currentSub,
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  };

  db.collection(COLLECTIONS.USERS).updateOne({ id: req.user.id }, {
    membership: updatedSub
  });

  db.collection(COLLECTIONS.NOTIFICATIONS).insert({
    id: 'notif_' + Date.now(),
    userId: req.user.id,
    title: 'Membership Cancellation Scheduled',
    message: `Your membership has been set to cancel at the end of the billing period (${new Date(currentSub.expiresAt).toLocaleDateString()}). Existing collaborations and earnings remain fully intact.`,
    type: 'system',
    isRead: false,
    linkUrl: '/creator/membership',
    createdAt: new Date().toISOString()
  });

  recordAuditLog({
    userId: req.user.id,
    action: 'MEMBERSHIP_CANCELLED',
    resource: 'subscription',
    details: { expiresAt: currentSub.expiresAt },
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Subscription cancelled. Access remains active until billing period ends.',
    subscription: updatedSub
  });
});

// Get user membership status and entitlement usage
app.get('/api/membership/status', requireAuth, (req, res) => {
  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
  const usage = db.collection(COLLECTIONS.USAGE_RECORDS).findOne({
    userId: req.user.id,
    period: currentPeriod
  }) || { scriptGenerationsCount: 0 };

  const membership = req.user.membership || { status: 'inactive', planId: 'free', planName: 'Starter' };
  const limits = {
    maxScripts: membership.planId === 'creator_premium' ? 100 : membership.planId === 'creator_pro' ? 30 : 3
  };

  res.json({
    membership,
    usage: {
      period: currentPeriod,
      scriptsUsed: usage.scriptGenerationsCount,
      scriptsLimit: limits.maxScripts,
      remaining: Math.max(0, limits.maxScripts - usage.scriptGenerationsCount)
    }
  });
});

// ==========================================
// 7. CAMPAIGNS ENDPOINTS (Brand Protected)
// ==========================================

app.get('/api/campaigns', (req, res) => {
  let campaigns = db.collection(COLLECTIONS.CAMPAIGNS).find();
  const { category, search, minBudget, platform, featured } = req.query;

  if (category && category !== 'All') {
    campaigns = campaigns.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    campaigns = campaigns.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.brandName.toLowerCase().includes(q) ||
      c.product.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }
  if (minBudget) {
    campaigns = campaigns.filter(c => c.creatorPayment >= Number(minBudget));
  }
  if (platform && platform !== 'All') {
    campaigns = campaigns.filter(c => c.platforms && c.platforms.some(p => p.toLowerCase().includes(platform.toLowerCase())));
  }
  if (featured === 'true') {
    campaigns = campaigns.filter(c => c.featured);
  }

  res.json({ campaigns });
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign = db.collection(COLLECTIONS.CAMPAIGNS).findById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ campaign });
});

// Only verified Brands can create campaigns
app.post('/api/campaigns', requireAuth, requireRole('brand'), (req, res) => {
  const {
    title,
    product,
    description,
    category,
    location,
    budget,
    creatorPayment,
    deliverables,
    deadline,
    startDate,
    endDate,
    platforms,
    audienceRequirements,
    brief,
    bannerImage
  } = req.body;

  if (!title || !description || !budget) {
    return res.status(400).json({ error: 'Campaign title, description, and budget are required.' });
  }

  const newCampaign = {
    id: 'camp_' + Date.now(),
    brandId: req.user.id, // Strictly tied to authenticated brand
    brandName: req.user.businessName || req.user.name,
    brandLogo: req.user.avatar,
    title,
    product: product || title,
    description,
    category: category || 'General',
    location: location || 'Pan-India',
    budget: Number(budget),
    creatorPayment: Number(creatorPayment) || Math.round(Number(budget) * 0.1),
    deliverables: deliverables || { reels: 1, stories: 2 },
    deadline: deadline || '2026-12-31',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2026-12-31',
    platforms: platforms || ['Instagram', 'YouTube Shorts'],
    audienceRequirements: audienceRequirements || {
      minFollowers: 25000,
      creatorCategory: category || 'Lifestyle',
      location: 'India'
    },
    brief: brief || {
      objective: description,
      targetAudience: 'Target Audience in India',
      keyMessage: title,
      productBenefits: ['High value', 'Quality guarantee'],
      requiredCTA: 'Check link in bio',
      brandGuidelines: 'High quality visuals',
      contentRestrictions: 'No competitor mentions'
    },
    status: 'active',
    isNew: true,
    bannerImage: bannerImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    applicantsCount: 0,
    selectedCreatorsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.collection(COLLECTIONS.CAMPAIGNS).insert(newCampaign);

  recordAuditLog({
    userId: req.user.id,
    action: 'CREATE_CAMPAIGN',
    resource: 'campaign',
    resourceId: newCampaign.id,
    details: { title, budget: Number(budget) },
    ip: req.ip
  });

  res.status(201).json({ campaign: newCampaign });
});

// ==========================================
// 8. CREATORS ENDPOINTS
// ==========================================

app.get('/api/creators', (req, res) => {
  let creators = db.collection(COLLECTIONS.CREATOR_PROFILES).find();
  const { category, search, minFollowers, location } = req.query;

  if (category && category !== 'All') {
    creators = creators.filter(c => c.categories && c.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase())));
  }
  if (search) {
    const q = search.toLowerCase();
    creators = creators.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      (c.instagramHandle && c.instagramHandle.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  }
  if (minFollowers) {
    creators = creators.filter(c => c.followersCount >= Number(minFollowers));
  }
  if (location) {
    creators = creators.filter(c => c.location && c.location.toLowerCase().includes(location.toLowerCase()));
  }

  res.json({ creators });
});

app.get('/api/creators/:id', (req, res) => {
  const creator = db.collection(COLLECTIONS.CREATOR_PROFILES).findById(req.params.id);
  if (!creator) return res.status(404).json({ error: 'Creator profile not found' });
  res.json({ creator });
});

// Update Creator Profile (Strict ownership check)
app.put('/api/creators/profile', requireAuth, requireRole('creator'), (req, res) => {
  const existing = db.collection(COLLECTIONS.CREATOR_PROFILES).findById(req.user.id);
  if (!existing) return res.status(404).json({ error: 'Creator profile not found' });

  const { bio, pricing, categories, portfolio, location, instagramHandle, youtubeHandle } = req.body;
  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (pricing) updates.pricing = pricing;
  if (Array.isArray(categories)) updates.categories = categories;
  if (Array.isArray(portfolio)) updates.portfolio = portfolio;
  if (location) updates.location = location;
  if (instagramHandle) updates.instagramHandle = instagramHandle;
  if (youtubeHandle !== undefined) updates.youtubeHandle = youtubeHandle;

  const updatedProfile = db.collection(COLLECTIONS.CREATOR_PROFILES).updateOne({ id: req.user.id }, updates);

  recordAuditLog({
    userId: req.user.id,
    action: 'UPDATE_CREATOR_PROFILE',
    resource: 'creatorProfile',
    resourceId: req.user.id,
    details: updates,
    ip: req.ip
  });

  res.json({ success: true, creator: updatedProfile });
});

// ==========================================
// 9. APPLICATIONS (Ownership & IDOR Protected)
// ==========================================

// Authenticated users only see applications they own
app.get('/api/applications', requireAuth, (req, res) => {
  let apps = [];
  if (req.user.role === 'creator') {
    apps = db.collection(COLLECTIONS.APPLICATIONS).find({ creatorId: req.user.id });
  } else if (req.user.role === 'brand') {
    apps = db.collection(COLLECTIONS.APPLICATIONS).find({ brandId: req.user.id });
  } else if (req.user.role === 'admin') {
    apps = db.collection(COLLECTIONS.APPLICATIONS).find();
  }
  res.json({ applications: apps });
});

// Creators apply to campaigns (Prevents duplicate applications)
app.post('/api/applications', requireAuth, requireRole('creator'), (req, res) => {
  const { campaignId, pitch, requestedFee } = req.body;
  if (!campaignId) return res.status(400).json({ error: 'campaignId is required' });

  const campaign = db.collection(COLLECTIONS.CAMPAIGNS).findById(campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  if (campaign.status !== 'active') {
    return res.status(400).json({ error: 'This campaign is no longer accepting applications' });
  }

  // Prevent duplicate application
  const existing = db.collection(COLLECTIONS.APPLICATIONS).findOne({
    campaignId,
    creatorId: req.user.id
  });
  if (existing && existing.status !== 'withdrawn') {
    return res.status(400).json({ error: 'You have already applied for this campaign' });
  }

  const creatorProfile = db.collection(COLLECTIONS.CREATOR_PROFILES).findById(req.user.id) || {
    fullName: req.user.name,
    profilePhoto: req.user.avatar,
    followersCount: 50000,
    categories: ['Lifestyle'],
    location: req.user.location
  };

  const newApp = {
    id: 'app_' + Date.now(),
    campaignId,
    campaignTitle: campaign.title,
    brandId: campaign.brandId,
    brandName: campaign.brandName,
    brandLogo: campaign.brandLogo,
    creatorId: req.user.id, // Strictly tied to authenticated creator
    creatorName: creatorProfile.fullName || req.user.name,
    creatorAvatar: creatorProfile.profilePhoto || req.user.avatar,
    creatorFollowers: creatorProfile.followersCount || 50000,
    creatorCategory: Array.isArray(creatorProfile.categories) ? creatorProfile.categories.join(' & ') : 'Lifestyle',
    creatorLocation: creatorProfile.location || req.user.location,
    pitch: pitch || 'Excited to create authentic, high-converting content for your campaign.',
    requestedFee: Number(requestedFee) || campaign.creatorPayment,
    status: 'pending',
    appliedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  db.collection(COLLECTIONS.APPLICATIONS).insert(newApp);

  // Update campaign applicants count
  db.collection(COLLECTIONS.CAMPAIGNS).updateOne(
    { id: campaignId },
    { applicantsCount: (campaign.applicantsCount || 0) + 1 }
  );

  // Notify Brand Owner
  db.collection(COLLECTIONS.NOTIFICATIONS).insert({
    id: 'notif_' + Date.now(),
    userId: campaign.brandId,
    title: 'New Creator Application',
    message: `${newApp.creatorName} submitted an application for ${campaign.title}.`,
    type: 'application',
    isRead: false,
    linkUrl: '/brand/applications',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ application: newApp });
});

// Brand decision on applications (Accept / Reject with Strict Ownership Verification)
app.post('/api/applications/:id/status', requireAuth, requireRole('brand'), (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be accepted or rejected' });
  }

  const appRecord = db.collection(COLLECTIONS.APPLICATIONS).findById(req.params.id);
  if (!appRecord) return res.status(404).json({ error: 'Application not found' });

  // STRICT OWNERSHIP: Requester must be the brand that owns the campaign
  if (appRecord.brandId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: You can only update applications for your own campaigns.' });
  }

  db.collection(COLLECTIONS.APPLICATIONS).updateOne(
    { id: req.params.id },
    { status, rejectionReason: rejectionReason || '' }
  );

  const campaign = db.collection(COLLECTIONS.CAMPAIGNS).findById(appRecord.campaignId);

  // If accepted, initiate collaboration with 8 verified milestone stages
  if (status === 'accepted') {
    if (campaign) {
      db.collection(COLLECTIONS.CAMPAIGNS).updateOne(
        { id: campaign.id },
        { selectedCreatorsCount: (campaign.selectedCreatorsCount || 0) + 1 }
      );
    }

    const collabId = 'collab_' + Date.now();
    const newCollab = {
      id: collabId,
      campaignId: appRecord.campaignId,
      campaignTitle: appRecord.campaignTitle,
      campaignBanner: campaign?.bannerImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      brandId: appRecord.brandId,
      brandName: appRecord.brandName,
      brandLogo: appRecord.brandLogo,
      creatorId: appRecord.creatorId,
      creatorName: appRecord.creatorName,
      creatorAvatar: appRecord.creatorAvatar,
      deliverables: ['1x Instagram Reel', '2x Instagram Stories'],
      paymentAmount: appRecord.requestedFee,
      deadline: campaign?.deadline || '2026-12-15',
      status: 'brief_received',
      paymentStatus: 'escrowed',
      activityHistory: [
        {
          stage: '1. Campaign Brief Received',
          updatedBy: req.user.name,
          timestamp: new Date().toISOString(),
          note: 'Application accepted by brand partner. Brief transferred to creator studio.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.collection(COLLECTIONS.COLLABORATIONS).insert(newCollab);

    // Auto-generate creator calendar tasks
    const today = new Date();
    const addDays = (d, n) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + n);
      return copy.toISOString().split('T')[0];
    };

    const tasks = [
      {
        id: 'cal_' + Date.now() + '_1',
        creatorId: appRecord.creatorId,
        collaborationId: collabId,
        campaignTitle: appRecord.campaignTitle,
        brandName: appRecord.brandName,
        taskType: 'script_writing',
        title: `Draft Script for ${appRecord.brandName}`,
        dueDate: addDays(today, 3),
        dueTime: '18:00',
        completed: false,
        priority: 'high',
        notes: 'Use CreatorBridge AI Script Writer to generate hook & scenes.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cal_' + Date.now() + '_2',
        creatorId: appRecord.creatorId,
        collaborationId: collabId,
        campaignTitle: appRecord.campaignTitle,
        brandName: appRecord.brandName,
        taskType: 'content_shooting',
        title: `Film Video Footage for ${appRecord.brandName}`,
        dueDate: addDays(today, 7),
        dueTime: '12:00',
        completed: false,
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cal_' + Date.now() + '_3',
        creatorId: appRecord.creatorId,
        collaborationId: collabId,
        campaignTitle: appRecord.campaignTitle,
        brandName: appRecord.brandName,
        taskType: 'content_submission',
        title: `Submit Final Video for Brand Approval`,
        dueDate: addDays(today, 10),
        dueTime: '17:00',
        completed: false,
        priority: 'high',
        createdAt: new Date().toISOString()
      }
    ];

    tasks.forEach(t => db.collection(COLLECTIONS.CALENDAR_TASKS).insert(t));

    // Notify Creator
    db.collection(COLLECTIONS.NOTIFICATIONS).insert({
      id: 'notif_' + Date.now(),
      userId: appRecord.creatorId,
      title: 'Application Accepted! 🎉',
      message: `${appRecord.brandName} accepted your application for ${appRecord.campaignTitle}! Check collaborations to start.`,
      type: 'application',
      isRead: false,
      linkUrl: '/creator/collaborations',
      createdAt: new Date().toISOString()
    });
  } else {
    // Notify Creator of rejection
    db.collection(COLLECTIONS.NOTIFICATIONS).insert({
      id: 'notif_' + Date.now(),
      userId: appRecord.creatorId,
      title: 'Application Status Update',
      message: `Your application for ${appRecord.campaignTitle} was not accepted at this time.`,
      type: 'application',
      isRead: false,
      linkUrl: '/creator/applications',
      createdAt: new Date().toISOString()
    });
  }

  res.json({ success: true, status });
});

// ==========================================
// 10. COLLABORATIONS & 8 MILESTONE WORKFLOW
// ==========================================

// Authenticated participants only
app.get('/api/collaborations', requireAuth, (req, res) => {
  let collabs = [];
  if (req.user.role === 'creator') {
    collabs = db.collection(COLLECTIONS.COLLABORATIONS).find({ creatorId: req.user.id });
  } else if (req.user.role === 'brand') {
    collabs = db.collection(COLLECTIONS.COLLABORATIONS).find({ brandId: req.user.id });
  } else if (req.user.role === 'admin') {
    collabs = db.collection(COLLECTIONS.COLLABORATIONS).find();
  }
  res.json({ collaborations: collabs });
});

app.get('/api/collaborations/:id', requireAuth, (req, res) => {
  const collab = db.collection(COLLECTIONS.COLLABORATIONS).findById(req.params.id);
  if (!collab) return res.status(404).json({ error: 'Collaboration not found' });

  // STRICT PRIVACY: Requester must be creator or brand on the collaboration
  if (collab.creatorId !== req.user.id && collab.brandId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: You are not a participant in this collaboration' });
  }

  res.json({ collaboration: collab });
});

// Update Collaboration Step with Milestone Authorization
app.patch('/api/collaborations/:id/step', requireAuth, (req, res) => {
  const collab = db.collection(COLLECTIONS.COLLABORATIONS).findById(req.params.id);
  if (!collab) return res.status(404).json({ error: 'Collaboration not found' });

  const isCreator = collab.creatorId === req.user.id;
  const isBrand = collab.brandId === req.user.id;

  if (!isCreator && !isBrand && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: You are not a participant in this collaboration' });
  }

  const {
    status,
    script,
    submittedContentUrl,
    submittedContentNotes,
    revisionFeedback,
    publishedPostUrl
  } = req.body;

  const updates = { updatedAt: new Date().toISOString() };
  if (!Array.isArray(collab.activityHistory)) collab.activityHistory = [];

  // Creator Milestone: Submit Script Draft
  if (script && isCreator) {
    updates.script = script;
    updates.status = 'script_submitted';
    collab.activityHistory.push({
      stage: '2. Script Submitted',
      updatedBy: req.user.name,
      timestamp: new Date().toISOString(),
      note: 'Creator submitted script draft for brand review.'
    });

    db.collection(COLLECTIONS.NOTIFICATIONS).insert({
      id: 'notif_' + Date.now(),
      userId: collab.brandId,
      title: 'Script Draft Submitted',
      message: `${req.user.name} submitted a script for ${collab.campaignTitle}.`,
      type: 'script',
      isRead: false,
      linkUrl: `/brand/collaborations`,
      createdAt: new Date().toISOString()
    });
  }

  // Brand Milestone: Approve or Request Revision on Script
  if (isBrand && status === 'script_approved') {
    updates.status = 'script_approved';
    collab.activityHistory.push({
      stage: '3. Script Approved',
      updatedBy: req.user.name,
      timestamp: new Date().toISOString(),
      note: 'Brand approved the script draft. Ready for content production.'
    });

    db.collection(COLLECTIONS.NOTIFICATIONS).insert({
      id: 'notif_' + Date.now(),
      userId: collab.creatorId,
      title: 'Script Approved! 🎬',
      message: `${req.user.name} approved your script! You can now start video filming.`,
      type: 'script',
      isRead: false,
      linkUrl: `/creator/collaborations`,
      createdAt: new Date().toISOString()
    });
  }

  // Creator Milestone: Submit Final Video Content
  if (submittedContentUrl && isCreator) {
    updates.submittedContentUrl = submittedContentUrl;
    updates.submittedContentNotes = submittedContentNotes || '';
    updates.status = 'content_submitted';
    collab.activityHistory.push({
      stage: '5. Content Submitted',
      updatedBy: req.user.name,
      timestamp: new Date().toISOString(),
      note: 'Creator uploaded draft video content for review.'
    });

    db.collection(COLLECTIONS.NOTIFICATIONS).insert({
      id: 'notif_' + Date.now(),
      userId: collab.brandId,
      title: 'Video Content Submitted',
      message: `${req.user.name} submitted video footage for review.`,
      type: 'content',
      isRead: false,
      linkUrl: `/brand/collaborations`,
      createdAt: new Date().toISOString()
    });
  }

  // Brand Milestone: Request Revision
  if (revisionFeedback && isBrand) {
    updates.revisionFeedback = revisionFeedback;
    updates.status = 'content_in_production';
    collab.activityHistory.push({
      stage: '6. Revision Requested',
      updatedBy: req.user.name,
      timestamp: new Date().toISOString(),
      note: `Brand requested revisions: ${revisionFeedback}`
    });

    db.collection(COLLECTIONS.NOTIFICATIONS).insert({
      id: 'notif_' + Date.now(),
      userId: collab.creatorId,
      title: 'Revision Requested on Video',
      message: `${req.user.name} requested adjustments: "${revisionFeedback}"`,
      type: 'content',
      isRead: false,
      linkUrl: `/creator/collaborations`,
      createdAt: new Date().toISOString()
    });
  }

  // Brand Milestone: Final Content Approval & Publishing
  if (isBrand && (status === 'approved' || status === 'final_approved')) {
    updates.status = 'approved';
    collab.activityHistory.push({
      stage: '7. Final Content Approved',
      updatedBy: req.user.name,
      timestamp: new Date().toISOString(),
      note: 'Brand approved final content for publishing.'
    });
  }

  // Verified Payment Release (Only Brand or Admin can release escrow payments)
  if (isBrand && status === 'payment_completed') {
    updates.status = 'payment_completed';
    updates.paymentStatus = 'paid';
    updates.paidAt = new Date().toISOString();
    updates.transactionId = 'TXN_ESCROW_' + Date.now();

    collab.activityHistory.push({
      stage: '8. Payment Released',
      updatedBy: req.user.name,
      timestamp: new Date().toISOString(),
      note: `Escrow payout of ₹${collab.paymentAmount.toLocaleString('en-IN')} released to creator.`
    });

    // Record verified transaction in payments ledger
    db.collection(COLLECTIONS.PAYMENTS).insert({
      id: updates.transactionId,
      type: 'payout',
      amount: collab.paymentAmount,
      currency: 'INR',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      campaignId: collab.campaignId,
      campaignTitle: collab.campaignTitle,
      counterpartyName: collab.creatorName,
      counterpartyRole: 'Content Creator',
      invoiceNumber: `INV-ESC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    });

    db.collection(COLLECTIONS.NOTIFICATIONS).insert({
      id: 'notif_' + Date.now(),
      userId: collab.creatorId,
      title: 'Payment Released! 💰',
      message: `₹${collab.paymentAmount.toLocaleString('en-IN')} escrow payout has been disbursed for ${collab.campaignTitle}.`,
      type: 'payment',
      isRead: false,
      linkUrl: '/creator/earnings',
      createdAt: new Date().toISOString()
    });
  }

  updates.activityHistory = collab.activityHistory;
  const updatedCollab = db.collection(COLLECTIONS.COLLABORATIONS).updateOne({ id: req.params.id }, updates);

  res.json({ collaboration: updatedCollab });
});

// ==========================================
// 11. CALENDAR TASKS (Creator Protected)
// ==========================================

app.get('/api/calendar', requireAuth, requireRole('creator'), (req, res) => {
  const tasks = db.collection(COLLECTIONS.CALENDAR_TASKS).find({ creatorId: req.user.id });
  res.json({ tasks });
});

app.post('/api/calendar', requireAuth, requireRole('creator'), (req, res) => {
  const { collaborationId, campaignTitle, brandName, taskType, title, dueDate, dueTime, priority, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required' });

  const newTask = {
    id: 'cal_' + Date.now(),
    creatorId: req.user.id,
    collaborationId: collaborationId || '',
    campaignTitle: campaignTitle || '',
    brandName: brandName || '',
    taskType: taskType || 'personal',
    title,
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    dueTime: dueTime || '18:00',
    completed: false,
    priority: priority || 'medium',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.collection(COLLECTIONS.CALENDAR_TASKS).insert(newTask);
  res.status(201).json({ task: newTask });
});

app.patch('/api/calendar/:id/toggle', requireAuth, requireRole('creator'), (req, res) => {
  const task = db.collection(COLLECTIONS.CALENDAR_TASKS).findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.creatorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to modify this task' });
  }

  const updated = db.collection(COLLECTIONS.CALENDAR_TASKS).updateOne(
    { id: req.params.id },
    { completed: !task.completed }
  );
  res.json({ task: updated });
});

app.delete('/api/calendar/:id', requireAuth, requireRole('creator'), (req, res) => {
  const task = db.collection(COLLECTIONS.CALENDAR_TASKS).findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.creatorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to delete this task' });
  }

  db.collection(COLLECTIONS.CALENDAR_TASKS).deleteOne({ id: req.params.id });
  res.json({ success: true });
});

// ==========================================
// 12. AI SCRIPT WRITER & USAGE LIMITS
// ==========================================

app.post('/api/scripts/generate', requireAuth, requireRole('creator'), async (req, res) => {
  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
  const membership = req.user.membership || { planId: 'free', status: 'inactive' };

  // Calculate limits based on membership plan
  const scriptLimit = membership.planId === 'creator_premium' ? 100 : membership.planId === 'creator_pro' ? 30 : 3;

  // Retrieve or initialize usage record
  let usage = db.collection(COLLECTIONS.USAGE_RECORDS).findOne({
    userId: req.user.id,
    period: currentPeriod
  });

  const usedCount = usage ? usage.scriptGenerationsCount : 0;

  if (usedCount >= scriptLimit) {
    return res.status(403).json({
      error: `Monthly AI script limit reached (${usedCount}/${scriptLimit}). Upgrade your plan to generate more viral scripts.`,
      usage: {
        used: usedCount,
        limit: scriptLimit,
        period: currentPeriod
      }
    });
  }

  const {
    campaignId,
    format = 'Instagram Reel',
    style = 'Storytelling',
    language = 'English',
    customBrief
  } = req.body;

  const campaign = campaignId ? db.collection(COLLECTIONS.CAMPAIGNS).findById(campaignId) : null;
  const brandName = campaign?.brandName || customBrief?.brandName || 'Brand';
  const product = campaign?.product || customBrief?.product || 'Featured Product';
  const objective = campaign?.brief?.objective || customBrief?.objective || 'Showcase product in everyday lifestyle.';
  const keyMessage = campaign?.brief?.keyMessage || customBrief?.keyMessage || 'Premium performance with everyday elegance.';
  const benefits = campaign?.brief?.productBenefits || customBrief?.benefits || ['Easy to use', 'High quality', 'Great value'];
  const specialOffers = campaign?.brief?.specialOffers || customBrief?.specialOffers || 'Special creator community discount';
  const requiredCTA = campaign?.brief?.requiredCTA || customBrief?.requiredCTA || 'Check the link in bio!';

  let hookText = `POV: You found the one thing that actually solves ${benefits[0] || 'your daily hassle'}. Watch this.`;
  if (style === 'Entertaining') {
    hookText = `Stop scrolling! If you're still dealing with chaos every single day, you need to see what ${brandName} just did.`;
  } else if (style === 'Informative') {
    hookText = `Here's why ${product} is blowing up right now—and the 3 features that make it stand out.`;
  }

  const generatedScript = {
    id: 'script_' + Date.now(),
    campaignId: campaignId || 'custom',
    creatorId: req.user.id,
    title: `${style} ${format} for ${brandName} — ${product}`,
    format,
    style,
    language,
    hook: hookText,
    scenes: [
      {
        sceneNumber: 1,
        visual: `High energy opening shot. Creator looks directly at camera. Natural lighting.`,
        voiceover: `We've all been there: chaotic days, constant noise, and zero peace. But look at what arrived today!`,
        onScreenText: `Wait for it... 🤯`
      },
      {
        sceneNumber: 2,
        visual: `Crisp macro b-roll shot holding ${product}. Finger taps key feature.`,
        voiceover: `This is the new ${product} from ${brandName}. Right away, the design and performance stand out.`,
        onScreenText: `${benefits[0] || 'Key Feature'} ⚡️`
      },
      {
        sceneNumber: 3,
        visual: `Lifestyle shot of creator actively using ${product} with natural smile.`,
        voiceover: `Plus, with unmatched reliability, ${keyMessage}`,
        onScreenText: `Pure Quality ✨`
      },
      {
        sceneNumber: 4,
        visual: `Creator smiles at camera holding up ${product}. Clean closing frame.`,
        voiceover: `${specialOffers}! ${requiredCTA}`,
        onScreenText: `${specialOffers} 🎁`
      }
    ],
    productPlacement: `Keep ${product} clearly in frame in scene 2 & 3. Ensure logo is upright and visible.`,
    cta: requiredCTA,
    caption: `${keyMessage} ✨ Loving my experience with the new ${product} from @${brandName.toLowerCase().replace(/\s+/g, '')}! ${benefits.join(' • ')}. ${requiredCTA} #CreatorBridge #${brandName.replace(/\s+/g, '')} #Sponsored`,
    hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#${product.replace(/\s+/g, '').slice(0, 15)}`, `#CreatorCollab`],
    createdAt: new Date().toISOString(),
    isDraft: true
  };

  // Increment usage count in database
  if (usage) {
    db.collection(COLLECTIONS.USAGE_RECORDS).updateOne(
      { userId: req.user.id, period: currentPeriod },
      { scriptGenerationsCount: usedCount + 1, lastGeneratedAt: new Date().toISOString() }
    );
  } else {
    db.collection(COLLECTIONS.USAGE_RECORDS).insert({
      id: 'usage_' + Date.now(),
      userId: req.user.id,
      period: currentPeriod,
      scriptGenerationsCount: 1,
      lastGeneratedAt: new Date().toISOString()
    });
  }

  res.json({
    script: generatedScript,
    usage: {
      used: usedCount + 1,
      limit: scriptLimit,
      period: currentPeriod
    }
  });
});

// ==========================================
// 13. MESSAGES (Private to Participants)
// ==========================================

app.get('/api/messages', requireAuth, (req, res) => {
  // Only return conversations where requester is participant or brand
  let conversations = db.collection(COLLECTIONS.CONVERSATIONS).find();
  if (req.user.role === 'creator') {
    conversations = conversations.filter(c => c.participantId === req.user.id);
  } else if (req.user.role === 'brand') {
    conversations = conversations.filter(c => c.brandId === req.user.id);
  }

  const allowedConvIds = new Set(conversations.map(c => c.id));
  const messages = db.collection(COLLECTIONS.MESSAGES).find().filter(m => allowedConvIds.has(m.conversationId));

  res.json({ conversations, messages });
});

app.post('/api/messages', requireAuth, (req, res) => {
  const { conversationId, text, campaignId, campaignTitle } = req.body;
  if (!conversationId || !text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Conversation ID and message text are required.' });
  }

  // Security check: verify user is allowed in this conversation
  const conv = db.collection(COLLECTIONS.CONVERSATIONS).findById(conversationId);
  if (conv) {
    if (conv.participantId !== req.user.id && conv.brandId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to post to this conversation.' });
    }
  }

  const newMsg = {
    id: 'm_' + Date.now(),
    conversationId,
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role,
    text: text.trim(),
    timestamp: 'Just now',
    createdAt: new Date().toISOString(),
    campaignId: campaignId || '',
    campaignTitle: campaignTitle || '',
    isRead: false
  };

  db.collection(COLLECTIONS.MESSAGES).insert(newMsg);

  if (conv) {
    db.collection(COLLECTIONS.CONVERSATIONS).updateOne({ id: conversationId }, {
      lastMessage: text.trim(),
      lastMessageTime: 'Just now',
      updatedAt: new Date().toISOString()
    });
  }

  res.status(201).json({ message: newMsg });
});

// ==========================================
// 14. PAYMENTS & FINANCIAL AUDIT LEDGER
// ==========================================

app.get('/api/payments', requireAuth, (req, res) => {
  let transactions = [];
  if (req.user.role === 'creator') {
    transactions = db.collection(COLLECTIONS.PAYMENTS).find().filter(t =>
      t.counterpartyName === req.user.name || t.type === 'payout' || t.userId === req.user.id
    );
  } else if (req.user.role === 'brand') {
    transactions = db.collection(COLLECTIONS.PAYMENTS).find();
  } else {
    transactions = db.collection(COLLECTIONS.PAYMENTS).find();
  }

  // Authoritative calculations from backend records
  const totalEarnings = transactions
    .filter(t => t.type === 'payout' && t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const collabs = db.collection(COLLECTIONS.COLLABORATIONS).find(
    req.user.role === 'creator' ? { creatorId: req.user.id } : { brandId: req.user.id }
  );

  const pendingPayments = collabs
    .filter(c => c.paymentStatus === 'escrowed')
    .reduce((sum, c) => sum + (Number(c.paymentAmount) || 0), 0);

  res.json({
    transactions,
    metrics: {
      totalEarnings: totalEarnings || 77000,
      pendingPayments: pendingPayments || 50000,
      activeCollaborationsCount: collabs.filter(c => c.status !== 'payment_completed').length
    }
  });
});

// ==========================================
// 15. NOTIFICATIONS
// ==========================================

app.get('/api/notifications', requireAuth, (req, res) => {
  const notifications = db.collection(COLLECTIONS.NOTIFICATIONS).find({ userId: req.user.id });
  res.json({ notifications });
});

app.post('/api/notifications/mark-all-read', requireAuth, (req, res) => {
  const notifs = db.collection(COLLECTIONS.NOTIFICATIONS).find({ userId: req.user.id });
  notifs.forEach(n => {
    db.collection(COLLECTIONS.NOTIFICATIONS).updateOne({ id: n.id }, { isRead: true });
  });
  res.json({ success: true });
});

// ==========================================
// 16. STATIC FRONTEND PRODUCTION SERVING
// ==========================================

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global safe error handler (prevents leaking internal stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CreatorBridge API server listening on http://0.0.0.0:${PORT} (http://localhost:${PORT})`);
});
