import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
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
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts
} from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Token/Cookie authentication middleware
app.use((req, res, next) => {
  const token = extractToken(req);
  if (token) {
    const session = getSession(token);
    if (session) {
      const db = readDB();
      const user = db.users?.find(u => u.id === session.userId);
      if (user) {
        req.user = user;
        req.session = session;
      }
    }
  }
  next();
});

// Middleware guards
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
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: This resource requires ${role} privileges.` });
    }
    next();
  };
}

// Initial database seeding
function getInitialData() {
  return {
    currentUser: {
      id: 'user_brand_1',
      name: 'Vikram Sethi',
      email: 'partnerships@boat-lifestyle.com',
      phone: '+91 98201 44512',
      role: 'brand',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: 'Bengaluru, Karnataka',
      businessName: 'boAt Lifestyle',
      createdAt: '2024-01-15'
    },
    brandProfiles: [
      {
        id: 'brand_boat',
        businessName: 'boAt Lifestyle',
        ownerName: 'Aman Gupta & Team',
        email: 'partnerships@boat-lifestyle.com',
        phone: '+91 98201 44512',
        category: 'Technology & Audio',
        location: 'Bengaluru, Karnataka',
        logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
        website: 'https://www.boat-lifestyle.com',
        description: "India's leading consumer tech brand delivering premium wireless audio, ANC earphones, and trendy smartwatches.",
        verified: true,
        totalSpend: 1420000,
        activeCampaignsCount: 4
      },
      {
        id: 'brand_nykaa',
        businessName: 'Nykaa Beauty',
        ownerName: 'Falguni Nayar & Partnerships',
        email: 'collabs@nykaa.com',
        phone: '+91 98110 33201',
        category: 'Beauty & Skincare',
        location: 'Mumbai, Maharashtra',
        logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=120&q=80',
        website: 'https://www.nykaa.com',
        description: "India's premier omnichannel beauty and personal care destination empowering beauty creators.",
        verified: true,
        totalSpend: 2850000,
        activeCampaignsCount: 6
      },
      {
        id: 'brand_zomato',
        businessName: 'Zomato India',
        ownerName: 'Deepinder Goyal & Growth Team',
        email: 'creator-partnerships@zomato.com',
        phone: '+91 97112 55431',
        category: 'Food & Dining',
        location: 'Gurugram, Haryana',
        logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=120&q=80',
        website: 'https://www.zomato.com',
        description: 'Connecting foodies with the best dining and fastest delivery experiences across 500+ Indian cities.',
        verified: true,
        totalSpend: 4200000,
        activeCampaignsCount: 8
      },
      {
        id: 'brand_cultfit',
        businessName: 'Cult.fit',
        ownerName: 'Mukesh Bansal & Team',
        email: 'influencers@cult.fit',
        phone: '+91 98801 12399',
        category: 'Fitness & Wellness',
        location: 'Bengaluru, Karnataka',
        logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=120&q=80',
        website: 'https://www.cult.fit',
        description: 'Transforming fitness through engaging group workouts, holistic nutrition, and athletic gear.',
        verified: true,
        totalSpend: 1950000,
        activeCampaignsCount: 3
      }
    ],
    creators: [
      {
        id: 'user_creator_1',
        fullName: 'Tanya Sharma',
        email: 'tanya@tanyastyle.com',
        phone: '+91 99104 22319',
        instagramHandle: '@tanyasharma.style',
        youtubeHandle: 'TanyaSharmaVlogs',
        categories: ['Fashion', 'Lifestyle', 'Beauty'],
        location: 'Mumbai, Maharashtra',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
        bio: 'Fashion stylist & aesthetic lifestyle creator. Passionate about mindful everyday fashion, street looks & beauty routines.',
        followersCount: 485000,
        youtubeSubscribers: 125000,
        avgViews: 142000,
        engagementRate: 5.4,
        rating: 4.9,
        reviewCount: 38,
        verified: true,
        pricing: {
          reel: 45000,
          story: 18000,
          post: 30000,
          video: 85000
        },
        profileCompletionPct: 95,
        missingProfileItems: ['Add Rate Card for Bundled Reels'],
        portfolio: [
          {
            id: 'port_1',
            title: 'Minimalist Festive Lookbook',
            type: 'Reel',
            thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
            url: 'https://instagram.com/reel/1',
            views: '412K',
            likes: '34.2K',
            brandName: 'Nykaa Fashion'
          },
          {
            id: 'port_2',
            title: '7 Everyday Streetwear Outfits',
            type: 'Video',
            thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
            url: 'https://youtube.com/watch?v=1',
            views: '280K',
            likes: '22.1K',
            brandName: 'H&M India'
          },
          {
            id: 'port_3',
            title: 'Glow Morning Skincare Routine',
            type: 'Reel',
            thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
            url: 'https://instagram.com/reel/2',
            views: '350K',
            likes: '28.9K',
            brandName: 'The Minimalist'
          }
        ]
      },
      {
        id: 'user_creator_2',
        fullName: 'Rohan Kulkarni',
        email: 'rohan@techrohan.in',
        phone: '+91 97312 88410',
        instagramHandle: '@rohangadgets',
        youtubeHandle: 'TechWithRohan',
        categories: ['Technology', 'Gaming'],
        location: 'Bengaluru, Karnataka',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
        bio: 'Tech reviewer breaking down gadgets with brutal honesty, crisp visuals, and benchmarking tests.',
        followersCount: 820000,
        youtubeSubscribers: 610000,
        avgViews: 380000,
        engagementRate: 6.8,
        rating: 4.95,
        reviewCount: 52,
        verified: true,
        pricing: {
          reel: 65000,
          story: 25000,
          post: 40000,
          video: 140000
        },
        profileCompletionPct: 100,
        portfolio: [
          {
            id: 'port_4',
            title: 'Noise Cancelling Earbuds Shootout',
            type: 'Video',
            thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
            url: 'https://youtube.com/watch?v=2',
            views: '690K',
            likes: '48K',
            brandName: 'boAt Lifestyle'
          }
        ]
      },
      {
        id: 'user_creator_3',
        fullName: 'Priya Sundaram',
        email: 'priya@chennaibites.com',
        phone: '+91 98400 66721',
        instagramHandle: '@priyabites',
        youtubeHandle: 'SouthIndianKitchenByPriya',
        categories: ['Food & Beverage', 'Lifestyle'],
        location: 'Chennai, Tamil Nadu',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
        bio: 'Culinary explorer & food creator celebrating traditional South Indian flavours and modern cloud kitchen discoveries.',
        followersCount: 340000,
        youtubeSubscribers: 180000,
        avgViews: 110000,
        engagementRate: 6.1,
        rating: 4.85,
        reviewCount: 29,
        verified: true,
        pricing: {
          reel: 35000,
          story: 15000,
          post: 22000,
          video: 60000
        },
        profileCompletionPct: 90,
        portfolio: []
      },
      {
        id: 'user_creator_4',
        fullName: 'Arjun Nair',
        email: 'arjun@cultfitness.in',
        phone: '+91 98950 11200',
        instagramHandle: '@arjun.calisthenics',
        youtubeHandle: 'ArjunNairFitness',
        categories: ['Fitness', 'Lifestyle'],
        location: 'Hyderabad, Telangana',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
        bio: 'Calisthenics coach, marathon runner, and everyday wellness advocate.',
        followersCount: 620000,
        youtubeSubscribers: 290000,
        avgViews: 230000,
        engagementRate: 7.2,
        rating: 4.9,
        reviewCount: 44,
        verified: true,
        pricing: {
          reel: 50000,
          story: 20000,
          post: 35000,
          video: 95000
        },
        profileCompletionPct: 95,
        portfolio: []
      }
    ],
    campaigns: [
      {
        id: 'camp_freshhydro',
        brandId: 'brand_freshhydro',
        brandName: 'FreshHydro',
        brandLogo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=120&q=80',
        title: 'Promote Our Water Bottle',
        product: 'FreshHydro Insulated Glass Flask',
        description: 'Create aesthetic daily hydration reels showing temperature retention and sleek minimalist design.',
        category: 'Lifestyle',
        location: 'Bengaluru',
        budget: 150000,
        creatorPayment: 15000,
        deliverables: { reels: 1, stories: 2 },
        deadline: '2026-11-18',
        startDate: '2026-11-11',
        endDate: '2026-11-25',
        platforms: ['Instagram'],
        audienceRequirements: {
          minFollowers: 25000,
          creatorCategory: 'Lifestyle / Fitness',
          audienceType: 'Eco-conscious working professionals',
          location: 'Bengaluru'
        },
        brief: {
          objective: 'Promote daily healthy hydration with sustainable insulated glass bottle.',
          targetAudience: 'Urban desk workers & students',
          keyMessage: 'Pure hydration, zero plastic.',
          productBenefits: ['Borosilicate Glass', '24h Cold Retention', 'Leakproof silicone grip'],
          specialOffers: 'Use code FRESH10 for 10% off',
          requiredCTA: 'Tap the link to get your FreshHydro flask with 10% off!',
          brandGuidelines: 'Bright natural lighting, clean aesthetic desk shots.',
          contentRestrictions: 'No plastic comparisons.'
        },
        status: 'active',
        bannerImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        applicantsCount: 18,
        selectedCreatorsCount: 4,
        createdAt: '2026-11-10'
      },
      {
        id: 'camp_urbanbites',
        brandId: 'brand_urbanbites',
        brandName: 'Urban Bites',
        brandLogo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80',
        title: 'Create Reels on Our Cafe',
        product: 'Urban Bites Signature Gourmet Bowls',
        description: 'Visit our flagship cafe in Bandra, sample our signature bowl menu, and shoot a mouth-watering cinematic reel.',
        category: 'Food & Beverage',
        location: 'Mumbai',
        budget: 250000,
        creatorPayment: 25000,
        deliverables: { reels: 1, stories: 3 },
        deadline: '2026-11-21',
        startDate: '2026-11-11',
        endDate: '2026-11-28',
        platforms: ['Instagram'],
        audienceRequirements: {
          minFollowers: 30000,
          creatorCategory: 'Food & Dining / City Guides',
          audienceType: 'Mumbai foodies & brunch lovers',
          location: 'Mumbai'
        },
        brief: {
          objective: 'Showcase authentic flavors and vibrant ambiance of Urban Bites Cafe.',
          targetAudience: 'Foodies and cafe hoppers in Mumbai',
          keyMessage: 'Your new favorite cozy brunch spot in Bandra.',
          productBenefits: ['Fresh farm-to-table organic ingredients', 'Artisanal coffee', 'Aesthetic greenery decor'],
          specialOffers: 'Show reel for free dessert on orders above ₹500',
          requiredCTA: 'Visit Urban Bites Bandra this weekend and show this reel for free dessert!',
          brandGuidelines: 'Rich macro food shots, natural ambient cafe music.',
          contentRestrictions: 'Ensure food hygiene standards.'
        },
        status: 'active',
        bannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        applicantsCount: 32,
        selectedCreatorsCount: 5,
        createdAt: '2026-11-10'
      },
      {
        id: 'camp_glowskin',
        brandId: 'brand_glowskin',
        brandName: 'GlowSkin',
        brandLogo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=120&q=80',
        title: 'Showcase Our Skincare Range',
        product: 'GlowSkin Vitamin C & Peptide Serum',
        description: 'Demonstrate your morning glow skincare routine featuring GlowSkin brightening serum with natural skin texture.',
        category: 'Beauty',
        location: 'Delhi',
        budget: 200000,
        creatorPayment: 20000,
        deliverables: { reels: 1, stories: 2 },
        deadline: '2026-11-19',
        startDate: '2026-11-11',
        endDate: '2026-11-26',
        platforms: ['Instagram'],
        audienceRequirements: {
          minFollowers: 25000,
          creatorCategory: 'Beauty & Skincare',
          audienceType: 'Clean skincare and beauty enthusiasts',
          location: 'Delhi-NCR / India'
        },
        brief: {
          objective: 'Demonstrate dewy hydration and healthy morning skin routine with GlowSkin serum.',
          targetAudience: 'Skincare conscious women and men 18-35',
          keyMessage: 'Feed your skin clean botanical nourishment.',
          productBenefits: ['10% Stable Vitamin C', 'Centella & Hyaluronic Acid', 'Non-sticky fast absorption'],
          specialOffers: '15% off first order with code GLOW15',
          requiredCTA: 'Tap the link in bio to try GlowSkin with 15% off using GLOW15!',
          brandGuidelines: 'Macro skin application, natural lighting, unfiltered real skin.',
          contentRestrictions: 'No medical cure claims.'
        },
        status: 'active',
        bannerImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        applicantsCount: 24,
        selectedCreatorsCount: 4,
        createdAt: '2026-11-10'
      },
      {
        id: 'camp_boat_nirvana',
        brandId: 'brand_boat',
        brandName: 'boAt Lifestyle',
        brandLogo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
        title: 'Nirvana Ion ANC: Silence The Noise in Indian Commutes',
        product: 'boAt Nirvana Ion ANC Earbuds',
        description: 'Showcase how boAt Nirvana Ion ANC blocks chaotic metro, traffic, and coffee shop noise with crystal-clear spatial audio.',
        category: 'Technology',
        location: 'Pan-India',
        budget: 650000,
        creatorPayment: 50000,
        deliverables: { reels: 1, stories: 2 },
        deadline: '2026-11-28',
        startDate: '2026-11-15',
        endDate: '2026-12-10',
        platforms: ['Instagram', 'YouTube Shorts'],
        audienceRequirements: {
          minFollowers: 75000,
          creatorCategory: 'Technology / Lifestyle / Travel',
          audienceType: 'Youth & Young Professionals (18-35)',
          location: 'Metro & Tier-1 Indian Cities'
        },
        brief: {
          objective: 'Demonstrate real-world Active Noise Cancellation (32dB Hybrid ANC) and 120-hour massive playback in everyday Indian hustle.',
          targetAudience: 'College students, daily metro commuters, tech enthusiasts and remote cafe workers looking for premium audio under ₹3,000.',
          keyMessage: 'No matter how chaotic India gets, your vibe stays untouched with boAt Nirvana Ion ANC.',
          productBenefits: [
            '32dB Hybrid Active Noise Cancellation',
            '120 Hours Total Playback with Beast Mode 60ms low latency',
            'Dual EQ Modes (boAt Signature Sound + Balanced)',
            'Quad Mics with ENx Technology for crisp phone calls'
          ],
          specialOffers: 'Use code CREATORBOAT for flat 10% instant off on boat-lifestyle.com',
          requiredCTA: 'Tap the link in bio / story sticker to grab your Nirvana Ion ANC with extra 10% off using code CREATORBOAT.',
          brandGuidelines: 'Show the physical tap-to-ANC gesture in real noisy environments (train, street market, bustling office). High energy, upbeat soundtrack.',
          contentRestrictions: 'Do not disparage rival brands by name. Avoid unsafe recording while actively driving motorized vehicles.'
        },
        status: 'active',
        featured: true,
        trending: true,
        bannerImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        applicantsCount: 28,
        selectedCreatorsCount: 8,
        createdAt: '2026-11-01'
      },
      {
        id: 'camp_nykaa_glow',
        brandId: 'brand_nykaa',
        brandName: 'Nykaa Beauty',
        brandLogo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=120&q=80',
        title: 'Festive Glass Skin: Serum Infused Foundation Launch',
        product: 'Nykaa SkinShield Hydrating Foundation & Dewy Primer',
        description: 'Create an authentic 60-second "Get Ready With Me" showing real skin texture transformation with 24-hr dewy hydration.',
        category: 'Beauty',
        location: 'Mumbai, Delhi, Bengaluru',
        budget: 450000,
        creatorPayment: 45000,
        deliverables: { reels: 1, stories: 3 },
        deadline: '2026-11-25',
        startDate: '2026-11-12',
        endDate: '2026-12-05',
        platforms: ['Instagram'],
        audienceRequirements: {
          minFollowers: 50000,
          creatorCategory: 'Beauty & Skincare / Fashion',
          audienceType: 'Women 18-35 interested in clean makeup & skincare',
          location: 'India'
        },
        brief: {
          objective: 'Establish Nykaa SkinShield as the go-to lightweight foundation for Indian skin tones that hydrates all day.',
          targetAudience: 'Beauty enthusiasts, working women, wedding & festive season party-goers.',
          keyMessage: 'Your skin, but glowing from within. Never cakey, always breathable.',
          productBenefits: [
            'Infused with 2% Niacinamide and Hyaluronic Acid',
            '24 true-match shades formulated specifically for warm & neutral Indian undertones',
            'SPF 30 PA+++ sun protection built in'
          ],
          specialOffers: 'Buy 1 Get Nykaa Lip Glaze Free on orders above ₹999 during the launch week.',
          requiredCTA: 'Find your exact shade match on the Nykaa app and use code NYKAAGLOW for a free gift!',
          brandGuidelines: 'Use natural daylight or soft ring light. Close-up skin shots without heavy smoothing filters are mandatory.',
          contentRestrictions: 'No misleading heavy blurring filters or claiming medical skin cure.'
        },
        status: 'active',
        featured: true,
        isNew: true,
        bannerImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
        applicantsCount: 42,
        selectedCreatorsCount: 6,
        createdAt: '2026-11-05'
      },
      {
        id: 'camp_zomato_gold',
        brandId: 'brand_zomato',
        brandName: 'Zomato India',
        brandLogo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=120&q=80',
        title: 'Secret Food Trails: Unlock 40% Off with Zomato Gold',
        product: 'Zomato Gold Dining Experience',
        description: 'Take your followers to an aesthetic culinary cafe or iconic local eatery and demonstrate instant 40% dining discounts with Gold.',
        category: 'Food & Beverage',
        location: 'Bengaluru, Delhi-NCR, Mumbai, Hyderabad',
        budget: 720000,
        creatorPayment: 35000,
        deliverables: { reels: 1, stories: 2 },
        deadline: '2026-12-01',
        startDate: '2026-11-14',
        endDate: '2026-12-15',
        platforms: ['Instagram', 'YouTube Shorts'],
        audienceRequirements: {
          minFollowers: 40000,
          creatorCategory: 'Food & Dining / Travel',
          audienceType: 'Foodies and cafe hoppers aged 20-38',
          location: 'Top 8 Metro Cities'
        },
        brief: {
          objective: 'Drive dining-out footfall and new Zomato Gold subscriptions by highlighting authentic restaurant experiences.',
          targetAudience: 'Urban food lovers who dine out 2+ times per week.',
          keyMessage: 'Why pay full bill when Zomato Gold cuts 40% off the total check at your favourite culinary spots?',
          productBenefits: [
            'Flat 40% off the total dining bill at partner cafes and fine-dines',
            'Free food delivery on all orders over ₹199',
            'VIP priority delivery during peak rush'
          ],
          specialOffers: 'Get 3 Months of Zomato Gold for just ₹49 using the creator promo code.',
          requiredCTA: 'Tap the link in bio to join Zomato Gold for just ₹49 and save big this weekend!',
          brandGuidelines: 'High-definition macro food shots. Show actual mobile scan screen.',
          contentRestrictions: 'Ensure food hygiene standards in visuals; no food wastage.'
        },
        status: 'active',
        trending: true,
        bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
        applicantsCount: 65,
        selectedCreatorsCount: 12,
        createdAt: '2026-11-03'
      },
      {
        id: 'camp_cultfit_challenge',
        brandId: 'brand_cultfit',
        brandName: 'Cult.fit',
        brandLogo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=120&q=80',
        title: 'Transform in 20 Mins: CultPass Home & Center Challenge',
        product: 'CultPass All-Access Gym & Home Workout',
        description: 'Share a high-energy routine or gym session demonstrating that fitness can be fun, community-driven, and accessible to anyone.',
        category: 'Fitness',
        location: 'Bengaluru, Hyderabad, Pune, Mumbai, Delhi',
        budget: 520000,
        creatorPayment: 40000,
        deliverables: { reels: 1, stories: 2 },
        deadline: '2026-12-05',
        startDate: '2026-11-18',
        endDate: '2026-12-20',
        platforms: ['Instagram', 'YouTube Shorts'],
        audienceRequirements: {
          minFollowers: 60000,
          creatorCategory: 'Fitness / Health / Wellness',
          audienceType: 'Active individuals seeking functional health',
          location: 'India'
        },
        brief: {
          objective: 'Inspire followers to kickstart their fitness resolution early with CultPass.',
          targetAudience: 'Working corporate professionals and beginners intimidated by traditional gyms.',
          keyMessage: 'Workout that feels like a party with world-class trainers and zero judgment.',
          productBenefits: [
            'Access to 600+ Cult centers across India',
            'Unlimited at-home guided workouts with celebrity trainers',
            'Free body composition analysis'
          ],
          specialOffers: '2 Free Trial Classes + 15% off annual CultPass with code CULTCREATOR.',
          requiredCTA: 'Book your 2 FREE trial classes via the link in my story sticker!',
          brandGuidelines: 'High tempo, motivational tone, upbeat music.',
          contentRestrictions: 'No promotion of unverified dietary supplements.'
        },
        status: 'active',
        bannerImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
        applicantsCount: 31,
        selectedCreatorsCount: 5,
        createdAt: '2026-11-08'
      }
    ],
    applications: [
      {
        id: 'app_1',
        campaignId: 'camp_boat_nirvana',
        campaignTitle: 'Nirvana Ion ANC: Silence The Noise in Indian Commutes',
        brandId: 'brand_boat',
        brandName: 'boAt Lifestyle',
        brandLogo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
        creatorId: 'user_creator_1',
        creatorName: 'Tanya Sharma',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        creatorFollowers: 485000,
        creatorCategory: 'Fashion & Lifestyle',
        creatorLocation: 'Mumbai, Maharashtra',
        pitch: 'I commute regularly on the Mumbai local and metro. I will shoot a high-contrast transition showing chaotic station noise vanishing the instant I snap on the Nirvana Ion buds.',
        requestedFee: 50000,
        status: 'accepted',
        appliedDate: '2026-11-03'
      },
      {
        id: 'app_2',
        campaignId: 'camp_nykaa_glow',
        campaignTitle: 'Festive Glass Skin: Serum Infused Foundation Launch',
        brandId: 'brand_nykaa',
        brandName: 'Nykaa Beauty',
        brandLogo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=120&q=80',
        creatorId: 'user_creator_1',
        creatorName: 'Tanya Sharma',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        creatorFollowers: 485000,
        creatorCategory: 'Fashion & Lifestyle',
        creatorLocation: 'Mumbai, Maharashtra',
        pitch: 'Nykaa is my holy grail! I will create a 60s transition from tired morning skin to effortless luminous festive skin.',
        requestedFee: 45000,
        status: 'pending',
        appliedDate: '2026-11-07'
      }
    ],
    collaborations: [
      {
        id: 'collab_boat_tanya',
        campaignId: 'camp_boat_nirvana',
        campaignTitle: 'Nirvana Ion ANC: Silence The Noise in Indian Commutes',
        campaignBanner: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        brandId: 'brand_boat',
        brandName: 'boAt Lifestyle',
        brandLogo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
        creatorId: 'user_creator_1',
        creatorName: 'Tanya Sharma',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        deliverables: ['1x Instagram Reel', '2x Instagram Stories'],
        paymentAmount: 50000,
        deadline: '2026-11-28',
        status: 'script_generated',
        paymentStatus: 'escrowed',
        script: {
          id: 'script_collab_1',
          campaignId: 'camp_boat_nirvana',
          collaborationId: 'collab_boat_tanya',
          creatorId: 'user_creator_1',
          title: 'Mumbai Commute Silence: boAt Nirvana Ion ANC Reel',
          format: 'Instagram Reel',
          style: 'Storytelling & Lifestyle',
          language: 'English with Hindi conversational hooks',
          hook: 'Ever tried hearing your own thoughts inside a crowded Mumbai metro at 6 PM? Watch this magic.',
          scenes: [
            {
              sceneNumber: 1,
              visual: 'Fast handheld POV walking onto noisy metro platform. Overwhelming ambient roar of trains, announcements, and chatter.',
              voiceover: 'POV: You just survived a 9-hour workday and all you want is absolute peace on your way home...',
              onScreenText: 'Mumbai Rush Hour: 85 dB Chaos 🚨'
            },
            {
              sceneNumber: 2,
              visual: 'Close-up of Tanya taking out the matte black boAt Nirvana Ion earbuds from the case and popping them into her ear. Finger taps earbud to engage ANC.',
              voiceover: 'Single tap... and 32dB Hybrid ANC kicks in. Total bliss.',
              onScreenText: 'TAP ➜ Hybrid ANC On (Silence: 100%) 🔇'
            },
            {
              sceneNumber: 3,
              visual: 'Audio suddenly cuts to super clean bass track. Slow-motion cinematic shot of Tanya smiling, leaning against the metro glass, enjoying the music while world moves outside.',
              voiceover: 'The entire noise of the world just vanishes. Crisp highs, deep punchy bass, and 120 hours of battery so I never worry about charging.',
              onScreenText: '120 Hours Battery • Pure Spatial Sound'
            },
            {
              sceneNumber: 4,
              visual: 'Holding product box aesthetic shot, looking directly at camera with warm smile.',
              voiceover: 'Upgrade your daily commute. Use code CREATORBOAT for flat 10% off on boAt-lifestyle.com!',
              onScreenText: 'Link in Bio • Code: CREATORBOAT (10% OFF)'
            }
          ],
          productPlacement: 'Showcase matte black case texture clearly in Scene 2 and clear earbud fit in Scene 3.',
          cta: 'Check the link in my bio or swipe up on my story to grab boAt Nirvana Ion with extra 10% off using code CREATORBOAT!',
          caption: 'Chaos outside, concert inside 🎧✨ Survived the peak hour rush with boAt Nirvana Ion ANC! The 32dB Hybrid noise cancellation is an absolute gamechanger for everyday travel. 120 hours of playback means I charge it once a month! Tap the link in bio & use code CREATORBOAT for 10% off. #boAt #NirvanaIonANC #SilenceTheNoise #CreatorCollab',
          hashtags: ['#boAtNirvana', '#SoundThatMoves', '#IndianCreators', '#DailyCommuteHacks', '#Ad'],
          createdAt: '2026-11-10',
          updatedAt: '2026-11-10',
          isDraft: true,
          disclaimer: 'Draft generated with AI Script Writer based strictly on the boAt Nirvana Ion ANC brand brief. Review and tweak before submitting to brand.'
        },
        createdAt: '2026-11-04',
        updatedAt: '2026-11-10'
      }
    ],
    calendarTasks: [
      {
        id: 'cal_1',
        creatorId: 'user_creator_1',
        collaborationId: 'collab_boat_tanya',
        campaignTitle: 'Nirvana Ion ANC Launch',
        brandName: 'boAt Lifestyle',
        taskType: 'script_writing',
        title: 'Finalize & Submit AI Script Draft for boAt',
        dueDate: '2026-11-14',
        dueTime: '17:00',
        completed: true,
        priority: 'high',
        notes: 'Incorporate Mumbai local train visuals and tap-to-silence moment.'
      },
      {
        id: 'cal_2',
        creatorId: 'user_creator_1',
        collaborationId: 'collab_boat_tanya',
        campaignTitle: 'Nirvana Ion ANC Launch',
        brandName: 'boAt Lifestyle',
        taskType: 'content_shooting',
        title: 'Shoot Metro & Outdoor B-Roll Footage',
        dueDate: '2026-11-18',
        dueTime: '11:00',
        completed: false,
        priority: 'high',
        notes: 'Bring ND filters and shoot during daylight commute.'
      },
      {
        id: 'cal_3',
        creatorId: 'user_creator_1',
        collaborationId: 'collab_boat_tanya',
        campaignTitle: 'Nirvana Ion ANC Launch',
        brandName: 'boAt Lifestyle',
        taskType: 'video_editing',
        title: 'Edit 60-sec Reel with Audio Transitions',
        dueDate: '2026-11-21',
        dueTime: '18:00',
        completed: false,
        priority: 'medium',
        notes: 'Sync sound cutoff with screen flash effect.'
      },
      {
        id: 'cal_4',
        creatorId: 'user_creator_1',
        collaborationId: 'collab_boat_tanya',
        campaignTitle: 'Nirvana Ion ANC Launch',
        brandName: 'boAt Lifestyle',
        taskType: 'content_submission',
        title: 'Submit Reel Video Link for Brand Review',
        dueDate: '2026-11-24',
        dueTime: '16:00',
        completed: false,
        priority: 'high'
      },
      {
        id: 'cal_5',
        creatorId: 'user_creator_1',
        collaborationId: 'collab_boat_tanya',
        campaignTitle: 'Nirvana Ion ANC Launch',
        brandName: 'boAt Lifestyle',
        taskType: 'final_publishing',
        title: 'Publish Instagram Reel & Post Story Stickers',
        dueDate: '2026-11-28',
        dueTime: '19:30',
        completed: false,
        priority: 'high',
        notes: 'Tag @boat.lifestyle and pin promo code in comments.'
      },
      {
        id: 'cal_6',
        creatorId: 'user_creator_1',
        collaborationId: 'collab_boat_tanya',
        campaignTitle: 'Nirvana Ion ANC Launch',
        brandName: 'boAt Lifestyle',
        taskType: 'payment_due',
        title: 'boAt Milestone Payout Release (₹50,000)',
        dueDate: '2026-12-02',
        completed: false,
        priority: 'medium'
      },
      {
        id: 'cal_7',
        creatorId: 'user_creator_1',
        taskType: 'personal',
        title: 'Record Weekly Wardrobe Stylist YouTube Vlog',
        dueDate: '2026-11-16',
        dueTime: '14:00',
        completed: false,
        priority: 'medium',
        notes: 'Focus on winter layering essentials for Mumbai breeze.'
      }
    ],
    conversations: [
      {
        id: 'conv_boat_tanya',
        participantId: 'brand_boat',
        participantName: 'boAt Partnerships Team',
        participantAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
        participantRole: 'brand',
        campaignId: 'camp_boat_nirvana',
        campaignTitle: 'Nirvana Ion ANC',
        lastMessage: 'Your pitch looks fantastic Tanya! We loved your idea of the Mumbai metro sound cut.',
        lastMessageTime: '10:45 AM',
        unreadCount: 1
      }
    ],
    messages: {
      conv_boat_tanya: [
        {
          id: 'm1',
          conversationId: 'conv_boat_tanya',
          senderId: 'brand_boat',
          senderName: 'boAt Partnerships Team',
          senderRole: 'brand',
          text: 'Hi Tanya! Welcome to the Nirvana Ion ANC creator cohort. We loved your concept of shooting inside the Mumbai metro.',
          timestamp: 'Nov 09, 2:30 PM',
          campaignId: 'camp_boat_nirvana',
          campaignTitle: 'boAt Nirvana Ion ANC'
        },
        {
          id: 'm2',
          conversationId: 'conv_boat_tanya',
          senderId: 'user_creator_1',
          senderName: 'Tanya Sharma',
          senderRole: 'creator',
          text: 'Thanks Vikram! Super excited for this. I have generated the first draft using CreatorBridge AI Script Writer. Can I submit the script here or via the collaboration tracker?',
          timestamp: 'Nov 09, 3:15 PM'
        },
        {
          id: 'm3',
          conversationId: 'conv_boat_tanya',
          senderId: 'brand_boat',
          senderName: 'boAt Partnerships Team',
          senderRole: 'brand',
          text: 'Please submit directly via the Collaboration tracker so our brand manager can officially mark it Approved and unlock the shooting milestone!',
          timestamp: 'Today, 10:45 AM'
        }
      ]
    },
    transactions: [
      {
        id: 'TXN_NYK_88319',
        type: 'payout',
        amount: 45000,
        status: 'completed',
        date: '2026-10-28',
        campaignId: 'camp_nykaa_glow',
        campaignTitle: 'Nykaa Festive Lip Oil Launch',
        counterpartyName: 'Nykaa Beauty',
        counterpartyRole: 'Brand',
        invoiceNumber: 'INV-2026-CB-1049'
      },
      {
        id: 'TXN_ESC_99014',
        type: 'escrow_hold',
        amount: 50000,
        status: 'processing',
        date: '2026-11-04',
        campaignId: 'camp_boat_nirvana',
        campaignTitle: 'boAt Nirvana Ion ANC Launch',
        counterpartyName: 'boAt Lifestyle',
        counterpartyRole: 'Brand Escrow',
        invoiceNumber: 'INV-2026-CB-1102'
      }
    ],
    notifications: [
      {
        id: 'notif_1',
        userId: 'user_creator_1',
        title: 'Application Accepted! 🎉',
        message: 'boAt Lifestyle accepted your application for Nirvana Ion ANC campaign! Check the brief and generate your script.',
        type: 'application',
        isRead: false,
        createdAt: '2 hours ago',
        linkUrl: '/creator/collaborations'
      },
      {
        id: 'notif_2',
        userId: 'user_creator_1',
        title: 'Payment Escrowed 🔒',
        message: '₹50,000 for boAt Nirvana Ion campaign has been deposited into secure CreatorBridge Escrow.',
        type: 'payment',
        isRead: false,
        createdAt: '1 day ago',
        linkUrl: '/creator/earnings'
      }
    ]
  };
}

function readDB() {
  try {
    let db;
    if (!fs.existsSync(DB_FILE)) {
      db = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } else {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
    }

    // Ensure db.users is initialized with default seeded accounts
    if (!db.users || !Array.isArray(db.users) || db.users.length === 0) {
      db.users = [
        {
          id: 'user_brand_1',
          name: 'Vikram Sethi',
          email: 'partnerships@boat-lifestyle.com',
          passwordHash: hashPassword('password123'),
          phone: '+91 98201 44512',
          role: 'brand',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          location: 'Bengaluru, Karnataka',
          businessName: 'boAt Lifestyle',
          profileCompleted: true,
          createdAt: '2024-01-15'
        },
        {
          id: 'user_creator_1',
          name: 'Tanya Sharma',
          email: 'tanya@tanyastyle.com',
          passwordHash: hashPassword('password123'),
          phone: '+91 99104 22319',
          role: 'creator',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          location: 'Mumbai, Maharashtra',
          profileCompleted: true,
          createdAt: '2024-02-10'
        },
        {
          id: 'creator_sneha',
          name: 'Sneha Verma',
          email: 'sneha@vermastyle.com',
          passwordHash: hashPassword('password123'),
          phone: '+91 98450 12091',
          role: 'creator',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          location: 'Bengaluru, KA',
          profileCompleted: true,
          createdAt: '2024-02-12'
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (err) {
    console.error('Error reading DB, re-initializing:', err);
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Ensure DB exists on start
readDB();

// --- Auth Routes ---
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  res.json({ user: sanitizeUser(req.user) });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role } = req.body;
  if (!role || (role !== 'brand' && role !== 'creator')) {
    return res.status(400).json({ error: 'Valid role is required (brand or creator)' });
  }
  const db = readDB();

  // If user is already authenticated in session, switch their own role
  if (req.user) {
    const user = db.users?.find(u => u.id === req.user.id);
    if (user) {
      user.role = role;
      if (role === 'creator' && !db.creators?.some(c => c.id === user.id || c.email === user.email)) {
        if (!db.creators) db.creators = [];
        db.creators.push({
          id: user.id,
          fullName: user.name,
          email: user.email,
          phone: user.phone || '',
          instagramHandle: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
          categories: ['Lifestyle', 'Fashion'],
          location: user.location || 'India',
          profilePhoto: user.avatar,
          bio: 'Verified creator partnering with authentic brands on CreatorBridge.',
          followersCount: 75000,
          avgViews: 22000,
          engagementRate: 6.2,
          rating: 5.0,
          reviewCount: 0,
          verified: true,
          pricing: { reel: 25000, story: 10000, post: 18000, video: 50000 },
          profileCompletionPct: 90,
          portfolio: []
        });
      }
      db.currentUser = user;
      writeDB(db);
      const { token } = createSession(user, true);
      setSessionCookie(res, token, true);
      return res.json({ user: sanitizeUser(user), token });
    }
  }

  const targetUser = db.users?.find(u => u.role === role) || (role === 'creator' ? db.users?.[1] : db.users?.[0]);
  if (!targetUser) {
    return res.status(404).json({ error: 'Role profile not found' });
  }

  const { token } = createSession(targetUser, true);
  setSessionCookie(res, token, true);
  db.currentUser = targetUser;
  writeDB(db);

  res.json({ user: sanitizeUser(targetUser), token });
});

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: rateCheck.message });
  }

  const { email, password, rememberMe, requestedRole } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readDB();
  const user = db.users?.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    recordFailedLogin(ip);
    return res.status(401).json({ error: 'Account not found with this email' });
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    recordFailedLogin(ip);
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // If user selected a specific role on login (e.g. Creator tab) and it differs, adapt role
  if (requestedRole && (requestedRole === 'creator' || requestedRole === 'brand') && user.role !== requestedRole) {
    user.role = requestedRole;
    if (requestedRole === 'creator' && !db.creators?.some(c => c.id === user.id || c.email === user.email)) {
      if (!db.creators) db.creators = [];
      db.creators.push({
        id: user.id,
        fullName: user.name,
        email: user.email,
        phone: user.phone || '',
        instagramHandle: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        categories: ['Lifestyle', 'Fitness'],
        location: user.location || 'India',
        profilePhoto: user.avatar,
        bio: 'Verified creator partnering with authentic brands on CreatorBridge.',
        followersCount: 75000,
        avgViews: 22000,
        engagementRate: 6.2,
        rating: 5.0,
        reviewCount: 0,
        verified: true,
        pricing: { reel: 25000, story: 10000, post: 18000, video: 50000 },
        profileCompletionPct: 90,
        portfolio: []
      });
    }
  }

  resetLoginAttempts(ip);
  const { token } = createSession(user, !!rememberMe);
  setSessionCookie(res, token, !!rememberMe);

  db.currentUser = user;
  writeDB(db);

  res.json({
    success: true,
    user: sanitizeUser(user),
    token
  });
});

app.post('/api/auth/register', (req, res) => {
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

  const db = readDB();
  if (!db.users) db.users = [];

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
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
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  if (role === 'creator') {
    db.creators.push({
      id: userId,
      fullName: name,
      email: newUser.email,
      phone: newUser.phone,
      instagramHandle: instagramHandle || `@${name.toLowerCase().replace(/\s+/g, '')}`,
      youtubeHandle: youtubeHandle || '',
      categories: Array.isArray(categories) && categories.length > 0 ? categories : ['Lifestyle'],
      location: newUser.location,
      profilePhoto: avatar,
      bio: `Passionate ${categories?.[0] || 'Lifestyle'} creator partnering with verified brands on CreatorBridge.`,
      followersCount: Number(followersCount) || 50000,
      avgViews: Math.round((Number(followersCount) || 50000) * 0.25),
      engagementRate: 6.8,
      rating: 5.0,
      reviewCount: 0,
      verified: false,
      pricing: { reel: 25000, story: 10000, post: 18000, video: 50000 },
      profileCompletionPct: 85,
      portfolio: []
    });
  } else {
    db.brandProfiles.push({
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
      activeCampaignsCount: 0
    });
  }

  db.currentUser = newUser;
  writeDB(db);

  const { token } = createSession(newUser, true);
  setSessionCookie(res, token, true);

  res.status(201).json({
    success: true,
    user: sanitizeUser(newUser),
    token
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = extractToken(req);
  if (token) {
    destroySession(token);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

// --- Campaigns Routes ---
app.get('/api/campaigns', (req, res) => {
  const db = readDB();
  let campaigns = [...db.campaigns];
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
      c.category.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }
  if (minBudget) {
    campaigns = campaigns.filter(c => c.creatorPayment >= Number(minBudget));
  }
  if (platform && platform !== 'All') {
    campaigns = campaigns.filter(c => c.platforms.some(p => p.toLowerCase().includes(platform.toLowerCase())));
  }
  if (featured === 'true') {
    campaigns = campaigns.filter(c => c.featured);
  }

  res.json({ campaigns });
});

app.get('/api/campaigns/:id', (req, res) => {
  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ campaign });
});

app.post('/api/campaigns', (req, res) => {
  const activeUser = req.user || db.currentUser;
  const db = readDB();
  const newCampaign = {
    id: 'camp_' + Date.now(),
    brandId: activeUser.id === 'user_brand_1' ? 'brand_boat' : activeUser.id,
    brandName: activeUser.businessName || activeUser.name || 'boAt Lifestyle',
    brandLogo: activeUser.avatar || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80',
    title: req.body.title,
    product: req.body.product,
    description: req.body.description,
    category: req.body.category || 'Technology',
    location: req.body.location || 'Pan-India',
    budget: Number(req.body.budget) || 200000,
    creatorPayment: Number(req.body.creatorPayment) || Math.round((Number(req.body.budget) || 200000) * 0.1),
    deliverables: req.body.deliverables || { reels: 1, stories: 2 },
    deadline: req.body.deadline || '2026-12-31',
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || '2026-12-31',
    platforms: req.body.platforms || ['Instagram', 'YouTube Shorts'],
    audienceRequirements: req.body.audienceRequirements || {
      minFollowers: 50000,
      creatorCategory: req.body.category || 'Lifestyle',
      audienceType: 'General Audience',
      location: 'India'
    },
    brief: req.body.brief || {
      objective: req.body.description,
      targetAudience: 'Indian youth and working professionals',
      keyMessage: req.body.title,
      productBenefits: ['High quality performance', 'Reliable and trendy', 'Exclusive launch offer'],
      requiredCTA: 'Tap the link to buy now!',
      brandGuidelines: 'Clean aesthetics, high quality audio/video.',
      contentRestrictions: 'No negative competitive mentions.'
    },
    status: 'active',
    isNew: true,
    bannerImage: req.body.bannerImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    applicantsCount: 0,
    selectedCreatorsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.campaigns.unshift(newCampaign);
  writeDB(db);
  res.json({ campaign: newCampaign });
});

// --- Creators Routes ---
app.get('/api/creators', (req, res) => {
  const db = readDB();
  let creators = [...db.creators];
  const { category, search, minFollowers, location } = req.query;

  if (category && category !== 'All') {
    creators = creators.filter(c => c.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase())));
  }
  if (search) {
    const q = search.toLowerCase();
    creators = creators.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      c.instagramHandle.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }
  if (minFollowers) {
    creators = creators.filter(c => c.followersCount >= Number(minFollowers));
  }
  if (location) {
    creators = creators.filter(c => c.location.toLowerCase().includes(location.toLowerCase()));
  }

  res.json({ creators });
});

app.get('/api/creators/:id', (req, res) => {
  const db = readDB();
  const creator = db.creators.find(c => c.id === req.params.id);
  if (!creator) return res.status(404).json({ error: 'Creator not found' });
  res.json({ creator });
});

// --- Applications Routes ---
app.get('/api/applications', (req, res) => {
  const db = readDB();
  const { creatorId, brandId, campaignId } = req.query;
  let apps = [...db.applications];
  if (creatorId) apps = apps.filter(a => a.creatorId === creatorId);
  if (brandId) apps = apps.filter(a => a.brandId === brandId);
  if (campaignId) apps = apps.filter(a => a.campaignId === campaignId);
  res.json({ applications: apps });
});

app.post('/api/applications', (req, res) => {
  const activeUser = req.user || db.currentUser;
  const db = readDB();
  const { campaignId, pitch, requestedFee } = req.body;
  const campaign = db.campaigns.find(c => c.id === campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  // Check existing application
  const existing = db.applications.find(a => a.campaignId === campaignId && a.creatorId === activeUser.id);
  if (existing) {
    return res.status(400).json({ error: 'You have already applied for this campaign' });
  }

  const creator = db.creators.find(c => c.id === activeUser.id) || {
    fullName: activeUser.name,
    profilePhoto: activeUser.avatar,
    followersCount: 485000,
    categories: ['Lifestyle'],
    location: activeUser.location
  };

  const newApp = {
    id: 'app_' + Date.now(),
    campaignId,
    campaignTitle: campaign.title,
    brandId: campaign.brandId,
    brandName: campaign.brandName,
    brandLogo: campaign.brandLogo,
    creatorId: activeUser.id,
    creatorName: creator.fullName,
    creatorAvatar: creator.profilePhoto,
    creatorFollowers: creator.followersCount,
    creatorCategory: creator.categories.join(' & '),
    creatorLocation: creator.location,
    pitch: pitch || 'Excited to collaborate and create top performing content!',
    requestedFee: Number(requestedFee) || campaign.creatorPayment,
    status: 'pending',
    appliedDate: new Date().toISOString().split('T')[0]
  };

  db.applications.unshift(newApp);
  campaign.applicantsCount = (campaign.applicantsCount || 0) + 1;

  // Add notification for Brand
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId: campaign.brandId,
    title: 'New Creator Application',
    message: `${creator.fullName} applied for ${campaign.title}`,
    type: 'application',
    isRead: false,
    createdAt: 'Just now',
    linkUrl: '/brand/applications'
  });

  writeDB(db);
  res.json({ application: newApp });
});

app.post('/api/applications/:id/status', (req, res) => {
  const { status, rejectionReason } = req.body;
  const db = readDB();
  const appIndex = db.applications.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) return res.status(404).json({ error: 'Application not found' });

  db.applications[appIndex].status = status;
  if (rejectionReason) db.applications[appIndex].rejectionReason = rejectionReason;

  const application = db.applications[appIndex];
  const campaign = db.campaigns.find(c => c.id === application.campaignId);

  // If accepted, auto-create Collaboration and auto-generate Calendar Tasks!
  if (status === 'accepted') {
    if (campaign) {
      campaign.selectedCreatorsCount = (campaign.selectedCreatorsCount || 0) + 1;
    }

    const collabId = 'collab_' + Date.now();
    const newCollab = {
      id: collabId,
      campaignId: application.campaignId,
      campaignTitle: application.campaignTitle,
      campaignBanner: campaign?.bannerImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      brandId: application.brandId,
      brandName: application.brandName,
      brandLogo: application.brandLogo,
      creatorId: application.creatorId,
      creatorName: application.creatorName,
      creatorAvatar: application.creatorAvatar,
      deliverables: ['1x Instagram Reel', '2x Instagram Stories'],
      paymentAmount: application.requestedFee,
      deadline: campaign?.deadline || '2026-12-15',
      status: 'brief_received',
      paymentStatus: 'escrowed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.collaborations.unshift(newCollab);

    // Auto-generate creator calendar tasks!
    const today = new Date();
    const addDays = (d, n) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + n);
      return copy.toISOString().split('T')[0];
    };

    const autoTasks = [
      {
        id: 'cal_' + Date.now() + '_1',
        creatorId: application.creatorId,
        collaborationId: collabId,
        campaignTitle: application.campaignTitle,
        brandName: application.brandName,
        taskType: 'script_writing',
        title: `Generate & Review Script Draft for ${application.brandName}`,
        dueDate: addDays(today, 3),
        dueTime: '18:00',
        completed: false,
        priority: 'high',
        notes: 'Use CreatorBridge AI Script Writer to draft hook & scenes.'
      },
      {
        id: 'cal_' + Date.now() + '_2',
        creatorId: application.creatorId,
        collaborationId: collabId,
        campaignTitle: application.campaignTitle,
        brandName: application.brandName,
        taskType: 'content_shooting',
        title: `Shoot Content Footage for ${application.brandName}`,
        dueDate: addDays(today, 7),
        dueTime: '12:00',
        completed: false,
        priority: 'high'
      },
      {
        id: 'cal_' + Date.now() + '_3',
        creatorId: application.creatorId,
        collaborationId: collabId,
        campaignTitle: application.campaignTitle,
        brandName: application.brandName,
        taskType: 'content_submission',
        title: `Submit Final Video for Brand Review`,
        dueDate: addDays(today, 10),
        dueTime: '17:00',
        completed: false,
        priority: 'high'
      },
      {
        id: 'cal_' + Date.now() + '_4',
        creatorId: application.creatorId,
        collaborationId: collabId,
        campaignTitle: application.campaignTitle,
        brandName: application.brandName,
        taskType: 'final_publishing',
        title: `Publish Content Live on Socials`,
        dueDate: campaign?.deadline || addDays(today, 14),
        dueTime: '19:00',
        completed: false,
        priority: 'high'
      },
      {
        id: 'cal_' + Date.now() + '_5',
        creatorId: application.creatorId,
        collaborationId: collabId,
        campaignTitle: application.campaignTitle,
        brandName: application.brandName,
        taskType: 'payment_due',
        title: `Payout Release: ₹${application.requestedFee.toLocaleString('en-IN')}`,
        dueDate: addDays(today, 18),
        completed: false,
        priority: 'medium'
      }
    ];

    db.calendarTasks.push(...autoTasks);

    // Notify Creator
    db.notifications.unshift({
      id: 'notif_' + Date.now(),
      userId: application.creatorId,
      title: 'Application Accepted! 🎉',
      message: `${application.brandName} accepted your application for ${application.campaignTitle}! Check your Content Calendar for milestone tasks.`,
      type: 'application',
      isRead: false,
      createdAt: 'Just now',
      linkUrl: '/creator/collaborations'
    });
  }

  writeDB(db);
  res.json({ application: db.applications[appIndex] });
});

// --- Collaborations Routes ---
app.get('/api/collaborations', (req, res) => {
  const db = readDB();
  const { creatorId, brandId } = req.query;
  let collabs = [...db.collaborations];
  if (creatorId) collabs = collabs.filter(c => c.creatorId === creatorId);
  if (brandId) collabs = collabs.filter(c => c.brandId === brandId);
  res.json({ collaborations: collabs });
});

app.get('/api/collaborations/:id', (req, res) => {
  const db = readDB();
  const collab = db.collaborations.find(c => c.id === req.params.id);
  if (!collab) return res.status(404).json({ error: 'Collaboration not found' });
  res.json({ collaboration: collab });
});

app.patch('/api/collaborations/:id/step', (req, res) => {
  const { status, script, submittedContentUrl, submittedContentNotes, revisionFeedback, paymentStatus } = req.body;
  const db = readDB();
  const index = db.collaborations.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Collaboration not found' });

  const collab = db.collaborations[index];
  if (status) collab.status = status;
  if (script) collab.script = script;
  if (submittedContentUrl) collab.submittedContentUrl = submittedContentUrl;
  if (submittedContentNotes) collab.submittedContentNotes = submittedContentNotes;
  if (revisionFeedback !== undefined) collab.revisionFeedback = revisionFeedback;
  if (paymentStatus) collab.paymentStatus = paymentStatus;
  collab.updatedAt = new Date().toISOString();

  // If completed & payment done, create transaction ledger entry
  if (status === 'payment_completed' || paymentStatus === 'paid') {
    collab.paymentStatus = 'paid';
    collab.paidAt = new Date().toISOString();
    collab.transactionId = 'TXN_CB_' + Math.floor(100000 + Math.random() * 900000);

    db.transactions.unshift({
      id: collab.transactionId,
      type: 'payout',
      amount: collab.paymentAmount,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      campaignId: collab.campaignId,
      campaignTitle: collab.campaignTitle,
      counterpartyName: collab.brandName,
      counterpartyRole: 'Brand',
      invoiceNumber: 'INV-' + Date.now().toString().slice(-6)
    });

    db.notifications.unshift({
      id: 'notif_' + Date.now(),
      userId: collab.creatorId,
      title: 'Payment Released! 💰',
      message: `₹${collab.paymentAmount.toLocaleString('en-IN')} has been paid for ${collab.campaignTitle}.`,
      type: 'payment',
      isRead: false,
      createdAt: 'Just now',
      linkUrl: '/creator/earnings'
    });
  }

  writeDB(db);
  res.json({ collaboration: collab });
});

// --- Creator Calendar Tasks ---
app.get('/api/calendar', (req, res) => {
  const db = readDB();
  const { creatorId } = req.query;
  let tasks = [...db.calendarTasks];
  if (creatorId) tasks = tasks.filter(t => t.creatorId === creatorId);
  res.json({ tasks });
});

app.post('/api/calendar', (req, res) => {
  const db = readDB();
  const newTask = {
    id: 'cal_' + Date.now(),
    creatorId: db.currentUser.id,
    collaborationId: req.body.collaborationId,
    campaignTitle: req.body.campaignTitle,
    brandName: req.body.brandName,
    taskType: req.body.taskType || 'personal',
    title: req.body.title,
    dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
    dueTime: req.body.dueTime,
    completed: false,
    priority: req.body.priority || 'medium',
    notes: req.body.notes
  };

  db.calendarTasks.push(newTask);
  writeDB(db);
  res.json({ task: newTask });
});

app.patch('/api/calendar/:id/toggle', (req, res) => {
  const db = readDB();
  const task = db.calendarTasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.completed = !task.completed;
  writeDB(db);
  res.json({ task });
});

app.delete('/api/calendar/:id', (req, res) => {
  const db = readDB();
  db.calendarTasks = db.calendarTasks.filter(t => t.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// --- AI Script Writer (Gemini Integration with Intelligent Brief Follower) ---
app.post('/api/scripts/generate', async (req, res) => {
  const {
    campaignId,
    format = 'Instagram Reel',
    style = 'Storytelling',
    language = 'English',
    customBrief
  } = req.body;

  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === campaignId);

  const brandName = campaign?.brandName || customBrief?.brandName || 'Brand';
  const product = campaign?.product || customBrief?.product || 'Featured Product';
  const objective = campaign?.brief?.objective || customBrief?.objective || 'Showcase product in everyday lifestyle.';
  const keyMessage = campaign?.brief?.keyMessage || customBrief?.keyMessage || 'Premium performance with everyday elegance.';
  const benefits = campaign?.brief?.productBenefits || customBrief?.benefits || ['Easy to use', 'High quality', 'Great value'];
  const specialOffers = campaign?.brief?.specialOffers || customBrief?.specialOffers || 'Special creator community discount with link in bio';
  const requiredCTA = campaign?.brief?.requiredCTA || customBrief?.requiredCTA || 'Check the link in bio to learn more!';
  const brandGuidelines = campaign?.brief?.brandGuidelines || customBrief?.brandGuidelines || 'Authentic aesthetic visuals, high energy pacing.';
  const contentRestrictions = campaign?.brief?.contentRestrictions || customBrief?.contentRestrictions || 'Follow standard advertising guidelines.';

  // Check if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are the lead content scriptwriter for CreatorBridge. You turn brand briefs into viral, high-converting social media scripts.

IMPORTANT RULES:
1. Follow the brand brief strictly. Never fabricate features, discounts, offers or medical claims not provided in the brief.
2. Format: ${format}
3. Style: ${style}
4. Language: ${language}

Brand Info:
- Brand Name: ${brandName}
- Product: ${product}
- Objective: ${objective}
- Key Message: ${keyMessage}
- Benefits: ${benefits.join(', ')}
- Special Offers: ${specialOffers}
- Required CTA: ${requiredCTA}
- Brand Guidelines: ${brandGuidelines}
- Restrictions: ${contentRestrictions}

Return ONLY valid JSON matching this exact structure:
{
  "title": "Creative title for the script",
  "hook": "Attention-grabbing first 3 seconds hook",
  "scenes": [
    {
      "sceneNumber": 1,
      "visual": "Detailed visual directions and camera angle",
      "voiceover": "Spoken dialogue or voiceover",
      "onScreenText": "On-screen text or sticker"
    }
  ],
  "productPlacement": "Instructions on showing product naturally",
  "cta": "Clear call to action as per brief",
  "caption": "Instagram/Social caption with emojis",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            script: {
              id: 'script_' + Date.now(),
              campaignId,
              creatorId: db.currentUser.id,
              ...parsed,
              format,
              style,
              language,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDraft: true,
              disclaimer: 'Draft generated by CreatorBridge AI using Gemini based strictly on the official brand brief. Please review and refine before submitting to the brand.'
            }
          });
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart brief engine:', err.message);
    }
  }

  // Smart domain-tailored generation conforming strictly to the brand brief
  const isHindi = language.toLowerCase().includes('hindi');
  const isKannada = language.toLowerCase().includes('kannada');

  let hookText = `POV: You found the one thing that actually solves ${benefits[0] || 'your daily hassle'}. Watch this.`;
  if (style === 'Entertaining') {
    hookText = `Stop scrolling! If you're still dealing with chaos every single day, you need to see what ${brandName} just did.`;
  } else if (style === 'Informative' || style === 'Educational') {
    hookText = `Here's why ${product} is blowing up right now—and the 3 features that make it stand out.`;
  } else if (style === 'Trend-based') {
    hookText = `Tell me I am not the only one obsessed with ${product}... let me show you why.`;
  }

  if (isHindi) {
    hookText = `अगर आप भी रोज़ के शोर और भागदौड़ से परेशान हैं, तो ${brandName} का ये नया ${product} आपका दिन बदल देगा!`;
  } else if (isKannada) {
    hookText = `ಪ್ರತಿದಿನದ ಗದ್ದಲದಿಂದ ಮುಕ್ತಿ ಬೇಕಾ? ${brandName} ರ ಈ ಹೊಸ ${product} ನೋಡಿ, ನಿಮಗೂ ಇಷ್ಟವಾಗುತ್ತೆ!`;
  }

  const generatedScript = {
    id: 'script_' + Date.now(),
    campaignId: campaignId || 'custom',
    creatorId: db.currentUser.id,
    title: `${style} ${format} for ${brandName} — ${product}`,
    format,
    style,
    language,
    hook: hookText,
    scenes: [
      {
        sceneNumber: 1,
        visual: `High energy opening shot. Creator looks directly at camera with natural lighting. Quick cut transition demonstrating everyday pain point.`,
        voiceover: isHindi
          ? `क्या आप भी हर रोज़ इसी समस्या का सामना करते हैं? लेकिन अब नहीं!`
          : isKannada
          ? `ನೀವು ಕೂಡ ಇದೇ ತೊಂದರೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಾ? ಇನ್ನು ಮುಂದೆ ಇಲ್ಲ!`
          : `We've all been there: chaotic days, constant noise, and zero peace. But look at what arrived today!`,
        onScreenText: `Wait for it... 🤯`
      },
      {
        sceneNumber: 2,
        visual: `Crisp macro b-roll shot holding ${product}. Finger taps feature. Highlight ${benefits[0] || 'the key feature'} in natural action.`,
        voiceover: isHindi
          ? `ये है ${brandName} का ${product}। इसकी सबसे खास बात है ${benefits[0] || 'बेस्ट परफॉर्मेंस'}।`
          : isKannada
          ? `ಇದು ${brandName} ರ ${product}. ಇದರಲ್ಲಿ ಮುಖ್ಯವಾಗಿರೋದು ${benefits[0] || 'ಉತ್ತಮ ಗುಣಮಟ್ಟ'}.`
          : `This is the new ${product} from ${brandName}. Right away, ${benefits[0] || 'the design and performance'} completely stand out.`,
        onScreenText: `${benefits[0] || 'Key Feature'} ⚡️`
      },
      {
        sceneNumber: 3,
        visual: `Lifestyle shot of creator actively using ${product} while smiling. Smooth camera pan showing ${benefits[1] || 'effortless reliability'}.`,
        voiceover: isHindi
          ? `इतना ही नहीं, इसमें आपको मिलता है ${benefits[1] || 'शानदार बैटरी'} और ${keyMessage}।`
          : isKannada
          ? `ಅಷ್ಟೇ ಅಲ್ಲ, ಇದರಲ್ಲಿ ${benefits[1] || 'ದೀರ್ಘ ಬ್ಯಾಟರಿ'} ಮತ್ತು ${keyMessage} ಕೂಡ ಇದೆ.`
          : `Plus, with ${benefits[1] || 'unmatched reliability'}, ${keyMessage}`,
        onScreenText: `Pure Quality • ${keyMessage.slice(0, 30)}`
      },
      {
        sceneNumber: 4,
        visual: `Creator smiles at camera holding up ${product} box. On-screen sticker graphic displaying special offer details.`,
        voiceover: isHindi
          ? `${specialOffers}। अभी बायो में दिए लिंक पर क्लिक करें और ऑफर का फायदा उठाएं!`
          : isKannada
          ? `${specialOffers}. ಈಗಲೇ ಬಯೋದಲ್ಲಿರುವ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಆಫರ್ ಪಡೆದುಕೊಳ್ಳಿ!`
          : `${specialOffers}! ${requiredCTA}`,
        onScreenText: `${specialOffers.slice(0, 40)} 🎁`
      }
    ],
    productPlacement: `Keep ${product} clearly in frame in scene 2 & 3. Ensure logo is upright and visible during unboxing/reveal.`,
    cta: requiredCTA,
    caption: `${keyMessage} ✨ Loving my experience with the new ${product} from @${brandName.toLowerCase().replace(/\s+/g, '')}! ${benefits.join(' • ')}. ${specialOffers}. ${requiredCTA} #CreatorBridge #${brandName.replace(/\s+/g, '')} #Sponsored`,
    hashtags: [
      `#${brandName.replace(/\s+/g, '')}`,
      `#${product.replace(/\s+/g, '').slice(0, 15)}`,
      `#IndianCreators`,
      `#CreatorCollab`,
      `#Ad`
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDraft: true,
    disclaimer: 'Draft generated by CreatorBridge AI Script Writer based strictly on the official brand brief. Please review and personalize before submitting to the brand for approval.'
  };

  res.json({ script: generatedScript });
});

