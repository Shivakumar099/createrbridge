import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { CampaignDetailsModal } from '../components/campaigns/CampaignDetailsModal';
import { ToastContainer } from '../components/common/ToastContainer';
import { AuthModal } from '../components/common/AuthModal';
import { Campaign } from '../types';
import { formatINR } from '../utils/helpers';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  IndianRupee,
  Layers,
  X,
  Calendar,
  Check
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export const DiscoverCampaignsPage: React.FC = () => {
  const { campaigns, showToast } = useData();
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [minBudget, setMinBudget] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyInitially, setApplyInitially] = useState(false);

  const categories = [
    'All',
    'Food & Beverage',
    'Lifestyle',
    'Fashion',
    'Travel',
    'Fitness',
    'Technology',
    'Beauty',
    'Others'
  ];

  const platforms = ['All', 'Instagram', 'YouTube', 'YouTube Shorts'];

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(camp => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          camp.title.toLowerCase().includes(q) ||
          camp.brandName.toLowerCase().includes(q) ||
          camp.product.toLowerCase().includes(q) ||
          camp.category.toLowerCase().includes(q) ||
          camp.location.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        if (!camp.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Platform filter
      if (selectedPlatform !== 'All') {
        if (!camp.platforms.some(p => p.toLowerCase().includes(selectedPlatform.toLowerCase()))) {
          return false;
        }
      }

      // Min Budget
      if (minBudget > 0 && camp.creatorPayment < minBudget) {
        return false;
      }

      // Location filter
      if (locationFilter && !camp.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [campaigns, searchQuery, selectedCategory, selectedPlatform, minBudget, locationFilter]);

  const handleViewDetails = (c: Campaign) => {
    setSelectedCampaign(c);
    setApplyInitially(false);
    setDetailsModalOpen(true);
  };

  const handleApplyNow = (c: Campaign) => {
    if (!isAuthenticated || !user) {
      showToast('Login Required', 'Please log in as a creator to apply for campaigns.', 'warning');
      navigate('/login', { state: { from: { pathname: '/discover-campaigns' } } });
      return;
    }
    if (role === 'brand') {
      showToast('Creator Action', 'Only content creators can apply for campaigns.', 'info');
      return;
    }
    setSelectedCampaign(c);
    setApplyInitially(true);
    setDetailsModalOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPlatform('All');
    setMinBudget(0);
    setLocationFilter('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col overflow-x-hidden relative selection:bg-[#6425E8] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-6 2xl:px-8 py-8 space-y-[28px] animate-fade-in">
        {/* Header Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#6425E8] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Direct Brand Collaborations
          </div>
          <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">
            Discover Paid Campaigns
          </h1>
          <p className="text-[14px] text-[#77758B] max-w-2xl leading-relaxed">
            Browse verified collaboration briefs from India's leading consumer brands. Review deliverables, submit your pitch, and secure guaranteed payouts.
          </p>
        </div>

        {/* Search Bar & Advanced Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#77758B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by campaign title, brand, product, category, or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-[46px] pl-11 pr-10 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] placeholder-[#77758B]/70 focus:outline-none focus:border-[#6425E8] shadow-subtle"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77758B] hover:text-[#17152F]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`h-[46px] flex items-center justify-center gap-2 px-5 rounded-xl border text-[14px] font-semibold transition-all shadow-subtle cursor-pointer ${
              showAdvancedFilters || minBudget > 0 || locationFilter || selectedPlatform !== 'All'
                ? 'bg-[#6425E8] text-white border-[#6425E8]'
                : 'bg-white text-[#17152F] border-[#EAE8F2] hover:border-[#6425E8]/40'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Advanced Filters</span>
            {(minBudget > 0 || locationFilter || selectedPlatform !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 text-[13px] px-4 py-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6425E8] text-white border-[#6425E8] shadow-sm'
                    : 'bg-white text-[#77758B] border-[#EAE8F2] hover:border-[#6425E8]/40 hover:text-[#17152F]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Expandable Advanced Filters Tray */}
        {showAdvancedFilters && (
          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-down text-[13px]">
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">
                Minimum Creator Payment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={5000}
                  value={minBudget}
                  onChange={e => setMinBudget(Number(e.target.value))}
                  className="flex-1 accent-[#6425E8]"
                />
                <span className="font-bold text-[#17152F] min-w-[70px] text-right">
                  {minBudget === 0 ? 'Any' : formatINR(minBudget)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">
                Social Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={e => setSelectedPlatform(e.target.value)}
                className="w-full h-[46px] px-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
              >
                {platforms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Bengaluru, Delhi..."
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full h-[46px] px-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
              />
            </div>
          </div>
        )}

        {/* Results Counter and Active Filter summary */}
        <div className="flex items-center justify-between text-[13px] text-[#77758B]">
          <span>Showing <strong className="text-[#17152F] font-semibold">{filteredCampaigns.length}</strong> campaigns available</span>
          {(searchQuery || selectedCategory !== 'All' || minBudget > 0 || locationFilter || selectedPlatform !== 'All') && (
            <button
              onClick={clearAllFilters}
              className="text-[#6425E8] font-semibold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Campaign Cards Grid: 3 on desktop, 2 on tablet, 1 on mobile */}
        {filteredCampaigns.length === 0 ? (
          <div className="p-16 rounded-[16px] bg-white border border-[#EAE8F2] text-center space-y-3">
            <Layers className="w-10 h-10 text-[#77758B] mx-auto" />
            <h3 className="text-[16px] font-semibold text-[#17152F]">No campaigns match your filters</h3>
            <p className="text-[14px] text-[#77758B] max-w-sm mx-auto">
              Try adjusting your category selection or minimum fee threshold to explore more brand deals.
            </p>
            <button
              onClick={clearAllFilters}
              className="h-[42px] px-5 text-[14px] font-semibold rounded-xl bg-[#F2ECFF] text-[#6425E8] hover:bg-[#6425E8] hover:text-white transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            {filteredCampaigns.map(camp => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onViewDetails={handleViewDetails}
                onApplyNow={handleApplyNow}
              />
            ))}
          </div>
        )}
      </main>

      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        openApplyInitially={applyInitially}
      />
      <ToastContainer />
      <AuthModal />
    </div>
  );
};
