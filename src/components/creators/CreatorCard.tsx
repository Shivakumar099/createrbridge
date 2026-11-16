import React from 'react';
import { CreatorProfile } from '../../types';
import { formatNumber } from '../../utils/helpers';
import {
  CheckCircle2,
  MapPin,
  Star,
  Users,
  Eye,
  Send,
  ArrowRight,
  TrendingUp,
  Instagram,
  Youtube
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreatorCardProps {
  creator: CreatorProfile;
  onInvite: (creator: CreatorProfile) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onInvite }) => {
  return (
    <div className="bg-white rounded-[16px] border border-[#EAE8F2] hover:border-[#6425E8]/30 shadow-subtle hover:shadow-card-hover transition-all duration-300 p-[22px] flex flex-col justify-between">
      <div>
        {/* Creator Header with Avatar & Verified */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={creator.profilePhoto}
                alt={creator.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#F2ECFF] shadow-sm"
              />
              {creator.verified && (
                <div className="absolute -bottom-1 -right-1 bg-[#6425E8] text-white p-0.5 rounded-full ring-2 ring-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-[16px] font-semibold text-[#17152F] flex items-center gap-1 leading-snug">
                {creator.fullName}
              </h3>
              <p className="text-[13px] text-[#6425E8] font-medium">{creator.instagramHandle}</p>
              <p className="text-[12px] text-[#77758B] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {creator.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-bold">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            {creator.rating}
          </div>
        </div>

        {/* Bio */}
        <p className="text-[14px] font-normal text-[#77758B] line-clamp-2 leading-relaxed mb-3">
          {creator.bio}
        </p>

        {/* Categories tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {creator.categories.map(cat => (
            <span
              key={cat}
              className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F2ECFF] text-[#6425E8] border border-[#6425E8]/20"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Analytics stats row */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#FAFAFF] border border-[#EAE8F2] text-center mb-4">
          <div>
            <span className="text-[11px] text-[#77758B] block font-medium">Followers</span>
            <span className="text-[14px] font-bold text-[#17152F]">
              {formatNumber(creator.followersCount)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#77758B] block font-medium">Avg Views</span>
            <span className="text-[14px] font-bold text-[#17152F]">
              {formatNumber(creator.avgViews)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#77758B] block font-medium">Engagement</span>
            <span className="text-[14px] font-bold text-emerald-600">
              {creator.engagementRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#EAE8F2]">
        <Link
          to={`/creator-profile/${creator.id}`}
          className="flex-1 h-[38px] flex items-center justify-center text-center text-[13px] font-semibold text-[#17152F] hover:text-[#6425E8] hover:bg-[#FAFAFF] rounded-xl border border-[#EAE8F2] transition-colors cursor-pointer"
        >
          View Profile
        </Link>
        <button
          onClick={() => onInvite(creator)}
          className="flex-1 h-[38px] px-3 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[13px] font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          Invite
        </button>
      </div>
    </div>
  );
};
