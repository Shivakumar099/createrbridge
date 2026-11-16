import React, { useState } from 'react';
import { Campaign } from '../../types';
import { formatINR, formatDate } from '../../utils/helpers';
import {
  Bookmark,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Film,
  CheckCircle2,
  TrendingUp,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface CampaignCardProps {
  campaign: Campaign;
  onViewDetails: (campaign: Campaign) => void;
  onApplyNow: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onViewDetails,
  onApplyNow
}) => {
  const { user } = useAuth();
  const { applications } = useData();
  const [isSaved, setIsSaved] = useState(false);

  const existingApp = applications.find(
    a => a.campaignId === campaign.id && user?.id && a.creatorId === user.id
  );

  return (
    <div className="group bg-white rounded-[16px] border border-[#EAE8F2] hover:border-[#6425E8]/30 shadow-subtle hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail Banner (16:9 aspect ratio) with badges */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#FAFAFF]">
        <img
          src={campaign.bannerImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Labels: Featured / Trending / New */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {campaign.featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#6425E8] text-white shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          {campaign.trending && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
              <Flame className="w-3 h-3" /> Trending
            </span>
          )}
          {campaign.isNew && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
              New
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={e => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isSaved
              ? 'bg-[#6425E8] text-white'
              : 'bg-white/85 hover:bg-white text-[#17152F]'
          }`}
          title={isSaved ? 'Saved' : 'Save Campaign'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Brand Logo & Name overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 text-white">
          <img
            src={campaign.brandLogo}
            alt={campaign.brandName}
            className="w-9 h-9 rounded-xl object-cover border border-white/40 shadow-xs bg-white"
          />
          <div className="min-w-0">
            <span className="text-[13px] font-semibold block truncate drop-shadow-sm">{campaign.brandName}</span>
            <span className="text-[11px] text-white/90 block drop-shadow-sm">{campaign.location}</span>
          </div>
        </div>
      </div>

      {/* Card Body with standard 22px padding */}
      <div className="p-[22px] flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[12px] text-[#77758B] mb-2">
            <span className="font-semibold text-[#6425E8] bg-[#F2ECFF] px-2.5 py-0.5 rounded-full">
              {campaign.category}
            </span>
            <span className="flex items-center gap-1 text-[12px]">
              <Calendar className="w-3.5 h-3.5" /> Due {formatDate(campaign.deadline)}
            </span>
          </div>

          <h3 className="text-[16px] font-semibold text-[#17152F] line-clamp-2 leading-snug group-hover:text-[#6425E8] transition-colors">
            {campaign.title}
          </h3>

          <p className="text-[14px] font-normal text-[#77758B] line-clamp-2 mt-1.5 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Deliverables tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {campaign.deliverables.reels ? (
            <span className="text-[12px] font-medium px-2.5 py-1 rounded-lg bg-[#FAFAFF] border border-[#EAE8F2] text-[#77758B] flex items-center gap-1">
              <Film className="w-3 h-3 text-[#6425E8]" /> {campaign.deliverables.reels} Reel
            </span>
          ) : null}
          {campaign.deliverables.stories ? (
            <span className="text-[12px] font-medium px-2.5 py-1 rounded-lg bg-[#FAFAFF] border border-[#EAE8F2] text-[#77758B]">
              {campaign.deliverables.stories} Stories
            </span>
          ) : null}
          {campaign.deliverables.youtubeVideos ? (
            <span className="text-[12px] font-medium px-2.5 py-1 rounded-lg bg-[#FAFAFF] border border-[#EAE8F2] text-[#77758B]">
              {campaign.deliverables.youtubeVideos} Video
            </span>
          ) : null}
        </div>

        {/* Budget & Actions footer */}
        <div className="pt-3 border-t border-[#EAE8F2] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#77758B] block leading-none">Creator Fee</span>
            <span className="text-[18px] font-bold text-[#17152F]">
              {formatINR(campaign.creatorPayment)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(campaign)}
              className="h-[38px] px-3 text-[13px] font-semibold text-[#77758B] hover:text-[#17152F] hover:bg-[#FAFAFF] rounded-xl border border-transparent hover:border-[#EAE8F2] transition-colors cursor-pointer"
            >
              Details
            </button>

            {existingApp ? (
              <span className="h-[38px] px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[13px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Applied
              </span>
            ) : (
              <button
                onClick={() => onApplyNow(campaign)}
                className="h-[38px] px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[13px] font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                Apply
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
