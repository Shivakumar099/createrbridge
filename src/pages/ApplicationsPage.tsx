import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { formatINR, formatNumber, formatDate } from '../utils/helpers';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApplicationsPage: React.FC = () => {
  const { applications, updateApplicationStatus, showToast } = useData();
  const { user, role } = useAuth();

  const isBrand = role === 'brand';
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filteredApps = applications.filter(app => {
    // If brand, show applications for brand campaigns
    if (isBrand) {
      if (app.brandId !== user?.id && app.brandId !== 'brand_boat') return false;
    } else {
      // If creator, show applications from this creator
      if (app.creatorId !== user?.id && app.creatorId !== 'user_creator_1') return false;
    }

    if (filterStatus !== 'all' && app.status !== filterStatus) {
      return false;
    }

    return true;
  });

  const handleAccept = (appId: string) => {
    updateApplicationStatus(appId, 'accepted');
  };

  const handleReject = (appId: string) => {
    updateApplicationStatus(appId, 'rejected', 'Did not meet audience demographic match for current cohort.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-[28px] animate-fade-in max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#6425E8] uppercase tracking-wider mb-1">
              <FileCheck2 className="w-3.5 h-3.5" /> Campaign Applications
            </div>
            <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">
              {isBrand ? 'Creator Applications' : 'My Campaign Applications'}
            </h1>
            <p className="text-[14px] text-[#77758B]">
              {isBrand
                ? 'Review creator pitches, check engagement statistics, and approve cohorts.'
                : 'Track the status of your campaign pitches and collaborate with brands.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-[#FAFAFF] p-1 rounded-xl border border-[#EAE8F2]">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold capitalize transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-[#6425E8] shadow-xs font-bold'
                    : 'text-[#77758B] hover:text-[#17152F]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-[20px]">
          {filteredApps.length === 0 ? (
            <div className="p-16 rounded-[16px] bg-white border border-[#EAE8F2] text-center space-y-3">
              <FileCheck2 className="w-10 h-10 text-[#77758B] mx-auto" />
              <h3 className="text-[16px] font-semibold text-[#17152F]">No applications found</h3>
              <p className="text-[14px] text-[#77758B]">
                {isBrand ? 'No creators have applied with this status filter.' : 'You have not submitted pitches matching this filter.'}
              </p>
              {!isBrand && (
                <Link
                  to="/creator/discover-campaigns"
                  className="inline-block mt-2 h-[42px] px-5 leading-[42px] rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[14px] font-semibold transition-all shadow-xs"
                >
                  Browse Campaigns to Apply
                </Link>
              )}
            </div>
          ) : (
            filteredApps.map(app => (
              <div
                key={app.id}
                className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle hover:border-[#6425E8]/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE8F2]">
                  <div className="flex items-center gap-3">
                    <img
                      src={isBrand ? app.creatorAvatar : app.brandLogo}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover border border-[#EAE8F2]"
                    />
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#17152F]">
                        {isBrand ? app.creatorName : app.campaignTitle}
                      </h3>
                      <p className="text-[13px] text-[#77758B]">
                        {isBrand ? (
                          <>
                            Applied for <strong className="text-[#6425E8] font-semibold">{app.campaignTitle}</strong> • {formatNumber(app.creatorFollowers)} Followers
                          </>
                        ) : (
                          <>Brand: <strong className="text-[#6425E8] font-semibold">{app.brandName}</strong></>
                        )}
                      </p>
                      <span className="text-[12px] text-[#77758B] block mt-0.5">
                        Submitted on {formatDate(app.appliedDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[11px] text-[#77758B] block">Requested Fee</span>
                      <span className="text-[18px] font-bold text-[#17152F]">
                        {formatINR(app.requestedFee)}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-bold capitalize ${
                        app.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Pitch box */}
                <div className="p-4 rounded-xl bg-[#FAFAFF] border border-[#EAE8F2] text-[14px] space-y-1">
                  <span className="font-semibold text-[#17152F] block text-[13px]">Creator Creative Pitch:</span>
                  <p className="text-[#17152F] leading-relaxed">{app.pitch}</p>
                </div>

                {/* Brand Decision Actions */}
                {isBrand && app.status === 'pending' && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleReject(app.id)}
                      className="h-[38px] px-4 rounded-xl border border-[#EAE8F2] text-[#77758B] hover:text-red-600 text-[13px] font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(app.id)}
                      className="h-[38px] flex items-center gap-1.5 px-5 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept & Open Collaboration
                    </button>
                  </div>
                )}

                {/* Link to Collaboration if accepted */}
                {app.status === 'accepted' && (
                  <div className="flex justify-end pt-1">
                    <Link
                      to={isBrand ? '/brand/collaborations' : '/creator/collaborations'}
                      className="text-[13px] font-semibold text-[#6425E8] hover:underline flex items-center gap-1"
                    >
                      Go to Active Collaboration Pipeline
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
