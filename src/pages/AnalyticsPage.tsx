import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { formatNumber, formatINR } from '../utils/helpers';
import { BarChart3, TrendingUp, Users, Eye, Heart, Share2, Award, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { role } = useAuth();
  const isBrand = role === 'brand';

  const impressionsData = [
    { week: 'W1', reach: 240, engagement: 18 },
    { week: 'W2', reach: 380, engagement: 29 },
    { week: 'W3', reach: 590, engagement: 44 },
    { week: 'W4', reach: 890, engagement: 68 },
    { week: 'W5', reach: 1200, engagement: 92 },
    { week: 'W6', reach: 1850, engagement: 135 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-[28px] animate-fade-in max-w-[1440px] mx-auto">
        <div className="space-y-1">
          <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">
            {isBrand ? 'Brand Performance Analytics' : 'Creator Growth & Reach Analytics'}
          </h1>
          <p className="text-[14px] text-[#77758B]">
            {isBrand
              ? 'Multi-platform impressions, verified engagement rates, and sales conversion metrics.'
              : 'Track follower growth, reel views, and sponsored post engagement performance.'}
          </p>
        </div>

        {/* 4 Cards in one row on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] text-center shadow-subtle">
            <span className="text-[13px] text-[#77758B] block font-medium">Total Impressions</span>
            <span className="text-[30px] font-bold text-[#17152F] mt-1 block leading-tight">4.2M</span>
            <span className="text-[12px] text-emerald-600 font-semibold mt-1 block">+34% vs last mo</span>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] text-center shadow-subtle">
            <span className="text-[13px] text-[#77758B] block font-medium">Average Video Views</span>
            <span className="text-[30px] font-bold text-[#6425E8] mt-1 block leading-tight">280K</span>
            <span className="text-[12px] text-[#6425E8] font-semibold mt-1 block">92% Completion</span>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] text-center shadow-subtle">
            <span className="text-[13px] text-[#77758B] block font-medium">Engagement Rate</span>
            <span className="text-[30px] font-bold text-emerald-600 mt-1 block leading-tight">6.4%</span>
            <span className="text-[12px] text-emerald-600 font-semibold mt-1 block">Top 5% in category</span>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] text-center shadow-subtle">
            <span className="text-[13px] text-[#77758B] block font-medium">Link Click-Throughs</span>
            <span className="text-[30px] font-bold text-[#17152F] mt-1 block leading-tight">42,800</span>
            <span className="text-[12px] text-[#77758B] font-semibold mt-1 block">From bio / stories</span>
          </div>
        </div>

        {/* Chart */}
        <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[22px] font-semibold text-[#17152F]">Weekly Reach & Engagement Progression</h3>
            <span className="text-[13px] text-[#77758B] font-medium">Last 6 Weeks</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impressionsData}>
                <defs>
                  <linearGradient id="analyticsReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6425E8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6425E8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE8F2" />
                <XAxis dataKey="week" stroke="#77758B" fontSize={12} />
                <YAxis stroke="#77758B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #EAE8F2'
                  }}
                />
                <Area type="monotone" dataKey="reach" stroke="#6425E8" strokeWidth={3} fill="url(#analyticsReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
