import React, { useState } from 'react';
import { CreatorProfile } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatNumber, formatINR } from '../../utils/helpers';
import { X, Sparkles, CheckCircle2, Megaphone } from 'lucide-react';

interface InviteCreatorModalProps {
  creator: CreatorProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteCreatorModal: React.FC<InviteCreatorModalProps> = ({ creator, isOpen, onClose }) => {
  const { campaigns, showToast } = useData();
  const { user } = useAuth();

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [customMessage, setCustomMessage] = useState(
    "Hi! We love your content aesthetics and would love to partner with you for our upcoming campaign on CreatorBridge."
  );

  if (!isOpen || !creator) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const camp = campaigns.find(c => c.id === selectedCampaignId);
    showToast(
      'Invitation Sent!',
      `Official campaign invitation dispatched to ${creator.fullName} for "${camp?.title || 'Selected Campaign'}".`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-content-primary/45 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-card rounded-card-lg border border-surface-border shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-content-primary">Invite Creator to Campaign</h3>
              <p className="text-xs text-content-secondary">Fast-track direct collaboration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creator Mini Card */}
        <div className="p-3 rounded-xl bg-surface-bg border border-surface-border flex items-center gap-3">
          <img
            src={creator.profilePhoto}
            alt={creator.fullName}
            className="w-12 h-12 rounded-xl object-cover border border-surface-border"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-content-primary flex items-center gap-1">
              {creator.fullName}
              {creator.verified && <span className="text-[10px] text-brand-primary">✓</span>}
            </h4>
            <p className="text-[11px] text-content-secondary">{creator.instagramHandle}</p>
            <div className="flex gap-3 text-[10px] text-content-muted mt-0.5">
              <span>{formatNumber(creator.followersCount)} Followers</span>
              <span>•</span>
              <span>{creator.engagementRate}% Engagement</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-content-secondary mb-1">
              Select Campaign
            </label>
            <select
              value={selectedCampaignId}
              onChange={e => setSelectedCampaignId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-content-primary focus:outline-none focus:border-brand-primary font-medium"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} — {formatINR(c.creatorPayment)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-content-secondary mb-1">
              Personalized Invitation Message
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-content-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Send Direct Invitation
          </button>
        </form>
      </div>
    </div>
  );
};
