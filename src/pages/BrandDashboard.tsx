import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Campaign, CreatorProfile } from '../types';
import { CampaignDetailsModal } from '../components/campaigns/CampaignDetailsModal';
import { InviteCreatorModal } from '../components/creators/InviteCreatorModal';
import {
  Megaphone,
  Users,
  Target,
  ArrowUpRight,
  SlidersHorizontal,
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  Package,
  Zap,
  Info,
  TrendingUp,
  TrendingDown,
  ChevronsUpDown,
  Share2,
  Sparkles,
  Rocket,
  Gift
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const BrandDashboard: React.FC = () => {
  const { user } = useAuth();
  const { campaigns, collaborations, creators } = useData();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Table interactive state
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [campaignToggles, setCampaignToggles] = useState<Record<string, boolean>>({
    'c1': true,
    'c2': false,
    'c3': true,
    'c4': true,
    'c5': false
  });

  const toggleCampaign = (id: string) => {
    setCampaignToggles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Forecast Spline Chart Data matching reference curve shape
  const forecastData = [
    { month: 'Apr', revenue: 78000, spend: 90000 },
    { month: 'May', revenue: 64000, spend: 110000 },
    { month: 'Jun', revenue: 145000, spend: 45000 },
    { month: 'Jul', revenue: 52000, spend: 125000 },
    { month: 'Aug', revenue: 84000, spend: 65000 },
    { month: 'Sep', revenue: 132000, spend: 135000 },
    { month: 'Oct', revenue: 72000, spend: 85000 },
  ];

  // Campaign Performance Table Items matching screenshot
  const performanceRows = [
    {
      id: 'c1',
      name: 'New Feature Announcement',
      type: 'Product Update',
      icon: Package,
      iconColor: 'text-[#F59E0B]',
      status: 'Completed',
      statusColor: 'bg-[#ECFDF5] text-[#10B981]',
      dotColor: 'bg-[#10B981]',
      audience: '34,560',
      ctr: '15%',
      revenue: '$12.4K',
      progress: 82
    },
    {
      id: 'c2',
      name: '24-Hour Flash Sale',
      type: 'Automation',
      icon: Zap,
      iconColor: 'text-[#3B82F6]',
      status: 'Draft',
      statusColor: 'bg-[#F3F4F6] text-[#6B7280]',
      dotColor: 'bg-[#6B7280]',
      audience: '4,156',
      ctr: '12%',
      revenue: '$8.7K',
      progress: 28
    },
    {
      id: 'c3',
      name: 'Summer Influencer Blast',
      type: 'Social Media',
      icon: Megaphone,
      iconColor: 'text-[#8B5CF6]',
      status: 'Completed',
      statusColor: 'bg-[#ECFDF5] text-[#10B981]',
      dotColor: 'bg-[#10B981]',
      audience: '89,200',
      ctr: '18.4%',
      revenue: '$34.2K',
      progress: 94
    },
    {
      id: 'c4',
      name: 'Mobile App Launch',
      type: 'Product Launch',
      icon: Rocket,
      iconColor: 'text-[#EC4899]',
      status: 'Active',
      statusColor: 'bg-[#F2ECFF] text-[#6425E8]',
      dotColor: 'bg-[#6425E8]',
      audience: '54,300',
      ctr: '16.2%',
      revenue: '$22.6K',
      progress: 68
    },
    {
      id: 'c5',
      name: 'Festive Festive Promo',
      type: 'Seasonal Promo',
      icon: Gift,
      iconColor: 'text-[#10B981]',
      status: 'Draft',
      statusColor: 'bg-[#F3F4F6] text-[#6B7280]',
      dotColor: 'bg-[#6B7280]',
      audience: '18,900',
      ctr: '11.5%',
      revenue: '$15.3K',
      progress: 42
    }
  ];

  const filteredRows = performanceRows.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          row.type.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || row.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-[28px] animate-fade-in select-none">
        
        {/* Top Header: Dashboard Overview + Action Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[30px] font-bold text-[#17152F] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-[14px] text-[#77758B] mt-0.5">
              Get a clear view of your workforce and the latest HR insights
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter Slider Icon Button */}
            <button
              type="button"
              className="w-[38px] h-[38px] rounded-xl border border-[#EAE8F2] bg-white hover:bg-[#FAFAFC] flex items-center justify-center text-[#555368] hover:text-[#17152F] transition-colors shadow-2xs cursor-pointer"
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Date Picker Button */}
            <button
              type="button"
              className="h-[38px] px-3.5 rounded-xl border border-[#EAE8F2] bg-white hover:bg-[#FAFAFC] flex items-center gap-2 text-[13px] font-semibold text-[#17152F] transition-colors shadow-2xs cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#77758B]" />
              <span>August 27, 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#77758B]" />
            </button>

            {/* Region Dropdown Button */}
            <button
              type="button"
              className="h-[38px] px-3.5 rounded-xl border border-[#EAE8F2] bg-white hover:bg-[#FAFAFC] flex items-center gap-1.5 text-[13px] font-semibold text-[#17152F] transition-colors shadow-2xs cursor-pointer"
            >
              <span>Region: Global</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#77758B]" />
            </button>
          </div>
        </div>

        {/* ROW 1: 3 KPI Cards matching exact Reference visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          
          {/* Card 1: Total Campaign Reach (Featured Dark Purple Gradient) */}
          <div className="p-[22px] rounded-[20px] bg-gradient-to-br from-[#1E0638] via-[#380E64] to-[#551690] text-white shadow-card relative overflow-hidden flex flex-col justify-between min-h-[168px]">
            {/* Subtle glow orb */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#8B5CF6]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  <Megaphone className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-medium text-white/90">
                  Total Campaign Reach
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/70" />
            </div>

            <div className="my-2 relative z-10">
              <span className="text-[34px] font-bold tracking-tight text-white leading-none">
                8.64%
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px] relative z-10">
              <span className="font-semibold text-white/90 flex items-center gap-1">
                <span>▲</span> +10.6% vs last month
              </span>
              <Info className="w-3.5 h-3.5 text-white/50 cursor-pointer" />
            </div>
          </div>

          {/* Card 2: Total Leads (White Card with Mint Badge) */}
          <div className="p-[22px] rounded-[20px] bg-white border border-[#EAE8F2] shadow-subtle flex flex-col justify-between min-h-[168px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E6F7F0] text-[#059669] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-medium text-[#17152F]">
                  Total Leads
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9CA3AF]" />
            </div>

            <div className="my-2">
              <span className="text-[34px] font-bold tracking-tight text-[#17152F] leading-none">
                12,480
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#EF4444] flex items-center gap-1">
                <span>▼</span> -2.09% vs last month
              </span>
              <Info className="w-3.5 h-3.5 text-[#9CA3AF] cursor-pointer" />
            </div>
          </div>

          {/* Card 3: Conversion Rate (White Card with Peach Badge) */}
          <div className="p-[22px] rounded-[20px] bg-white border border-[#EAE8F2] shadow-subtle flex flex-col justify-between min-h-[168px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FFF4E6] text-[#D97706] flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-medium text-[#17152F]">
                  Conversion Rate
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9CA3AF]" />
            </div>

            <div className="my-2">
              <span className="text-[34px] font-bold tracking-tight text-[#17152F] leading-none">
                8.64%
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#10B981] flex items-center gap-1">
                <span>▲</span> +6.32% vs last month
              </span>
              <Info className="w-3.5 h-3.5 text-[#9CA3AF] cursor-pointer" />
            </div>
          </div>

        </div>

        {/* ROW 2: Middle Section (Campaign Revenue Forecast + Campaign by Platform) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px]">
          
          {/* Column 1: Campaign Revenue Forecast (~65% width) */}
          <div className="lg:col-span-8 p-[22px] rounded-[20px] bg-white border border-[#EAE8F2] shadow-subtle flex flex-col justify-between relative overflow-hidden">
            {/* Forecast Card Header */}
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-[16px] font-bold text-[#17152F]">
                Campaign Revenue Forecast
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-[28px] px-2.5 rounded-lg border border-[#EAE8F2] bg-[#FAFAFC] text-[12px] font-medium text-[#17152F] flex items-center gap-1 hover:bg-[#F4F4F8]"
                >
                  <span>Month</span>
                  <ChevronDown className="w-3 h-3 text-[#77758B]" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-lg text-[#77758B] hover:text-[#17152F] hover:bg-[#FAFAFC]"
                  title="Visibility"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-lg text-[#77758B] hover:text-[#17152F] hover:bg-[#FAFAFC]"
                  title="Expand"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Figures and Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-[28px] sm:text-[32px] font-bold text-[#17152F] leading-none">
                  $124,500
                </span>
                <span className="text-[12px] font-semibold text-[#10B981] flex items-center gap-0.5">
                  <span>▲</span> +3.89% vs last month
                </span>
              </div>

              <div className="flex items-center gap-5 text-[12px] text-[#77758B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#3B82F6]" />
                  <span>Campaign Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#8B5CF6]" />
                  <span>Ad Spend</span>
                </div>
              </div>
            </div>

            {/* Spline Chart Area with Pinned Tooltip */}
            <div className="h-64 sm:h-72 w-full relative mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F1F3" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    stroke="#9CA3AF"
                    fontSize={11}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickFormatter={(v) => `$${v / 1000}k`}
                    ticks={[0, 50000, 100000, 150000]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EAE8F2',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`$${val.toLocaleString()}`, '']}
                  />
                  <Area
                    type="natural"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="natural"
                    dataKey="spend"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Pinned Tooltip Overlay Card matching Reference */}
              <div className="absolute top-[18%] left-[56%] -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#EAE8F2] p-3 z-20 min-w-[195px] pointer-events-none">
                <div className="text-[12px] font-bold text-[#17152F] mb-1.5">
                  Jul 12, 26
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#555368]">
                    <span className="w-1 h-3 rounded-full bg-[#3B82F6]" />
                    <span>Project Revenue:</span>
                    <span className="font-bold text-[#17152F] ml-auto">$42,680</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#555368]">
                    <span className="w-1 h-3 rounded-full bg-[#8B5CF6]" />
                    <span>Operational Cost:</span>
                    <span className="font-bold text-[#17152F] ml-auto">$12,760</span>
                  </div>
                  <div className="pt-1 mt-1 border-t border-[#F0F1F3] flex items-center justify-between text-[11px] font-bold text-[#10B981]">
                    <span>Net Margin:</span>
                    <span>+6.03%</span>
                  </div>
                </div>
              </div>

              {/* Anchor Node on curve + Vertical Guideline */}
              <div className="absolute top-[48%] left-[56%] w-3 h-3 rounded-full bg-white border-2 border-[#8B5CF6] shadow-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <div className="absolute top-[48%] bottom-6 left-[56%] w-px border-l border-dashed border-[#8B5CF6]/60 pointer-events-none z-0" />
            </div>
          </div>

          {/* Column 2: Campaign by Platform (~35% width) */}
          <div className="lg:col-span-4 p-[22px] rounded-[20px] bg-white border border-[#EAE8F2] shadow-subtle flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-[16px] font-bold text-[#17152F]">
                Campaign by Platform
              </h3>

              <button
                type="button"
                className="h-[28px] px-2.5 rounded-lg border border-[#EAE8F2] bg-[#FAFAFC] text-[12px] font-medium text-[#17152F] flex items-center gap-1 hover:bg-[#F4F4F8]"
              >
                <span>Today</span>
                <ChevronDown className="w-3 h-3 text-[#77758B]" />
              </button>
            </div>

            {/* Platform Rows */}
            <div className="space-y-6 my-auto py-2">
              
              {/* 1. Facebook */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Facebook Icon */}
                    <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-[14px]">
                      f
                    </div>
                    <span className="text-[13.5px] font-semibold text-[#17152F]">
                      Facebook
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11.5px] text-[#77758B]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>2,45091 Views</span>
                  </div>
                </div>

                {/* Hatched track with blue progress and glowing knob */}
                <div
                  className="w-full h-2.5 rounded-full relative"
                  style={{
                    background: 'repeating-linear-gradient(45deg, #F3F4F6, #F3F4F6 4px, #E5E7EB 4px, #E5E7EB 8px)'
                  }}
                >
                  <div
                    className="h-full rounded-full bg-[#0084FF] relative"
                    style={{ width: '74%' }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0084FF] shadow-sm ring-2 ring-[#0084FF]/25" />
                  </div>
                </div>
              </div>

              {/* 2. Twitter / X */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Twitter/X Icon */}
                    <div className="w-6 h-6 rounded bg-[#111827] text-white flex items-center justify-center font-bold text-[12px]">
                      𝕏
                    </div>
                    <span className="text-[13.5px] font-semibold text-[#17152F]">
                      Twitter/ X
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11.5px] text-[#77758B]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>1,39107 Views</span>
                  </div>
                </div>

                {/* Hatched track with dark progress and glowing knob */}
                <div
                  className="w-full h-2.5 rounded-full relative"
                  style={{
                    background: 'repeating-linear-gradient(45deg, #F3F4F6, #F3F4F6 4px, #E5E7EB 4px, #E5E7EB 8px)'
                  }}
                >
                  <div
                    className="h-full rounded-full bg-[#111827] relative"
                    style={{ width: '54%' }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#111827] shadow-sm ring-2 ring-black/15" />
                  </div>
                </div>
              </div>

              {/* 3. Instagram */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Instagram Gradient Icon */}
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </div>
                    <span className="text-[13.5px] font-semibold text-[#17152F]">
                      Instagram
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11.5px] text-[#77758B]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>5,92028 Views</span>
                  </div>
                </div>

                {/* Hatched track with gradient progress and glowing knob */}
                <div
                  className="w-full h-2.5 rounded-full relative"
                  style={{
                    background: 'repeating-linear-gradient(45deg, #F3F4F6, #F3F4F6 4px, #E5E7EB 4px, #E5E7EB 8px)'
                  }}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E1306C] to-[#C13584] relative"
                    style={{ width: '88%' }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#E1306C] shadow-sm ring-2 ring-[#E1306C]/30" />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-[#F0F1F3] flex items-center justify-between text-[11.5px] text-[#77758B]">
              <span>Real-time cross-platform sync active</span>
              <span className="font-semibold text-[#6425E8]">99.4% Accuracy</span>
            </div>
          </div>

        </div>

        {/* ROW 3: Full-Width Campaign Performance Table matching Reference */}
        <div className="p-[22px] rounded-[20px] bg-white border border-[#EAE8F2] shadow-subtle space-y-4">
          
          {/* Table Header and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-[18px] font-bold text-[#17152F]">
              Campaign Performance
            </h3>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Campaign Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Search Campaign"
                  className="h-[34px] pl-8 pr-3 rounded-full bg-[#FAFAFC] border border-[#EAE8F2] text-[12px] text-[#17152F] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6425E8] w-40 sm:w-48"
                />
              </div>

              {/* Date Filter Pill */}
              <button
                type="button"
                className="h-[34px] px-3 rounded-full border border-[#EAE8F2] bg-[#FAFAFC] hover:bg-[#F4F4F8] text-[12px] font-medium text-[#17152F] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-[#77758B]" />
                <span>Aug 27, 2026</span>
                <ChevronDown className="w-3 h-3 text-[#77758B]" />
              </button>

              {/* Status Filter Pill */}
              <button
                type="button"
                onClick={() => setStatusFilter(prev => prev === 'All' ? 'Completed' : prev === 'Completed' ? 'Draft' : prev === 'Draft' ? 'Active' : 'All')}
                className="h-[34px] px-3 rounded-full border border-[#EAE8F2] bg-[#FAFAFC] hover:bg-[#F4F4F8] text-[12px] font-medium text-[#17152F] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
                <ChevronDown className="w-3 h-3 text-[#77758B]" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F0F1F3] text-[12px] font-medium text-[#77758B]">
                  <th className="py-3 px-3 w-12 text-center"></th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#17152F]">
                      <span>Campaign name</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#17152F]">
                      <span>Type</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#17152F]">
                      <span>Status</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#17152F]">
                      <span>Audience</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#17152F]">
                      <span>CTR</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#17152F]">
                      <span>Revenue</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#17152F]">
                      <span>Progress</span>
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0F1F3] text-[13px]">
                {filteredRows.map(row => {
                  const Icon = row.icon;
                  const isChecked = campaignToggles[row.id] ?? true;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-[#FAFAFC] transition-colors group cursor-pointer"
                      onClick={() => {
                        // Find matching campaign if available
                        const camp = campaigns.find(c => c.title.toLowerCase().includes(row.name.toLowerCase().slice(0, 5))) || campaigns[0];
                        if (camp) {
                          setSelectedCampaign(camp);
                          setDetailsModalOpen(true);
                        }
                      }}
                    >
                      {/* Toggle Switch */}
                      <td className="py-3.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleCampaign(row.id)}
                          className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                            isChecked ? 'bg-[#6425E8]' : 'bg-[#E5E7EB]'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform shadow-xs ${
                              isChecked ? 'left-[19px]' : 'left-[3px]'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Campaign Name */}
                      <td className="py-3.5 px-3 font-semibold text-[#17152F] whitespace-nowrap">
                        {row.name}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3 text-[#555368] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-4 h-4 ${row.iconColor}`} />
                          <span>{row.type}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold ${row.statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`} />
                          <span>{row.status}</span>
                        </span>
                      </td>

                      {/* Audience */}
                      <td className="py-3.5 px-3 font-medium text-[#17152F] whitespace-nowrap">
                        {row.audience}
                      </td>

                      {/* CTR */}
                      <td className="py-3.5 px-3 font-medium text-[#17152F] whitespace-nowrap">
                        {row.ctr}
                      </td>

                      {/* Revenue */}
                      <td className="py-3.5 px-3 font-semibold text-[#17152F] whitespace-nowrap">
                        {row.revenue}
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-3 min-w-[120px] whitespace-nowrap">
                        <div className="w-28 h-2 rounded-full bg-[#F2ECFF] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#6425E8]"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Campaign Details & Creator Modals */}
      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
      <InviteCreatorModal
        creator={selectedCreator}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </DashboardLayout>
  );
};
