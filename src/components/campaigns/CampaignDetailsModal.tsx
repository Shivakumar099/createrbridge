import React, { useState } from 'react';
import { Campaign } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatINR, formatDate } from '../../utils/helpers';
import {
  X,
  Calendar,
  MapPin,
  CheckCircle,
  IndianRupee,
  Share2,
  Sparkles,
  Users,
  Film,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  openApplyInitially?: boolean;
}

export const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({
  campaign,
  isOpen,
  onClose,
  openApplyInitially = false
}) => {
  const { user, role, openAuthModal } = useAuth();
  const { applyToCampaign, applications } = useData();
  const navigate = useNavigate();

  const [isApplying, setIsApplying] = useState(openApplyInitially);
  const [pitch, setPitch] = useState('');
  const [requestedFee, setRequestedFee] = useState<number>(campaign?.creatorPayment || 50000);

  if (!isOpen || !campaign) return null;

  const isCreator = role === 'creator';
  const existingApp = applications.find(a => a.campaignId === campaign.id && user?.id && a.creatorId === user.id);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCreator) {
      openAuthModal('creator');
      return;
    }

    const success = await applyToCampaign(campaign.id, pitch, requestedFee);
    if (success) {
      setIsApplying(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-content-primary/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface-card rounded-card-lg border border-surface-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Banner with close */}
        <div className="relative h-44 sm:h-52 w-full flex-shrink-0">
          <img
            src={campaign.bannerImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-content-primary/80 via-content-primary/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-content-primary transition-all shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <img
                src={campaign.brandLogo}
                alt={campaign.brandName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
              />
              <div className="text-white">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-primary text-white inline-block mb-1">
                  {campaign.category}
                </span>
                <h3 className="text-lg font-bold leading-tight">{campaign.brandName}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-content-primary leading-snug">
              {campaign.title}
            </h2>
            <p className="text-xs text-content-secondary mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" /> {campaign.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-primary" /> Deadline: {formatDate(campaign.deadline)}
              </span>
            </p>
          </div>

          {/* Key Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-bg border border-surface-border">
              <span className="text-[11px] text-content-muted block font-medium">Creator Payment</span>
              <span className="text-base font-bold text-brand-primary mt-0.5 block">
                {formatINR(campaign.creatorPayment)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-bg border border-surface-border">
              <span className="text-[11px] text-content-muted block font-medium">Total Budget</span>
              <span className="text-base font-bold text-content-primary mt-0.5 block">
                {formatINR(campaign.budget)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-bg border border-surface-border">
              <span className="text-[11px] text-content-muted block font-medium">Min Followers</span>
              <span className="text-base font-bold text-content-primary mt-0.5 block">
                {(campaign.audienceRequirements?.minFollowers || 50000).toLocaleString('en-IN')}+
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-bg border border-surface-border">
              <span className="text-[11px] text-content-muted block font-medium">Applicants</span>
              <span className="text-base font-bold text-content-primary mt-0.5 block">
                {campaign.applicantsCount} Creators
              </span>
            </div>
          </div>

          {/* Deliverables */}
          <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-content-muted block">
              Required Deliverables
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {campaign.deliverables.reels ? (
                <span className="px-3 py-1.5 rounded-lg bg-brand-light text-brand-primary font-semibold flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" /> {campaign.deliverables.reels}x Instagram Reel
                </span>
              ) : null}
              {campaign.deliverables.stories ? (
                <span className="px-3 py-1.5 rounded-lg bg-brand-light text-brand-primary font-semibold flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" /> {campaign.deliverables.stories}x Instagram Stories
                </span>
              ) : null}
              {campaign.deliverables.youtubeVideos ? (
                <span className="px-3 py-1.5 rounded-lg bg-brand-light text-brand-primary font-semibold flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" /> {campaign.deliverables.youtubeVideos}x YouTube Video
                </span>
              ) : null}
            </div>
          </div>

          {/* Full Brief Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-content-primary">Campaign Brief & Guidelines</h4>

            <div className="text-xs text-content-secondary space-y-2 leading-relaxed">
              <p><strong className="text-content-primary">Objective:</strong> {campaign.brief.objective}</p>
              <p><strong className="text-content-primary">Key Message:</strong> {campaign.brief.keyMessage}</p>
              <p><strong className="text-content-primary">Target Audience:</strong> {campaign.brief.targetAudience}</p>
              <div>
                <strong className="text-content-primary block mb-1">Key Product Benefits:</strong>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {campaign.brief.productBenefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
              {campaign.brief.specialOffers && (
                <p><strong className="text-content-primary">Special Offers:</strong> {campaign.brief.specialOffers}</p>
              )}
              <p><strong className="text-content-primary">Required CTA:</strong> {campaign.brief.requiredCTA}</p>
              <p><strong className="text-content-primary">Guidelines:</strong> {campaign.brief.brandGuidelines}</p>
              {campaign.brief.contentRestrictions && (
                <p><strong className="text-status-error">Restrictions:</strong> {campaign.brief.contentRestrictions}</p>
              )}
            </div>
          </div>

          {/* Application Form Drawer (when applying) */}
          {isApplying && (
            <form onSubmit={handleApplySubmit} className="p-4 rounded-xl bg-brand-light/40 border border-brand-soft space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-content-primary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-primary" /> Submit Your Application
                </h4>
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="text-xs text-content-muted hover:text-content-primary"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Your Creative Pitch & Angle *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain your vision: e.g. 'I will shoot a dynamic transition in Mumbai metro showing noise vanishing when ANC is tapped...'"
                  value={pitch}
                  onChange={e => setPitch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Requested Collaboration Fee (₹)
                </label>
                <input
                  type="number"
                  required
                  value={requestedFee}
                  onChange={e => setRequestedFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-brand-primary bg-white font-semibold"
                />
                <span className="text-[11px] text-content-muted mt-0.5 block">
                  Campaign standard payment: {formatINR(campaign.creatorPayment)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
              >
                Submit Pitch to {campaign.brandName}
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between bg-surface-bg/50">
          <div className="text-xs text-content-secondary">
            Payment Protected by <span className="font-semibold text-brand-primary">CreatorBridge Escrow</span>
          </div>

          <div className="flex items-center gap-3">
            {existingApp ? (
              <span className="px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-status-success font-semibold text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Applied ({existingApp.status})
              </span>
            ) : !isApplying ? (
              <button
                onClick={() => setIsApplying(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
              >
                Apply Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