// --- Messages Routes ---
app.get('/api/messages', (req, res) => {
  const db = readDB();
  res.json({
    conversations: db.conversations,
    messages: db.messages
  });
});

app.post('/api/messages', (req, res) => {
  const activeUser = req.user || db.currentUser;
  const { conversationId, text, campaignId, campaignTitle } = req.body;
  const db = readDB();

  if (!db.messages[conversationId]) {
    db.messages[conversationId] = [];
  }

  const newMsg = {
    id: 'm_' + Date.now(),
    conversationId,
    senderId: activeUser.id,
    senderName: activeUser.name,
    senderRole: activeUser.role,
    text,
    timestamp: 'Just now',
    campaignId,
    campaignTitle
  };

  db.messages[conversationId].push(newMsg);

  // Update conversation last message
  const conv = db.conversations.find(c => c.id === conversationId);
  if (conv) {
    conv.lastMessage = text;
    conv.lastMessageTime = 'Just now';
  }

  writeDB(db);
  res.json({ message: newMsg });
});

// --- Payments & Analytics ---
app.get('/api/payments', (req, res) => {
  const db = readDB();
  const transactions = db.transactions || [];

  // Creator stats
  const totalEarnings = transactions
    .filter(t => t.type === 'payout' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = db.collaborations
    .filter(c => c.paymentStatus === 'escrowed')
    .reduce((sum, c) => sum + c.paymentAmount, 0);

  // Brand stats
  const totalSpend = db.brandProfiles[0]?.totalSpend || 1420000;

  res.json({
    transactions,
    creatorMetrics: {
      totalEarnings: totalEarnings || 77000,
      monthlyEarnings: 45000,
      pendingPayments: pendingPayments || 50000,
      completedPayments: totalEarnings || 77000,
      monthlyTrend: [
        { month: 'Jun', earnings: 18000, spend: 120000 },
        { month: 'Jul', earnings: 24000, spend: 180000 },
        { month: 'Aug', earnings: 32000, spend: 240000 },
        { month: 'Sep', earnings: 42000, spend: 310000 },
        { month: 'Oct', earnings: 58000, spend: 450000 },
        { month: 'Nov', earnings: 77000, spend: 520000 }
      ]
    },
    brandMetrics: {
      totalSpend,
      activeCollaborationsCount: db.collaborations.filter(c => c.status !== 'payment_completed').length,
      contentDeliveredCount: 14,
      totalCampaignsCount: db.campaigns.length,
      totalReach: '3.8M',
      totalViews: '2.1M',
      avgEngagement: '6.2%'
    }
  });
});

// --- Notifications ---
app.get('/api/notifications', (req, res) => {
  const db = readDB();
  res.json({ notifications: db.notifications || [] });
});

app.post('/api/notifications/mark-all-read', (req, res) => {
  const db = readDB();
  if (db.notifications) {
    db.notifications.forEach(n => { n.isRead = true; });
  }
  writeDB(db);
  res.json({ success: true });
});

// --- CreatorBridge Creator Membership ---
const DEFAULT_MEMBERSHIP_PLANS = [
  {
    id: "creator_pro",
    name: "Creator Pro",
    original_price: 599,
    discounted_price: 299,
    currency: "INR",
    discount_percentage: 50,
    features: [
      "Unlimited campaign applications",
      "AI Script Writer",
      "30 AI scripts per month",
      "Advanced creator portfolio",
      "Creator analytics",
      "Application tracking",
      "Priority support"
    ]
  },
  {
    id: "creator_premium",
    name: "Creator Premium",
    original_price: 1399,
    discounted_price: 599,
    currency: "INR",
    discount_percentage: 57.18,
    features: [
      "Everything in Creator Pro",
      "100 AI scripts per month",
      "Advanced analytics",
      "Portfolio insights",
      "Profile promotion credits",
      "Priority support",
      "Exclusive creator resources"
    ]
  }
];

const TAX_PERCENTAGE = 18; // 18% GST

app.get('/api/membership/plans', (req, res) => {
  const db = readDB();
  const plans = db.subscriptionPlans || DEFAULT_MEMBERSHIP_PLANS;
  res.json({
    feature: "CreatorBridge Creator Membership",
    taxPercentage: TAX_PERCENTAGE,
    currency: "INR",
    subscription_plans: plans,
    design: {
      theme: "CreatorBridge purple and lavender",
      recommended_plan: "creator_premium",
      premium_plan_highlight: true,
      show_discount_badges: true,
      show_original_price: true,
      show_discounted_price: true
    }
  });
});

// Admin endpoint to update plan pricing
app.put('/api/membership/plans/:id', (req, res) => {
  const db = readDB();
  if (!db.subscriptionPlans) {
    db.subscriptionPlans = JSON.parse(JSON.stringify(DEFAULT_MEMBERSHIP_PLANS));
  }
  const { id } = req.params;
  const { original_price, discounted_price, discount_percentage, features } = req.body;
  const planIndex = db.subscriptionPlans.findIndex(p => p.id === id);
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Subscription plan not found' });
  }

  if (original_price !== undefined) db.subscriptionPlans[planIndex].original_price = Number(original_price);
  if (discounted_price !== undefined) db.subscriptionPlans[planIndex].discounted_price = Number(discounted_price);
  if (discount_percentage !== undefined) {
    db.subscriptionPlans[planIndex].discount_percentage = Number(discount_percentage);
  } else if (original_price && discounted_price) {
    db.subscriptionPlans[planIndex].discount_percentage = Number((((original_price - discounted_price) / original_price) * 100).toFixed(2));
  }
  if (features && Array.isArray(features)) db.subscriptionPlans[planIndex].features = features;

  writeDB(db);
  res.json({ success: true, plan: db.subscriptionPlans[planIndex] });
});

