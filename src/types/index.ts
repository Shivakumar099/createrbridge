export type UserRole = 'brand' | 'creator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  location: string;
  businessName?: string;
  profileCompleted?: boolean;
  membership?: {
    planId: string;
    planName: string;
    status: 'active' | 'inactive' | 'expired';
    basePrice: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    subscribedAt: string;
    expiresAt: string;
    invoiceNumber: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  currency: string;
  discount_percentage: number;
  features: string[];
}

export interface BrandProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  logo: string;
  website?: string;
  description: string;
  verified: boolean;
  totalSpend: number;
  activeCampaignsCount: number;
}

export interface CreatorPortfolioItem {
  id: string;
  title: string;
  type: 'Reel' | 'Video' | 'Post' | 'Story';
  thumbnail: string;
  url: string;
  views: string;
  likes: string;
  brandName: string;
}

export interface CreatorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  instagramHandle: string;
  youtubeHandle?: string;
  categories: string[];
  location: string;
  profilePhoto: string;
  bio: string;
  followersCount: number; // e.g. 450000
  youtubeSubscribers?: number;
  avgViews: number;
  engagementRate: number; // e.g. 4.8 (%)
  rating: number; // 1-5
  reviewCount: number;
  verified: boolean;
  pricing: {
    reel: number;
    story: number;
    post: number;
    video: number;
  };
  portfolio: CreatorPortfolioItem[];
  profileCompletionPct: number;
  missingProfileItems?: string[];
}

export interface CampaignDeliverables {
  reels?: number;
  stories?: number;
  posts?: number;
  youtubeVideos?: number;
  productReviews?: number;
}

export interface CampaignBrief {
  objective: string;
  targetAudience: string;
  keyMessage: string;
  productBenefits: string[];
  specialOffers?: string;
  requiredCTA: string;
  brandGuidelines: string;
  contentRestrictions: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  title: string;
  product: string;
  description: string;
  category: string;
  location: string;
  budget: number; // Total budget in INR
  creatorPayment: number; // Amount paid per creator in INR
  deliverables: CampaignDeliverables;
  deadline: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  audienceRequirements: {
    minFollowers: number;
    creatorCategory: string;
    audienceType: string;
    location: string;
  };
  brief: CampaignBrief;
  status: 'active' | 'in_review' | 'completed' | 'draft';
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  bannerImage: string;
  applicantsCount: number;
  selectedCreatorsCount: number;
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorFollowers: number;
  creatorCategory: string;
  creatorLocation: string;
  pitch: string;
  requestedFee: number;
  status: ApplicationStatus;
  appliedDate: string;
  rejectionReason?: string;
}

export type CollaborationStatus =
  | 'brief_received'
  | 'script_generated'
  | 'script_submitted'
  | 'script_approved'
  | 'content_in_production'
  | 'content_submitted'
  | 'under_review'
  | 'revision_requested'
  | 'approved'
  | 'payment_completed';

export interface ScriptScene {
  sceneNumber: number;
  visual: string;
  voiceover: string;
  onScreenText: string;
}

export interface ScriptDraft {
  id: string;
  campaignId: string;
  collaborationId?: string;
  creatorId: string;
  title: string;
  format: string; // Reel, Story, Short, Video, etc.
  style: string;  // Informative, Storytelling, Entertaining, etc.
  language: string; // English, Hindi, Kannada, etc.
  hook: string;
  scenes: ScriptScene[];
  productPlacement: string;
  cta: string;
  caption: string;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  disclaimer: string;
  versionNumber?: number;
}

export interface Collaboration {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignBanner?: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  deliverables: string[];
  paymentAmount: number;
  deadline: string;
  status: CollaborationStatus;
  script?: ScriptDraft;
  submittedContentUrl?: string;
  submittedContentNotes?: string;
  revisionFeedback?: string;
  paymentStatus: 'unpaid' | 'escrowed' | 'processing' | 'paid';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CalendarTaskType =
  | 'script_writing'
  | 'content_shooting'
  | 'video_editing'
  | 'content_submission'
  | 'brand_review'
  | 'final_publishing'
  | 'payment_due'
  | 'personal';

export interface CalendarTask {
  id: string;
  creatorId: string;
  collaborationId?: string;
  campaignTitle?: string;
  brandName?: string;
  taskType: CalendarTaskType;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  campaignId?: string;
  campaignTitle?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: UserRole;
  campaignId?: string;
  campaignTitle?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Transaction {
  id: string;
  type: 'payout' | 'deposit' | 'escrow_hold';
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  date: string;
  campaignId: string;
  campaignTitle: string;
  counterpartyName: string;
  counterpartyRole: string;
  invoiceNumber: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'script' | 'content' | 'payment' | 'message' | 'system';
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}
