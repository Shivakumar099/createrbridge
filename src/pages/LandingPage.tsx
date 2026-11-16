import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/layout/Navbar';
import { CampaignDetailsModal } from '../components/campaigns/CampaignDetailsModal';
import { CreatorCard } from '../components/creators/CreatorCard';
import { InviteCreatorModal } from '../components/creators/InviteCreatorModal';
import { ToastContainer } from '../components/common/ToastContainer';
import { AuthModal } from '../components/common/AuthModal';
import { Campaign, CreatorProfile } from '../types';
import {
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  CheckCircle,
  ChevronDown,
  Star,
  Users,
  Search,
  Send,
  Handshake,
  Bookmark,
  MapPin,
  Heart,
  BarChart2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role, openAuthModal } = useAuth();
  const { campaigns, creators } = useData();
  const navigate = useNavigate();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyInitially, setApplyInitially] = useState(false);

  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [savedCards, setSavedCards] = useState<Record<string, boolean>>({});

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleBrandClick = () => {
    if (isAuthenticated && role === 'brand') {
      navigate('/brand/dashboard');
    } else {
      navigate('/signup/brand');
    }
  };

  const handleCreatorClick = () => {
    if (isAuthenticated && role === 'creator') {
      navigate('/creator/dashboard');
    } else {
      navigate('/signup/creator');
    }
  };

  const handleViewDetails = (c: Campaign) => {
    setSelectedCampaign(c);
    setApplyInitially(false);
    setDetailsModalOpen(true);
  };

  const handleApplyNow = (c: Campaign) => {
    setSelectedCampaign(c);
    setApplyInitially(true);
    setDetailsModalOpen(true);
  };

  const handleInvite = (cr: CreatorProfile) => {
    setSelectedCreator(cr);
    setInviteModalOpen(true);
  };

  const toggleSaveCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Top 3 popular campaigns strictly matching the reference mockup
  const popularCampaigns = [
    campaigns.find(c => c.id === 'camp_freshhydro') || {
      id: 'camp_freshhydro',
      brandId: 'brand_freshhydro',
      brandName: 'FreshHydro',
      brandLogo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=120&q=80',
      title: 'Promote Our Water Bottle',
      product: 'FreshHydro Insulated Glass Flask',
      description: 'Create aesthetic daily hydration reels showing temperature retention and sleek minimalist design on desk setups.',
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
      status: 'active' as const,
      bannerImage: '/thumb-water-bottle.jpg',
      applicantsCount: 18,
      selectedCreatorsCount: 4,
      createdAt: '2026-11-10'
    },
    campaigns.find(c => c.id === 'camp_urbanbites') || {
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
      status: 'active' as const,
      bannerImage: '/thumb-cafe.jpg',
      applicantsCount: 32,
      selectedCreatorsCount: 5,
      createdAt: '2026-11-10'
    },
    campaigns.find(c => c.id === 'camp_glowskin') || {
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
        location: 'Delhi'
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
      status: 'active' as const,
      bannerImage: '/thumb-skincare.jpg',
      applicantsCount: 24,
      selectedCreatorsCount: 4,
      createdAt: '2026-11-10'
    }
  ];

  const faqs = [
    {
      q: 'How does CreatorBridge protect brand payments and creator earnings?',
      a: 'We use automated escrow milestones. When a brand selects a creator, campaign funds are deposited into secure escrow. Creators shoot and upload content knowing their payment is guaranteed. Once the brand reviews and approves the deliverable, funds are instantly released to the creator.'
    },
    {
      q: 'How does the AI Script Writer adhere to official brand guidelines?',
      a: 'Our AI Script Writer directly ingests the brand’s campaign brief—including objective, product benefits, required CTA, and legal restrictions. It crafts scene-by-scene hooks and dialogue without inventing fictional discounts or medical claims. Creators can edit every scene before submitting to the brand.'
    },
    {
      q: 'Can creators track multiple brand deliverables on CreatorBridge?',
      a: 'Yes! CreatorBridge features an integrated Content Calendar that automatically creates milestone tasks (Script Writing, Shooting, Editing, Submission, Publishing) whenever an application is accepted. Creators can view by month, week, day, or list.'
    },
    {
      q: 'Is there a minimum follower requirement for creators to join?',
      a: 'CreatorBridge welcomes both micro-influencers (10K+ followers) and macro creators (1M+). Brands specify their follower and engagement preferences per campaign, allowing high-converting niche creators to thrive.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4EEFD] flex flex-col overflow-x-hidden relative selection:bg-brand-primary selection:text-white">
      {/* SEAMLESS FULL-SCREEN LAVENDER BACKGROUND ACCENTS MATCHING REFERENCE DESIGN */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none">
        {/* Top-Right Large Soft Purple / Lavender Backdrop for Hero */}
        <div 
          className="absolute -top-10 right-0 w-[880px] xl:w-[1050px] h-[720px] rounded-bl-[200px] bg-gradient-to-bl from-[#E4D5FE] via-[#ECE0FE] to-[#F5EEFF] opacity-95"
        />

        {/* Mid-Section Ambient Lavender Glow */}
        <div 
          className="absolute top-[320px] right-10 w-[500px] h-[440px] rounded-full bg-[#E8DCFE]/75 blur-2xl"
        />

        {/* Bottom-Left Organic Lavender Curve behind Popular Campaigns */}
        <div 
          className="absolute top-[440px] -left-20 w-[520px] h-[480px] rounded-r-[200px] bg-gradient-to-tr from-[#E4D5FE] via-[#EDE4FE] to-transparent opacity-90 blur-lg"
        />

        {/* Bottom-Right Organic Lavender Accent */}
        <div 
          className="absolute top-[500px] -right-16 w-[440px] h-[400px] rounded-l-[180px] bg-gradient-to-tl from-[#E8DBFE] via-[#F0E6FE] to-transparent opacity-85 blur-xl"
        />
      </div>

      <Navbar />

      {/* HERO SECTION MATCHING REFERENCE EXACTLY */}
      <section className="relative pt-6 pb-8 sm:pt-10 sm:pb-12 bg-transparent">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 2xl:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-20 items-center">
            {/* Left Column: Bold Headline, Subtitle, Two Pill Buttons, and 10K+ Avatars */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-extrabold text-content-primary tracking-tight leading-[1.08]">
                Connect.<br />
                Collaborate. <span className="text-brand-primary">Grow.</span>
              </h1>

              <p className="text-base sm:text-lg text-content-secondary max-w-lg leading-relaxed font-normal">
                India's easiest platform for brands and content creators to work together.
              </p>

              {/* Two Primary Pill Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleBrandClick}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-brand-primary hover:bg-[#521dc4] text-white font-semibold text-base transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  I'm a Brand <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCreatorClick}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white hover:bg-brand-light/60 text-content-primary border-2 border-brand-primary/60 hover:border-brand-primary font-semibold text-base transition-all cursor-pointer shadow-xs transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  I'm a Creator <ArrowRight className="w-4 h-4 text-brand-primary" />
                </button>
              </div>

              {/* Creator Avatars & 10K+ Social Proof */}
              <div className="pt-2 flex items-center gap-3.5">
                <div className="flex -space-x-2.5">
                  <img
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover shadow-2xs"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Creator"
                  />
                  <img
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover shadow-2xs"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Creator"
                  />
                  <img
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover shadow-2xs"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                    alt="Creator"
                  />
                  <img
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover shadow-2xs"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                    alt="Creator"
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-sm sm:text-base font-extrabold text-content-primary">10K+</div>
                  <div className="text-xs text-content-secondary font-medium">Creators & Brands</div>
                </div>
              </div>
            </div>

            {/* Right Column: Exact Creator Visual from Reference Mockup */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              <div className="relative w-full max-w-[620px] xl:max-w-[700px] flex items-center justify-center">
                <img
                  src="/images/creatorbridge-hero-creator-image.png"
                  alt="CreatorBridge content creator"
                  className="hero-image w-full h-auto object-contain select-none transition-transform duration-300 hover:scale-[1.01]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hero-creator-showcase.png";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS? SECTION MATCHING REFERENCE EXACTLY */}
      <section id="how-it-works" className="py-10 sm:py-14 bg-transparent">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 2xl:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-content-primary tracking-tight">
              How It Works?
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5 text-left flex-1 min-w-[200px]">
              <div className="w-8 h-8 rounded-full bg-[#E4D5FE] text-brand-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                1
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-content-primary">
                  <Search className="w-4 h-4 text-brand-primary" />
                  <span>Discover Opportunities</span>
                </div>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-[240px]">
                  Find relevant campaigns from leading brands.
                </p>
              </div>
            </div>

            {/* Purple Arrow Connector 1 */}
            <div className="hidden md:flex text-brand-secondary/70 font-bold text-lg px-2">
              →
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5 text-left flex-1 min-w-[200px]">
              <div className="w-8 h-8 rounded-full bg-[#E4D5FE] text-brand-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                2
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-content-primary">
                  <Send className="w-4 h-4 text-brand-primary" />
                  <span>Apply or Invite</span>
                </div>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-[240px]">
                  Creators apply or brands invite the best creators.
                </p>
              </div>
            </div>

            {/* Purple Arrow Connector 2 */}
            <div className="hidden md:flex text-brand-secondary/70 font-bold text-lg px-2">
              →
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 text-left flex-1 min-w-[200px]">
              <div className="w-8 h-8 rounded-full bg-[#E4D5FE] text-brand-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                3
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-content-primary">
                  <CheckCircle className="w-4 h-4 text-brand-primary" />
                  <span>Collaborate & Grow</span>
                </div>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-[240px]">
                  Create amazing content and grow together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CAMPAIGNS SECTION MATCHING REFERENCE EXACTLY */}
      <section className="relative py-10 sm:py-14 bg-transparent">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 2xl:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-content-primary tracking-tight">
              Popular Campaigns
            </h2>

            <Link
              to="/discover-campaigns"
              className="text-xs sm:text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 Horizontal Campaign Cards from Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {popularCampaigns.map((camp, idx) => {
              const isSaved = !!savedCards[camp.id];
              // Specific duration tags matching mockup
              const durationTags = ['₹15K • 7 Days', '₹25K • 10 Days', '₹20K • 8 Days'];
              const currentTag = durationTags[idx] || `₹${camp.creatorPayment / 1000}K • 7 Days`;

              return (
                <div
                  key={camp.id}
                  onClick={() => handleViewDetails(camp)}
                  className="bg-white rounded-2xl border border-[#E4DAF8] shadow-md shadow-purple-950/5 hover:shadow-xl hover:border-brand-primary/50 p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                >
                  {/* Left Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                    <img
                      src={camp.bannerImage}
                      alt={camp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // High-res Unsplash fallback matching product category
                        const fallbacks = [
                          'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
                          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
                        ];
                        (e.target as HTMLImageElement).src = fallbacks[idx] || fallbacks[0];
                      }}
                    />
                  </div>

                  {/* Right Details */}
                  <div className="flex-1 min-w-0 pr-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FEF3C7] text-[#92400E]">
                        {currentTag}
                      </span>
                      <button
                        onClick={(e) => toggleSaveCard(camp.id, e)}
                        className="text-content-muted hover:text-brand-primary p-0.5"
                        title={isSaved ? 'Saved' : 'Save'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-primary text-brand-primary' : ''}`} />
                      </button>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-content-primary truncate group-hover:text-brand-primary transition-colors">
                      {camp.title}
                    </h3>

                    <div className="text-[11px] sm:text-xs text-content-secondary space-y-0.5 font-medium">
                      <div className="truncate">
                        {camp.brandName}
                      </div>
                      <div className="flex items-center gap-1 truncate text-content-muted">
                        <MapPin className="w-3 h-3 text-content-muted flex-shrink-0" />
                        <span>{camp.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED CREATORS SECTION */}
      <section className="py-12 sm:py-14 bg-white border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                <Users className="w-4 h-4" /> Verified Roster
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
                Featured Content Creators
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary mt-1">
                Collaborate with top influencers across Fashion, Tech, Food, and Fitness.
              </p>
            </div>

            <Link
              to="/discover-creators"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-surface-border text-xs font-bold text-brand-primary hover:border-brand-primary transition-colors shadow-xs"
            >
              Discover 1,000+ Creators
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.slice(0, 3).map(creator => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onInvite={handleInvite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CREATORBRIDGE DUAL VALUE PROPOSITION */}
      <section id="for-brands" className="py-12 sm:py-14 bg-surface-bg border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Built For Both Sides
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary mt-1">
              Why Choose CreatorBridge?
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-1.5">
              Designed from the ground up for seamless communication, clear expectations, and guaranteed payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* For Brands */}
            <div className="p-7 sm:p-8 rounded-2xl bg-white border border-surface-border shadow-xs hover:border-brand-primary/40 transition-all space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-content-primary">Benefits for Brands</h3>
                    <p className="text-xs text-content-secondary">Maximize creator ROI without agency markup</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-content-primary block">Multi-Step Campaign Wizard:</strong>
                      <span className="text-content-secondary">Launch detailed briefs with deliverables, budgets, and timeline constraints in 5 minutes.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-content-primary block">Verified Creator Analytics:</strong>
                      <span className="text-content-secondary">Real follower counts, verified engagement rates, and authentic past collaboration reviews.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-content-primary block">100% Escrow Peace of Mind:</strong>
                      <span className="text-content-secondary">Payments are held safely in escrow and only released after your review and approval.</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBrandClick}
                className="w-full py-3 rounded-full bg-brand-primary text-white font-semibold text-xs hover:bg-[#521dc4] transition-all shadow-md shadow-brand-primary/20"
              >
                Start Hiring Creators as a Brand
              </button>
            </div>

            {/* For Creators */}
            <div id="for-creators" className="p-7 sm:p-8 rounded-2xl bg-white border border-surface-border shadow-xs hover:border-brand-primary/40 transition-all space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-content-primary">Benefits for Creators</h3>
                    <p className="text-xs text-content-secondary">Get consistent brand deals and never chase invoices</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-content-primary block">AI Script Writer:</strong>
                      <span className="text-content-secondary">Transform official brand briefs into high-converting scene-by-scene scripts in English, Hindi & Kannada.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-content-primary block">Automated Content Calendar:</strong>
                      <span className="text-content-secondary">Accepted campaigns automatically schedule shooting, editing, and submission deadlines on your calendar.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-content-primary block">Guaranteed On-Time Payouts:</strong>
                      <span className="text-content-secondary">No 90-day invoice delays. Direct deposit to your Indian bank account upon content approval.</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreatorClick}
                className="w-full py-3 rounded-full bg-brand-primary text-white font-semibold text-xs hover:bg-[#521dc4] transition-all shadow-md shadow-brand-primary/20"
              >
                Join as a Content Creator
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-12 sm:py-14 bg-white border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Success Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary mt-1">
              Loved by Top Marketers and Creators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-surface-border bg-surface-bg flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">
                  "CreatorBridge eliminated 80% of our influencer outreach back-and-forth. The brief-to-script workflow means our creators stay on-brand every single time."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-surface-border/60">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Vikram Sethi"
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-content-primary">Vikram Sethi</h4>
                  <p className="text-[10px] text-content-muted">Growth Partnerships, boAt</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-surface-border bg-surface-bg flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">
                  "The AI Script Writer is gold! It takes the campaign requirements and drafts the first 3 seconds hook instantly. I have closed ₹1.8 Lakhs in collaborations this month alone."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-surface-border/60">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Tanya Sharma"
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-content-primary">Tanya Sharma</h4>
                  <p className="text-[10px] text-content-muted">485K Followers • Fashion Creator</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-surface-border bg-surface-bg flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">
                  "The Content Calendar organizes all my active brand deals so I never miss a shooting day or submission deadline. Escrow payments hit my account the day content goes live."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-surface-border/60">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                  alt="Arjun Nair"
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-content-primary">Arjun Nair</h4>
                  <p className="text-[10px] text-content-muted">620K Followers • Fitness Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-12 sm:py-14 bg-surface-bg border-t border-surface-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Got Questions?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-surface-border rounded-xl bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm font-bold text-content-primary hover:text-brand-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-content-secondary leading-relaxed border-t border-surface-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-content-primary text-white pt-14 pb-10 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            {/* Column 1: Brand */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-white">
                  Creator<span className="text-brand-secondary">Bridge</span>
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                India's premier marketplace bridging businesses and content creators with streamlined workflows, AI script writing, and secure escrow.
              </p>
            </div>

            {/* Column 2: Platform */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm mb-3">Platform</h4>
              <p><Link to="/discover-campaigns" className="text-white/70 hover:text-white">Discover Campaigns</Link></p>
              <p><Link to="/discover-creators" className="text-white/70 hover:text-white">Discover Creators</Link></p>
              <p><Link to="/creator/ai-script-writer" className="text-white/70 hover:text-white">AI Script Writer</Link></p>
              <p><Link to="/creator/calendar" className="text-white/70 hover:text-white">Content Calendar</Link></p>
            </div>

            {/* Column 3: Solutions */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm mb-3">Solutions</h4>
              <p><button onClick={handleBrandClick} className="text-white/70 hover:text-white text-left">For Brands & D2C</button></p>
              <p><button onClick={handleCreatorClick} className="text-white/70 hover:text-white text-left">For Creators & Influencers</button></p>
              <p><a href="#how-it-works" className="text-white/70 hover:text-white">Escrow Payment Security</a></p>
              <p><a href="#how-it-works" className="text-white/70 hover:text-white">Brand Brief Engine</a></p>
            </div>

            {/* Column 4: Contact & Location */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm mb-3">Headquarters</h4>
              <p className="text-white/70">CreatorBridge Technologies Pvt. Ltd.</p>
              <p className="text-white/70">Indiranagar 100ft Road, Bengaluru, KA 560038</p>
              <p className="text-white/70">support@creatorbridge.in</p>
              <p className="text-white/70">+91 (80) 4920-1122</p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p>© {new Date().getFullYear()} CreatorBridge. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Escrow Terms</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        openApplyInitially={applyInitially}
      />
      <InviteCreatorModal
        creator={selectedCreator}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};
