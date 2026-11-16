import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CreatorProfile } from '../types';
import { REFERENCE_DISCOVER_CREATORS } from '../data/seedData';
import { InviteCreatorModal } from '../components/creators/InviteCreatorModal';
import { ToastContainer } from '../components/common/ToastContainer';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  FileText,
  GitPullRequest,
  MessageSquare,
  BarChart2,
  CreditCard,
  Building2,
  Settings,
  Crown,
  Check,
  CheckCircle2,
  ChevronDown,
  Search,
  Bell,
  Play,
  Camera,
  Heart,
  Grid,
  List,
  MapPin,
  Utensils,
  Sparkles,
  Plane,
  Shirt,
  Dumbbell,
  Laptop,
  Gamepad2,
  MoreHorizontal,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Star,
  X
} from 'lucide-react';

export const DiscoverCreatorsPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { creators, showToast } = useData();
  const navigate = useNavigate();

  // If authenticated user is a creator, redirect to Creator Campaigns discovery
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'creator') {
      navigate('/creator/discover-campaigns', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  // Combine reference creators (prioritized) with any other creators from context
  const allAvailableCreators = useMemo(() => {
    const list = [...REFERENCE_DISCOVER_CREATORS];
    creators.forEach(cr => {
      if (!list.some(r => r.fullName.toLowerCase() === cr.fullName.toLowerCase())) {
        list.push(cr);
      }
    });
    return list;
  }, [creators]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Creators');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedFollowers, setSelectedFollowers] = useState('Any');
  const [selectedViews, setSelectedViews] = useState('Any');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Saved / Bookmarked creators
  const [savedCreators, setSavedCreators] = useState<Record<string, boolean>>({});

  // Invite Modal state
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Categories list matching reference tabs
  const categoryTabs = [
    { name: 'All Creators', icon: Grid },
    { name: 'Food & Beverage', icon: Utensils },
    { name: 'Lifestyle', icon: Sparkles },
    { name: 'Travel', icon: Plane },
    { name: 'Fashion', icon: Shirt },
    { name: 'Fitness', icon: Dumbbell },
    { name: 'Tech', icon: Laptop },
    { name: 'Beauty', icon: Sparkles },
    { name: 'Gaming', icon: Gamepad2 },
    { name: 'Others', icon: MoreHorizontal }
  ];

  // Filter logic
  const filteredCreators = useMemo(() => {
    return allAvailableCreators.filter(cr => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          cr.fullName.toLowerCase().includes(q) ||
          cr.instagramHandle.toLowerCase().includes(q) ||
          cr.location.toLowerCase().includes(q) ||
          cr.categories.some(c => c.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'All Creators') {
        const catTarget = selectedCategory.toLowerCase();
        const matchesCategory = cr.categories.some(c =>
          c.toLowerCase().includes(catTarget) || catTarget.includes(c.toLowerCase())
        );
        if (!matchesCategory) return false;
      }

      // Location
      if (selectedLocation !== 'All') {
        if (!cr.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Followers
      if (selectedFollowers !== 'Any') {
        if (selectedFollowers === '< 100K' && cr.followersCount >= 100000) return false;
        if (selectedFollowers === '100K - 200K' && (cr.followersCount < 100000 || cr.followersCount > 200000)) return false;
        if (selectedFollowers === '> 200K' && cr.followersCount <= 200000) return false;
      }

      return true;
    });
  }, [allAvailableCreators, searchQuery, selectedCategory, selectedLocation, selectedFollowers]);

  const toggleSave = (id: string, name: string) => {
    setSavedCreators(prev => {
      const next = !prev[id];
      showToast(
        next ? 'Creator Saved' : 'Creator Removed',
        next ? `${name} added to your saved creators roster.` : `${name} removed from your saved creators.`
      );
      return { ...prev, [id]: next };
    });
  };

  const handleInvite = (creator: CreatorProfile) => {
    if (!isAuthenticated || !user) {
      showToast('Login Required', 'Please log in as a brand to invite creators.', 'warning');
      navigate('/login', { state: { from: { pathname: '/discover-creators' } } });
      return;
    }
    setSelectedCreator(creator);
    setInviteModalOpen(true);
  };

  // Nav items configuration for left sidebar
  const sidebarNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/brand/dashboard' },
    { label: 'Campaigns', icon: Megaphone, path: '/brand/campaigns' },
    { label: 'Discover Creators', icon: Users, path: '/discover-creators', active: true },
    { label: 'Applications', icon: FileText, path: '/brand/applications', badge: '12' },
    { label: 'Collaborations', icon: GitPullRequest, path: '/brand/collaborations' },
    { label: 'Messages', icon: MessageSquare, path: '/brand/messages', badge: '3' },
    { label: 'Analytics', icon: BarChart2, path: '/brand/analytics' },
    { label: 'Payments', icon: CreditCard, path: '/brand/payments' },
    { label: 'Brand Profile', icon: Building2, path: '/brand/profile' },
    { label: 'Settings', icon: Settings, path: '/brand/settings' }
  ];

  return (
    <div className="flex h-screen w-full bg-[#F4EEFD] text-[#17152F] font-sans antialiased overflow-hidden relative">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-[#EAE8F2] flex flex-col justify-between h-full flex-shrink-0 z-30 select-none">
        <div className="flex flex-col h-full overflow-y-auto scrollbar-none">
          {/* Logo Header */}
          <div className="p-5 pb-3">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#6425E8] to-[#8B5CF6] text-white shadow-md shadow-[#6425E8]/20 group-hover:scale-105 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20.5 7L12 12L3.5 7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-extrabold tracking-tight text-[#17152F] leading-tight">
                  CreatorBridge
                </span>
                <span className="text-[9px] font-bold text-[#77758B] tracking-widest uppercase mt-0.5">
                  COLLABORATION HUB
                </span>
              </div>
            </NavLink>
          </div>

          {/* Active Brand Card: Resto Cafe */}
          <div className="px-4 py-2">
            <div className="p-2.5 rounded-xl bg-white border border-[#EAE8F2] shadow-2xs hover:border-[#6425E8]/30 transition-all flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1A182E] flex items-center justify-center text-amber-400 font-bold text-xs shadow-xs">
                  <Utensils className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#17152F]">Resto Cafe</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB] text-white" />
                  </div>
                  <span className="text-[10px] text-[#77758B] -mt-0.5">Brand Account</span>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-semibold bg-[#EDE7FD] text-[#6425E8] rounded-full">
                      Food & Beverage
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#77758B] group-hover:text-[#17152F] transition-colors" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-1">
            {sidebarNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      item.active || isActive
                        ? 'bg-[#6425E8] text-white shadow-sm shadow-[#6425E8]/25'
                        : 'text-[#77758B] hover:text-[#17152F] hover:bg-[#F2ECFF]/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-[#77758B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Upgrade to Pro Card */}
          <div className="p-3 mt-auto">
            <div className="rounded-2xl p-4 bg-[#F8F6FE] border border-[#E7DEFB] space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <h4 className="text-xs font-bold text-[#17152F]">Upgrade to Pro</h4>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#555368]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#6425E8] flex-shrink-0" />
                  <span>Higher campaign reach</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#6425E8] flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#6425E8] flex-shrink-0" />
                  <span>Priority creator support</span>
                </li>
              </ul>
              <button
                onClick={() => showToast('CreatorBridge Pro', 'Pro tier upgrade checkout is initialized.')}
                className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Upgrade Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#FAFAFF]/90 backdrop-blur-md px-8 py-4 border-b border-[#EAE8F2] flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">
              Discover Creators
            </h1>
            <p className="text-[14px] text-[#77758B] mt-1">
              Find the right content creators for your next campaign.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Pill Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search creators by name, niche, location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-72 sm:w-80 h-[42px] pl-9 pr-8 rounded-full border border-[#EAE8F2] bg-white text-[13px] text-[#17152F] placeholder-[#77758B] focus:outline-none focus:border-[#6425E8] shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Authentication state in header */}
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => showToast('Notifications', 'You have 3 unread messages and 12 campaign applications.')}
                  className="w-10 h-10 rounded-full bg-white border border-[#EAE8F2] flex items-center justify-center text-[#77758B] hover:text-[#17152F] hover:border-[#6425E8]/40 shadow-2xs relative transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444]" />
                </button>

                <div
                  onClick={() => navigate(user.role === 'brand' ? '/brand/dashboard' : '/creator/dashboard')}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-[#EAE8F2] rounded-full shadow-2xs hover:border-[#6425E8]/30 transition-all cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-[13px] font-semibold text-[#17152F]">{user.businessName || user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#77758B]" />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ from: { pathname: '/discover-creators' } }}
                  className="h-[38px] px-4 flex items-center justify-center rounded-full border border-[#EAE8F2] bg-white text-[13px] font-semibold text-[#17152F] hover:border-[#6425E8] hover:text-[#6425E8] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="h-[38px] px-4 flex items-center justify-center rounded-full bg-[#6425E8] hover:bg-[#521dc7] text-white text-[13px] font-bold transition-all shadow-2xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 px-4 md:px-6 2xl:px-8 py-6 space-y-[28px] max-w-[1440px] w-full mx-auto overflow-y-auto">
          {/* ================= PROMO TOP BANNER ================= */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#EDE7FD] via-[#F3EFFF] to-[#EDE5FD] border border-[#E2D8FA] p-6 lg:p-7 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
            {/* Left Content */}
            <div className="space-y-4 max-w-lg z-10">
              <h2 className="text-2xl lg:text-[26px] font-extrabold text-[#17152F] leading-tight">
                Find & Collaborate with <br />
                <span className="text-[#17152F]">Top Content Creators</span>
              </h2>

              {/* Trust Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-white/80 shadow-2xs text-xs font-semibold text-[#17152F]">
                  <Play className="w-3.5 h-3.5 text-[#6425E8] fill-[#6425E8]" />
                  <span>Verified Creators</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-white/80 shadow-2xs text-xs font-semibold text-[#17152F]">
                  <BarChart3 className="w-3.5 h-3.5 text-[#6425E8]" />
                  <span>Real Insights</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-white/80 shadow-2xs text-xs font-semibold text-[#17152F]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6425E8]" />
                  <span>Safe Collaboration</span>
                </div>
              </div>
            </div>

            {/* Center Creator Image with playful sketch lines */}
            <div className="relative flex items-center justify-center z-10 my-2 md:my-0">
              {/* Radiating yellow sketch lines above the camera */}
              <div className="absolute -top-3 left-1/4 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                <svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 28L4 16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M23 26V8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M34 28L42 16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Creator cut-out image */}
              <div className="relative w-48 h-36 md:w-56 md:h-40 flex items-end justify-center">
                <img
                  src="/images/creatorbridge-hero-creator-image.png"
                  alt="CreatorBridge content creator"
                  className="max-h-full object-contain filter drop-shadow-md rounded-xl"
                  onError={(e) => {
                    // Fallback to local crop if needed
                    (e.currentTarget as HTMLImageElement).src = '/hero-creator.jpg';
                  }}
                />
              </div>
            </div>

            {/* Right Purple Card: 10,000+ Verified Creators */}
            <div className="bg-gradient-to-br from-[#6425E8] to-[#7939EF] text-white p-5 rounded-2xl shadow-md min-w-[240px] flex flex-col justify-between z-10">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#6425E8] shadow-xs mb-3">
                <Star className="w-5 h-5 text-[#6425E8] fill-[#6425E8]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">10,000+ Verified Creators</h3>
                <p className="text-[11px] text-purple-100/90 mt-0.5">
                  Across Food, Travel, Lifestyle & more
                </p>
              </div>
            </div>
          </div>

          {/* ================= CATEGORY TABS ================= */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map(cat => {
              const isSelected = selectedCategory === cat.name;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#6425E8] text-white shadow-xs'
                      : 'bg-white border border-[#EAE8F2] text-[#77758B] hover:text-[#17152F] hover:border-[#6425E8]/30 shadow-2xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* ================= FILTER & SORT CONTROLS ================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Left Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Location */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE8F2] rounded-full pl-7 pr-8 py-1.5 text-xs font-semibold text-[#555368] hover:text-[#17152F] focus:outline-none focus:border-[#6425E8] shadow-2xs cursor-pointer"
                >
                  <option value="All">Location: All</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Mysuru">Mysuru</option>
                  <option value="Coorg">Coorg</option>
                </select>
                <MapPin className="w-3.5 h-3.5 text-[#77758B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#77758B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Followers */}
              <div className="relative">
                <select
                  value={selectedFollowers}
                  onChange={e => setSelectedFollowers(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE8F2] rounded-full pl-7 pr-8 py-1.5 text-xs font-semibold text-[#555368] hover:text-[#17152F] focus:outline-none focus:border-[#6425E8] shadow-2xs cursor-pointer"
                >
                  <option value="Any">Followers: Any</option>
                  <option value="< 100K">&lt; 100K</option>
                  <option value="100K - 200K">100K - 200K</option>
                  <option value="> 200K">&gt; 200K</option>
                </select>
                <Users className="w-3.5 h-3.5 text-[#77758B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#77758B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Avg Views */}
              <div className="relative">
                <select
                  value={selectedViews}
                  onChange={e => setSelectedViews(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE8F2] rounded-full pl-7 pr-8 py-1.5 text-xs font-semibold text-[#555368] hover:text-[#17152F] focus:outline-none focus:border-[#6425E8] shadow-2xs cursor-pointer"
                >
                  <option value="Any">Avg. Views: Any</option>
                  <option value="30K+">30K+</option>
                  <option value="50K+">50K+</option>
                  <option value="75K+">75K+</option>
                </select>
                <Play className="w-3.5 h-3.5 text-[#77758B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#77758B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Platform */}
              <div className="relative">
                <select
                  value={selectedPlatform}
                  onChange={e => setSelectedPlatform(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE8F2] rounded-full pl-7 pr-8 py-1.5 text-xs font-semibold text-[#555368] hover:text-[#17152F] focus:outline-none focus:border-[#6425E8] shadow-2xs cursor-pointer"
                >
                  <option value="All">Platform: All</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
                <Camera className="w-3.5 h-3.5 text-[#77758B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#77758B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Right Sort & View Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#EAE8F2] rounded-full px-4 pr-8 py-1.5 text-xs font-semibold text-[#555368] hover:text-[#17152F] focus:outline-none focus:border-[#6425E8] shadow-2xs cursor-pointer"
                >
                  <option value="Relevance">Sort by: Relevance</option>
                  <option value="Followers">Followers: High to Low</option>
                  <option value="Engagement">Engagement Rate</option>
                  <option value="Views">Avg. Views</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#77758B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white border border-[#EAE8F2] rounded-lg p-0.5 shadow-2xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#6425E8] text-white shadow-2xs'
                      : 'text-[#77758B] hover:text-[#17152F]'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#6425E8] text-white shadow-2xs'
                      : 'text-[#77758B] hover:text-[#17152F]'
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ================= CREATORS COUNT ================= */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold text-[#17152F]">
              2,846 Creators Found
            </h3>
            <span className="text-xs text-[#77758B]">
              Showing 1-8 of 2,846 creators
            </span>
          </div>

          {/* ================= 4x2 CREATOR CARDS GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[20px] pb-4">
            {filteredCreators.slice(0, 8).map(creator => {
              const isSaved = !!savedCreators[creator.id];
              // Format category pills string (e.g. "Food • Lifestyle")
              const categoryString = creator.categories.slice(0, 2).join(' • ');

              // Stats formatted
              const followersFormatted =
                creator.followersCount >= 1000
                  ? `${Math.round(creator.followersCount / 1000)}K`
                  : creator.followersCount.toString();
              const viewsFormatted =
                creator.avgViews >= 1000
                  ? `${Math.round(creator.avgViews / 1000)}K`
                  : creator.avgViews.toString();
              const engagementFormatted = `${creator.engagementRate}%`;

              return (
                <div
                  key={creator.id}
                  className="bg-white rounded-[16px] border border-[#EAE8F2] p-[22px] flex flex-col justify-between hover:shadow-card-hover hover:border-[#6425E8]/30 transition-all duration-300 relative group"
                >
                  {/* Top section: Avatar, Verified Badge, Bookmark Heart */}
                  <div>
                    {/* Top right Heart button */}
                    <button
                      onClick={() => toggleSave(creator.id, creator.fullName)}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title={isSaved ? 'Remove from saved' : 'Save creator'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isSaved ? 'text-[#EF4444] fill-[#EF4444]' : 'text-[#77758B]'
                        }`}
                      />
                    </button>

                    {/* Centered Avatar */}
                    <div className="flex flex-col items-center text-center pt-1">
                      <div className="relative mb-2.5">
                        <img
                          src={creator.profilePhoto}
                          alt={creator.fullName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#F2ECFF] shadow-xs group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          <CheckCircle2 className="w-4 h-4 text-[#6425E8] fill-[#6425E8] text-white" />
                        </div>
                      </div>

                      {/* Name with Verified Badge */}
                      <div className="flex items-center gap-1.5 justify-center">
                        <h4 className="text-[16px] font-semibold text-[#17152F] hover:text-[#6425E8] transition-colors cursor-pointer leading-snug"
                            onClick={() => navigate(`/creator-profile/${creator.id}`)}>
                          {creator.fullName}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6425E8] fill-[#6425E8] text-white flex-shrink-0" />
                      </div>

                      {/* Category */}
                      <p className="text-[13px] text-[#77758B] mt-0.5 font-medium">
                        {categoryString}
                      </p>

                      {/* Location */}
                      <p className="text-[12px] text-[#77758B] flex items-center justify-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#77758B]" />
                        <span>{creator.location}</span>
                      </p>
                    </div>

                    {/* 3 Stats Row: Followers, Avg Views, Engagement */}
                    <div className="grid grid-cols-3 gap-1 py-3 my-3 border-y border-[#EAE8F2] text-center">
                      {/* Followers */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-[#17152F]">
                          <Camera className="w-3 h-3 text-[#6425E8]" />
                          <span className="text-[13px] font-bold">{followersFormatted}</span>
                        </div>
                        <span className="text-[11px] text-[#77758B] mt-0.5">Followers</span>
                      </div>

                      {/* Avg Views */}
                      <div className="flex flex-col items-center border-x border-[#EAE8F2]">
                        <div className="flex items-center gap-1 text-[#17152F]">
                          <Play className="w-3 h-3 text-[#6425E8] fill-[#6425E8]" />
                          <span className="text-[13px] font-bold">{viewsFormatted}</span>
                        </div>
                        <span className="text-[11px] text-[#77758B] mt-0.5">Avg. Views</span>
                      </div>

                      {/* Engagement */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-[#17152F]">
                          <BarChart2 className="w-3 h-3 text-[#6425E8]" />
                          <span className="text-[13px] font-bold text-emerald-600">{engagementFormatted}</span>
                        </div>
                        <span className="text-[11px] text-[#77758B] mt-0.5">Engagement</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons: View Profile & Invite to Campaign */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/creator-profile/${creator.id}`)}
                      className="flex-1 h-[38px] px-2.5 rounded-xl border border-[#EAE8F2] bg-white text-[#17152F] text-[13px] font-semibold hover:bg-[#FAFAFF] hover:border-[#6425E8]/30 transition-colors text-center cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleInvite(creator)}
                      className="flex-1 h-[38px] px-2.5 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[13px] font-semibold transition-colors shadow-2xs text-center cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= PAGINATION ================= */}
          <div className="flex items-center justify-center gap-1.5 pt-4 pb-12">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-[#EAE8F2] bg-white text-[#77758B] hover:text-[#17152F] hover:border-gray-300 flex items-center justify-center transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page 1 (Active) */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors shadow-2xs ${
                currentPage === 1
                  ? 'bg-[#6425E8] text-white'
                  : 'bg-white border border-[#EAE8F2] text-[#555368] hover:bg-gray-50'
              }`}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                currentPage === 2
                  ? 'bg-[#6425E8] text-white shadow-2xs'
                  : 'bg-white border border-[#EAE8F2] text-[#555368] hover:bg-gray-50 shadow-2xs'
              }`}
            >
              2
            </button>

            {/* Page 3 */}
            <button
              onClick={() => setCurrentPage(3)}
              className="w-8 h-8 rounded-lg text-xs font-semibold bg-white border border-[#EAE8F2] text-[#555368] hover:bg-gray-50 flex items-center justify-center transition-colors shadow-2xs"
            >
              3
            </button>

            {/* Page 4 */}
            <button
              onClick={() => setCurrentPage(4)}
              className="w-8 h-8 rounded-lg text-xs font-semibold bg-white border border-[#EAE8F2] text-[#555368] hover:bg-gray-50 flex items-center justify-center transition-colors shadow-2xs"
            >
              4
            </button>

            {/* Page 5 */}
            <button
              onClick={() => setCurrentPage(5)}
              className="w-8 h-8 rounded-lg text-xs font-semibold bg-white border border-[#EAE8F2] text-[#555368] hover:bg-gray-50 flex items-center justify-center transition-colors shadow-2xs"
            >
              5
            </button>

            {/* Ellipsis */}
            <span className="w-6 text-center text-xs text-[#77758B]">...</span>

            {/* Page 58 */}
            <button
              onClick={() => setCurrentPage(58)}
              className="w-8 h-8 rounded-lg text-xs font-semibold bg-white border border-[#EAE8F2] text-[#555368] hover:bg-gray-50 flex items-center justify-center transition-colors shadow-2xs"
            >
              58
            </button>

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(58, p + 1))}
              className="w-8 h-8 rounded-lg border border-[#EAE8F2] bg-white text-[#77758B] hover:text-[#17152F] hover:border-gray-300 flex items-center justify-center transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      <InviteCreatorModal
        creator={selectedCreator}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};
