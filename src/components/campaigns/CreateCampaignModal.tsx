import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/helpers';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calendar,
  IndianRupee,
  Layers,
  Video,
  Share2
} from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose }) => {
  const { createCampaign } = useData();
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  // Step 1: Campaign Details
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState(user?.businessName || 'boAt Lifestyle');
  const [product, setProduct] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80');

  // Step 2: Target Audience
  const [creatorCategory, setCreatorCategory] = useState('Technology');
  const [location, setLocation] = useState('Pan-India');
  const [minFollowers, setMinFollowers] = useState(50000);
  const [audienceType, setAudienceType] = useState('Youth & Young Professionals (18-35)');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram', 'YouTube Shorts']);

  // Step 3: Budget & Timeline
  const [budget, setBudget] = useState(300000);
  const [creatorPayment, setCreatorPayment] = useState(45000);
  const [paymentMethod, setPaymentMethod] = useState('Escrow via CreatorBridge');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2026-12-25');

  // Step 4: Deliverables & Brief
  const [reelsCount, setReelsCount] = useState(1);
  const [storiesCount, setStoriesCount] = useState(2);
  const [postsCount, setPostsCount] = useState(0);
  const [youtubeVideosCount, setYoutubeVideosCount] = useState(0);
  const [keyMessage, setKeyMessage] = useState('');
  const [benefits, setBenefits] = useState('Hybrid Active Noise Cancellation, 120hr Battery, Spatial Bass');
  const [specialOffers, setSpecialOffers] = useState('Use code CREATOR10 for 10% instant discount');
  const [requiredCTA, setRequiredCTA] = useState('Tap link in bio to shop with exclusive code');
  const [brandGuidelines, setBrandGuidelines] = useState('Authentic real-world testing, energetic pacing, natural lighting');
  const [contentRestrictions, setContentRestrictions] = useState('No direct competitor mentions or unsafe driving footage');

  if (!isOpen) return null;

  const platformsList = ['Instagram', 'YouTube', 'YouTube Shorts', 'LinkedIn', 'Twitter / X'];
  const categoriesList = ['Technology', 'Fashion', 'Beauty', 'Food & Beverage', 'Fitness', 'Travel', 'Lifestyle'];

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePublish = async () => {
    await createCampaign({
      title: title || 'New Product Launch Campaign',
      brandName: brandName || 'boAt Lifestyle',
      product: product || 'Signature Product',
      description: description || 'Promote product benefits with authentic creator storytelling.',
      category: creatorCategory,
      location,
      budget: Number(budget),
      creatorPayment: Number(creatorPayment),
      deliverables: {
        reels: Number(reelsCount),
        stories: Number(storiesCount),
        posts: Number(postsCount),
        youtubeVideos: Number(youtubeVideosCount)
      },
      deadline,
      startDate,
      endDate,
      platforms: selectedPlatforms,
      audienceRequirements: {
        minFollowers: Number(minFollowers),
        creatorCategory,
        audienceType,
        location
      },
      brief: {
        objective: objective || description || 'Demonstrate high performance in daily lifestyle',
        targetAudience: audienceType,
        keyMessage: keyMessage || title || 'Premium quality for everyday life',
        productBenefits: benefits.split(',').map(s => s.trim()),
        specialOffers,
        requiredCTA,
        brandGuidelines,
        contentRestrictions
      },
      bannerImage
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-content-primary/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-surface-card rounded-card-lg border border-surface-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with step progress */}
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center justify-between pb-4">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                Multi-Step Campaign Wizard
              </span>
              <h2 className="text-xl font-bold text-content-primary">
                {step === 1 && 'Step 1: Campaign Details & Objective'}
                {step === 2 && 'Step 2: Target Audience & Platforms'}
                {step === 3 && 'Step 3: Budget & Timeline'}
                {step === 4 && 'Step 4: Deliverables & Brand Brief'}
                {step === 5 && 'Step 5: Review & Publish Campaign'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-content-muted hover:text-content-primary rounded-xl hover:bg-surface-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    s <= step ? 'bg-brand-primary' : 'bg-surface-border'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: Campaign Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nirvana Ion ANC: Silence The Noise in Indian Commutes"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="boAt Lifestyle"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Product or Service *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. boAt Nirvana Ion ANC Earbuds"
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Campaign Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the campaign theme, creator vision, and overall vibe..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Campaign Objective
                </label>
                <input
                  type="text"
                  placeholder="e.g. Drive 10,000 product trial visits and boost awareness in Metro cities"
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Target Audience */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Creator Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoriesList.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCreatorCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        creatorCategory === cat
                          ? 'bg-brand-primary text-white border-brand-primary font-medium'
                          : 'bg-surface-bg text-content-secondary border-surface-border hover:border-brand-soft'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Target Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Pan-India or Bengaluru, Mumbai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Minimum Followers Requirement
                  </label>
                  <input
                    type="number"
                    value={minFollowers}
                    onChange={e => setMinFollowers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Target Audience Demographics
                </label>
                <input
                  type="text"
                  value={audienceType}
                  onChange={e => setAudienceType(e.target.value)}
                  placeholder="e.g. Tech lovers, gym goers, college students aged 18-35"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Platforms Required *
                </label>
                <div className="flex flex-wrap gap-2">
                  {platformsList.map(p => {
                    const isSelected = selectedPlatforms.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary font-medium'
                            : 'bg-surface-bg text-content-secondary border-surface-border hover:border-brand-soft'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Timeline */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Total Campaign Budget (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary font-semibold"
                  />
                  <span className="text-[11px] text-content-muted mt-1 block">
                    Formatted: {formatINR(budget)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Payment Per Creator (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={creatorPayment}
                    onChange={e => setCreatorPayment(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary font-semibold"
                  />
                  <span className="text-[11px] text-content-muted mt-1 block">
                    Formatted: {formatINR(creatorPayment)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Payment & Escrow Protection
                </label>
                <input
                  type="text"
                  disabled
                  value={paymentMethod}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm bg-surface-bg text-content-secondary"
                />
                <span className="text-[11px] text-status-success font-medium mt-1 block">
                  ✓ Funds held securely in CreatorBridge Escrow until deliverables are approved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Campaign Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Campaign End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Deliverables & Brand Brief */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-content-muted mb-2">
                  Required Deliverables Per Creator
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-surface-border bg-surface-bg text-center">
                    <span className="text-xs text-content-secondary block">Instagram Reels</span>
                    <input
                      type="number"
                      min={0}
                      value={reelsCount}
                      onChange={e => setReelsCount(Number(e.target.value))}
                      className="w-16 mx-auto mt-1 text-center font-bold text-lg bg-white border rounded-lg py-1"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-surface-border bg-surface-bg text-center">
                    <span className="text-xs text-content-secondary block">Instagram Stories</span>
                    <input
                      type="number"
                      min={0}
                      value={storiesCount}
                      onChange={e => setStoriesCount(Number(e.target.value))}
                      className="w-16 mx-auto mt-1 text-center font-bold text-lg bg-white border rounded-lg py-1"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-surface-border bg-surface-bg text-center">
                    <span className="text-xs text-content-secondary block">Feed Posts</span>
                    <input
                      type="number"
                      min={0}
                      value={postsCount}
                      onChange={e => setPostsCount(Number(e.target.value))}
                      className="w-16 mx-auto mt-1 text-center font-bold text-lg bg-white border rounded-lg py-1"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-surface-border bg-surface-bg text-center">
                    <span className="text-xs text-content-secondary block">YouTube Videos</span>
                    <input
                      type="number"
                      min={0}
                      value={youtubeVideosCount}
                      onChange={e => setYoutubeVideosCount(Number(e.target.value))}
                      className="w-16 mx-auto mt-1 text-center font-bold text-lg bg-white border rounded-lg py-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Product Benefits (Used by AI Script Writer) *
                </label>
                <input
                  type="text"
                  value={benefits}
                  onChange={e => setBenefits(e.target.value)}
                  placeholder="Comma separated key benefits"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Special Offer / Promo Code
                  </label>
                  <input
                    type="text"
                    value={specialOffers}
                    onChange={e => setSpecialOffers(e.target.value)}
                    placeholder="e.g. 10% off with CREATORBOAT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Mandatory Call to Action (CTA) *
                  </label>
                  <input
                    type="text"
                    value={requiredCTA}
                    onChange={e => setRequiredCTA(e.target.value)}
                    placeholder="e.g. Tap link in bio to buy now"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Brand Guidelines
                  </label>
                  <textarea
                    rows={2}
                    value={brandGuidelines}
                    onChange={e => setBrandGuidelines(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Content Restrictions
                  </label>
                  <textarea
                    rows={2}
                    value={contentRestrictions}
                    onChange={e => setContentRestrictions(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Preview & Publish */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-brand-light/40 border border-brand-soft">
                <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" /> Ready to Launch on CreatorBridge
                </div>
                <h3 className="text-lg font-bold text-content-primary">
                  {title || 'Nirvana Ion ANC Launch Campaign'}
                </h3>
                <p className="text-xs text-content-secondary mt-1">
                  {description || 'Showcase product in everyday lifestyle.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-surface-border bg-white">
                  <span className="text-content-muted block">Budget</span>
                  <span className="font-bold text-content-primary text-sm mt-0.5 block">{formatINR(budget)}</span>
                </div>
                <div className="p-3 rounded-xl border border-surface-border bg-white">
                  <span className="text-content-muted block">Per Creator Fee</span>
                  <span className="font-bold text-brand-primary text-sm mt-0.5 block">{formatINR(creatorPayment)}</span>
                </div>
                <div className="p-3 rounded-xl border border-surface-border bg-white">
                  <span className="text-content-muted block">Category</span>
                  <span className="font-bold text-content-primary text-sm mt-0.5 block">{creatorCategory}</span>
                </div>
                <div className="p-3 rounded-xl border border-surface-border bg-white">
                  <span className="text-content-muted block">Deadline</span>
                  <span className="font-bold text-content-primary text-sm mt-0.5 block">{deadline}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-surface-border bg-surface-bg text-xs space-y-2">
                <div className="font-bold text-content-primary text-sm">Campaign Brief Preview for AI Script Writer:</div>
                <div><span className="font-semibold text-content-secondary">Product Benefits:</span> {benefits}</div>
                <div><span className="font-semibold text-content-secondary">Call to Action:</span> {requiredCTA}</div>
                <div><span className="font-semibold text-content-secondary">Special Offers:</span> {specialOffers}</div>
                <div><span className="font-semibold text-content-secondary">Guidelines:</span> {brandGuidelines}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between bg-surface-bg/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-surface-border bg-white text-content-primary hover:bg-surface-bg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2.5 text-xs font-semibold rounded-xl bg-brand-primary text-white hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand-primary text-white hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/25"
            >
              <Sparkles className="w-4 h-4" />
              Publish Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
