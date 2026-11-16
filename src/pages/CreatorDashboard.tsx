import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { formatINR, formatNumber, formatDate } from '../utils/helpers';
import { Campaign, Collaboration } from '../types';
import { CampaignDetailsModal } from '../components/campaigns/CampaignDetailsModal';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  GitPullRequest,
  FileCheck2,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Film,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  Crown
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

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { campaigns, collaborations, applications, calendarTasks } = useData();
  const navigate = useNavigate();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyInitially, setApplyInitially] = useState(false);

  // Statistics & Real User Isolation
  const isDemoAccount = user?.id === 'user_creator_1' || user?.email === 'tanya@tanyastyle.com';
  const myCollaborations = collaborations.filter(c => c.creatorId === user?.id || (isDemoAccount && c.creatorId === 'user_creator_1'));
  const activeCollabsCount = myCollaborations.filter(c => c.status !== 'payment_completed').length;
  const pendingAppsCount = applications.filter(a => a.creatorId === user?.id && a.status === 'pending').length;
  const upcomingDeliveries = calendarTasks.filter(t => !t.completed).length;

  const actualCompletedEarnings = myCollaborations
    .filter(c => c.status === 'payment_completed')
    .reduce((sum, c) => sum + (c.paymentAmount || 0), 0);
  const totalEarnings = isDemoAccount ? 77000 : actualCompletedEarnings;

  const earningsTrend = isDemoAccount ? [
    { month: 'Jun', earnings: 18000 },
    { month: 'Jul', earnings: 24000 },
    { month: 'Aug', earnings: 32000 },
    { month: 'Sep', earnings: 42000 },
    { month: 'Oct', earnings: 58000 },
    { month: 'Nov', earnings: 77000 },
  ] : [
    { month: 'Jun', earnings: 0 },
    { month: 'Jul', earnings: 0 },
    { month: 'Aug', earnings: 0 },
    { month: 'Sep', earnings: 0 },
    { month: 'Oct', earnings: 0 },
    { month: 'Nov', earnings: actualCompletedEarnings },
  ];

  const handleApplyNow = (c: Campaign) => {
    setSelectedCampaign(c);
    setApplyInitially(true);
    setDetailsModalOpen(true);
  };

  const handleViewDetails = (c: Campaign) => {
    setSelectedCampaign(c);
    setApplyInitially(false);
    setDetailsModalOpen(true);
  };

  const getStatusBadge = (status: Collaboration['status']) => {
    switch (status) {
      case 'brief_received':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Brief Received</span>;
      case 'script_generated':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-brand-primary border border-purple-200">Script Generated</span>;
      case 'script_submitted':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Script In Review</span>;
      case 'script_approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Script Approved</span>;
      case 'content_in_production':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">In Production</span>;
      case 'content_submitted':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Content In Review</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case 'payment_completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-status-success border border-green-300">Paid 🎉</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-bg text-content-secondary">Under Review</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-[28px] animate-fade-in">
        {/* Creator Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-[22px] rounded-[16px] bg-gradient-to-r from-[#6425E8] via-[#8B5CF6] to-purple-600 text-white shadow-card">
          <div className="space-y-1">
            <span className="text-[12px] uppercase tracking-wider font-semibold text-[#F2ECFF]">
              Creator Studio
            </span>
            <h1 className="text-[30px] font-bold leading-tight">
              Namaste, {user?.name || 'Creator'} ✨
            </h1>
            <p className="text-[14px] text-white/80 max-w-xl font-normal leading-relaxed">
              Turn brand briefs into approved scripts, manage your deadlines, and collect guaranteed escrow payments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/creator/ai-script-writer"
              className="h-[42px] px-5 rounded-xl bg-white text-[#6425E8] text-[14px] font-semibold hover:bg-[#F2ECFF] transition-all shadow-md inline-flex items-center gap-2 flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#6425E8]" />
              <span>AI Script Writer</span>
            </Link>
          </div>
        </div>

        {/* Creator Membership Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE8F2] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6425E8] to-[#8B5CF6] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[14px] text-[#17152F]">
                  CreatorBridge Creator Membership
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F2ECFF] text-[#6425E8]">
                  Up to 57% OFF
                </span>
              </div>
              <p className="text-[12px] text-[#77758B] mt-0.5">
                {user?.membership?.status === 'active'
                  ? `Active Tier: ${user.membership.planName} • Unlimited applications & AI scripting enabled`
                  : 'Upgrade to Creator Pro (₹299/mo) or Creator Premium (₹599/mo) for unlimited brand deal pitches.'}
              </p>
            </div>
          </div>

          <Link
            to="/creator/membership"
            className="h-9 px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[12px] font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs flex-shrink-0"
          >
            <span>{user?.membership?.status === 'active' ? 'Manage Plan' : 'View Plans & Upgrade'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Statistics Cards in One Row on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[12px] text-[#77758B] font-medium block">Total Earnings</span>
              <span className="text-[30px] font-bold text-[#17152F] mt-1 block leading-tight">
                {formatINR(totalEarnings)}
              </span>
              <span className="text-[12px] text-[#16A36A] font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +₹32,000 this month
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F2ECFF] text-[#6425E8] flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[12px] text-[#77758B] font-medium block">Active Collaborations</span>
              <span className="text-[30px] font-bold text-[#17152F] mt-1 block leading-tight">
                {activeCollabsCount}
              </span>
              <span className="text-[12px] text-[#6425E8] font-semibold flex items-center gap-1 mt-1">
                1 Script In Review
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F2ECFF] text-[#6425E8] flex items-center justify-center flex-shrink-0">
              <GitPullRequest className="w-6 h-6" />
            </div>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[12px] text-[#77758B] font-medium block">Pending Applications</span>
              <span className="text-[30px] font-bold text-[#17152F] mt-1 block leading-tight">
                {pendingAppsCount}
              </span>
              <span className="text-[12px] text-[#77758B] font-medium block mt-1">
                Brand reviews in 48h
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F2ECFF] text-[#6425E8] flex items-center justify-center flex-shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[12px] text-[#77758B] font-medium block">Upcoming Deliveries</span>
              <span className="text-[30px] font-bold text-[#17152F] mt-1 block leading-tight">
                {upcomingDeliveries}
              </span>
              <span className="text-[12px] text-[#F59E0B] font-semibold flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5" /> Due next 7 days
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F2ECFF] text-[#6425E8] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* PROFILE STRENGTH & UPCOMING DEADLINES ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px]">
          {/* Profile Strength */}
          <div className="lg:col-span-5 p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-[#17152F]">Profile Strength</h3>
                <span className="text-[12px] font-bold text-[#6425E8] bg-[#F2ECFF] px-2.5 py-1 rounded-full">
                  95% Complete
                </span>
              </div>
              <p className="text-[14px] text-[#77758B] leading-relaxed">
                Complete profiles receive 3.4x more direct brand invitations on CreatorBridge.
              </p>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-[#EAE8F2] overflow-hidden my-4">
                <div className="h-full bg-gradient-to-r from-[#6425E8] to-[#8B5CF6] rounded-full" style={{ width: '95%' }} />
              </div>

              <div className="space-y-2 text-[13px]">
                <div className="flex items-center gap-2 text-[#77758B] font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" /> Social API Sync (Awaiting OAuth credentials)
                </div>
                <div className="flex items-center gap-2 text-[#16A36A] font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Creator Profile Active & Ready for Offers
                </div>
                <div className="flex items-center gap-2 text-[#16A36A] font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Escrow Payout Bank Account Registered
                </div>
              </div>
            </div>

            <Link
              to="/creator/portfolio"
              className="mt-5 w-full h-[42px] rounded-xl border border-[#6425E8]/30 text-[#6425E8] text-[14px] font-semibold flex items-center justify-center hover:bg-[#F2ECFF]/40 transition-colors"
            >
              Update Creator Portfolio
            </Link>
          </div>

          {/* Upcoming Content Calendar Widget */}
          <div className="lg:col-span-7 p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#17152F]">Upcoming Content Deadlines</h3>
                <p className="text-[12px] text-[#77758B]">Automatically synced with your active brand collaborations</p>
              </div>
              <Link
                to="/creator/calendar"
                className="text-[13px] font-semibold text-[#6425E8] hover:underline flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {calendarTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-[#EAE8F2] bg-[#FAFAFF] flex items-center justify-between gap-3 hover:border-[#6425E8]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 rounded-full bg-[#6425E8]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#17152F]">{task.title}</h4>
                      <p className="text-[12px] text-[#77758B]">
                        {task.brandName} • Due: {formatDate(task.dueDate)} {task.dueTime ? `at ${task.dueTime}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F2ECFF] text-[#6425E8] uppercase">
                    {task.taskType.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MY ACTIVE COLLABORATIONS */}
        <div className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-semibold text-[#17152F]">My Collaborations</h3>
              <p className="text-[14px] text-[#77758B]">Real-time 14-step workflow tracker for active brand deals</p>
            </div>
            <Link
              to="/creator/collaborations"
              className="text-[13px] font-semibold text-[#6425E8] hover:underline"
            >
              Manage All Collaborations
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EAE8F2]">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#FAFAFF] text-[#77758B] uppercase tracking-wider text-[12px] font-semibold border-b border-[#EAE8F2]">
                <tr>
                  <th className="py-3 px-4">Brand & Campaign</th>
                  <th className="py-3 px-4">Deliverables</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8F2]">
                {myCollaborations.map(collab => (
                  <tr key={collab.id} className="hover:bg-[#FAFAFF] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={collab.brandLogo}
                          alt={collab.brandName}
                          className="w-10 h-10 rounded-xl object-cover border border-[#EAE8F2]"
                        />
                        <div>
                          <span className="font-semibold text-[#17152F] block text-[14px]">{collab.brandName}</span>
                          <span className="text-[12px] text-[#77758B] line-clamp-1">{collab.campaignTitle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#77758B] font-medium">
                      {collab.deliverables.join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#17152F]">
                      {formatINR(collab.paymentAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#77758B] font-medium">
                      {formatDate(collab.deadline)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(collab.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/creator/collaborations"
                        className="h-[36px] px-3.5 rounded-xl bg-[#6425E8] text-white text-[13px] font-semibold hover:bg-[#521dc7] transition-all shadow-xs inline-flex items-center justify-center"
                      >
                        Open Pipeline
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECOMMENDED CAMPAIGNS FOR CREATOR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-semibold text-[#17152F]">Recommended Campaigns For You</h3>
              <p className="text-[14px] text-[#77758B]">Matches your follower size and content categories</p>
            </div>
            <Link
              to="/creator/discover-campaigns"
              className="text-[13px] font-semibold text-[#6425E8] hover:underline"
            >
              Browse All Campaigns
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            {campaigns.slice(0, 3).map(camp => (
              <div
                key={camp.id}
                className="bg-white rounded-[16px] border border-[#EAE8F2] shadow-subtle hover:border-[#6425E8]/30 p-[22px] flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={camp.brandLogo}
                      alt={camp.brandName}
                      className="w-10 h-10 rounded-xl object-cover border border-[#EAE8F2]"
                    />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#17152F] leading-tight">{camp.brandName}</h4>
                      <p className="text-[12px] text-[#77758B]">{camp.location}</p>
                    </div>
                  </div>

                  <h3 className="text-[16px] font-semibold text-[#17152F] line-clamp-2 leading-snug">
                    {camp.title}
                  </h3>
                  <p className="text-[14px] text-[#77758B] line-clamp-2 mt-1.5 leading-relaxed font-normal">
                    {camp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE8F2] flex items-center justify-between">
                  <div>
                    <span className="text-[12px] text-[#77758B] block">Creator Fee</span>
                    <span className="text-[18px] font-bold text-[#17152F]">{formatINR(camp.creatorPayment)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(camp)}
                      className="h-[36px] px-3 text-[13px] font-semibold text-[#77758B] hover:text-[#17152F] hover:bg-[#FAFAFF] rounded-xl border border-transparent hover:border-[#EAE8F2] transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleApplyNow(camp)}
                      className="h-[36px] px-3.5 rounded-xl bg-[#6425E8] text-white text-[13px] font-semibold hover:bg-[#521dc7] transition-all shadow-xs cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EARNINGS OVERVIEW WITH RECHARTS */}
        <div className="bg-white rounded-[16px] border border-[#EAE8F2] shadow-subtle p-[22px] space-y-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[22px] font-semibold text-[#17152F]">Earnings Growth Overview</h3>
              <p className="text-[14px] text-[#77758B]">Monthly milestone disbursements to your bank account</p>
            </div>
            <Link to="/creator/earnings" className="text-[14px] font-semibold text-[#6425E8] hover:underline">
              View Transactions
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsTrend}>
                <defs>
                  <linearGradient id="creatorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6425E8" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6425E8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE8F2" />
                <XAxis dataKey="month" stroke="#77758B" fontSize={11} />
                <YAxis stroke="#77758B" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatINR(val), 'Earnings']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #EAE8F2',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                  }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#6425E8" strokeWidth={3} fillOpacity={1} fill="url(#creatorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        openApplyInitially={applyInitially}
      />
    </DashboardLayout>
  );
};