// Calculate checkout quote with taxes based on backend prices
app.post('/api/membership/calculate', (req, res) => {
  const { planId } = req.body;
  const db = readDB();
  const plans = db.subscriptionPlans || DEFAULT_MEMBERSHIP_PLANS;
  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'Invalid subscription plan ID' });
  }

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

// Process membership checkout & activation
app.post('/api/membership/subscribe', (req, res) => {
  const { planId, paymentMethod = 'UPI' } = req.body;
  const db = readDB();
  const plans = db.subscriptionPlans || DEFAULT_MEMBERSHIP_PLANS;
  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'Invalid subscription plan ID' });
  }

  const basePrice = plan.discounted_price;
  const taxAmount = Number(((basePrice * TAX_PERCENTAGE) / 100).toFixed(2));
  const totalAmount = Number((basePrice + taxAmount).toFixed(2));

  const userId = req.user?.id || db.currentUser?.id || 'usr_creator_default';
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

  const subscriptionRecord = {
    planId: plan.id,
    planName: plan.name,
    status: 'active',
    basePrice,
    taxAmount,
    totalAmount,
    currency: plan.currency || 'INR',
    paymentMethod,
    subscribedAt: now.toISOString(),
    expiresAt: expiryDate.toISOString(),
    invoiceNumber: `INV-MEMB-${Date.now().toString().slice(-6)}`
  };

  // Update in user record
  if (db.currentUser && (db.currentUser.id === userId || !req.user)) {
    db.currentUser.membership = subscriptionRecord;
  }
  if (db.users) {
    const u = db.users.find(user => user.id === userId);
    if (u) {
      u.membership = subscriptionRecord;
    }
  }

  // Record audit transaction without affecting campaign earnings
  if (!db.transactions) db.transactions = [];
  db.transactions.unshift({
    id: `tx_${Date.now()}`,
    type: 'membership_subscription',
    amount: totalAmount,
    status: 'completed',
    date: now.toISOString().split('T')[0],
    campaignId: 'membership',
    campaignTitle: `CreatorBridge Membership - ${plan.name}`,
    counterpartyName: 'CreatorBridge Platform',
    counterpartyRole: 'Platform Services',
    invoiceNumber: subscriptionRecord.invoiceNumber
  });

  // Emit in-app notification
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId,
    title: `🎉 ${plan.name} Membership Activated!`,
    message: `You now have access to ${plan.features[0]}, ${plan.features[1]}, and priority benefits.`,
    type: 'system',
    isRead: false,
    createdAt: now.toISOString(),
    linkUrl: '/creator/membership'
  });

  writeDB(db);

  res.json({
    success: true,
    message: `Successfully upgraded to ${plan.name}`,
    subscription: subscriptionRecord
  });
});

// Serve frontend dist build if present
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CreatorBridge API server listening on http://0.0.0.0:${PORT} (http://localhost:${PORT})`);
});
