import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { InviteCreatorModal } from '../components/creators/InviteCreatorModal';
import { ToastContainer } from '../components/common/ToastContainer';
import { AuthModal } from '../components/common/AuthModal';
import { formatNumber, formatINR } from '../utils/helpers';
import { CreatorPortfolioItem } from '../types';
import {
  CheckCircle2,
  MapPin,
  Star,
  Users,
  Eye,
  Send,
  ArrowLeft,
  Plus,
  Play,
  Share2,
  Instagram,
  Youtube,
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const CreatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { creators, showToast } = useData();
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const creator = creators.find(c => c.id === id) || creators[0];
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);

  const handleInviteClick = () => {
    if (!isAuthenticated || !user) {
      showToast('Login Required', 'Please log in as a brand to invite creators.', 'warning');
      navigate('/login', { state: { from: { pathname: `/creator-profile/${creator.id}` } } });
      return;
    }
    if (role === 'creator') {
      showToast('Brand Action', 'Only brands can invite creators to campaigns.', 'info');
      return;
    }
    setInviteModalOpen(true);
  };

  // New portfolio item form
  const [portTitle, setPortTitle] = useState('');
  const [portType, setPortType] = useState<'Reel' | 'Video' | 'Post'>('Reel');
  const [portBrand, setPortBrand] = useState('');
  const [portViews, setPortViews] = useState('250K');
  const [portLikes, setPortLikes] = useState('18K');
  const [portThumbnail, setPortThumbnail] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80');

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: CreatorPortfolioItem = {
      id: 'port_' + Date.now(),
      title: portTitle,
      type: portType,
      thumbnail: portThumbnail,
      url: 'https://instagram.com',
      views: portViews,
      likes: portLikes,
      brandName: portBrand || 'Brand Collaboration'
    };
    creator.portfolio.unshift(newItem);
    showToast('Portfolio Item Added!', `"${portTitle}" has been added to your portfolio showcase.`);
    setIsAddingPortfolio(false);
    setPortTitle('');
    setPortBrand('');
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <Link
          to="/discover-creators"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-brand-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover Creators
        </Link>

        {/* Profile Header Banner Card */}
        <div className="p-6 sm:p-8 rounded-card-lg bg-surface-card border border-surface-border shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={creator.profilePhoto}
                alt={creator.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md"
              />
              {creator.verified && (
                <div className="absolute -bottom-1 -right-1 bg-brand-primary text-white p-1 rounded-full ring-2 ring-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-content-primary">
                  {creator.fullName}
                </h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  {creator.rating} ({creator.reviewCount} reviews)
                </div>
              </div>

              <p className="text-xs sm:text-sm text-brand-primary font-semibold flex items-center gap-3">
                <span>{creator.instagramHandle}</span>
                {creator.youtubeHandle && <span className="text-content-muted">• {creator.youtubeHandle}</span>}
              </p>

              <p className="text-xs text-content-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" /> {creator.location}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {creator.categories.map(cat => (
                  <span
                    key={cat}
                    className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-light text-brand-primary"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleInviteClick}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
            >
              <Send className="w-4 h-4" />
              Invite to Campaign
            </button>
          </div>
        </div>

        {/* Bio and Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-card bg-surface-card border border-surface-border text-center shadow-subtle">
            <span className="text-xs text-content-muted block font-medium">Instagram Audience</span>
            <span className="text-xl font-extrabold text-content-primary mt-1 block">
              {formatNumber(creator.followersCount)}
            </span>
          </div>

          <div className="p-4 rounded-card bg-surface-card border border-surface-border text-center shadow-subtle">
            <span className="text-xs text-content-muted block font-medium">Average Video Views</span>
            <span className="text-xl font-extrabold text-content-primary mt-1 block">
              {formatNumber(creator.avgViews)}
            </span>
          </div>

          <div className="p-4 rounded-card bg-surface-card border border-surface-border text-center shadow-subtle">
            <span className="text-xs text-content-muted block font-medium">Engagement Rate</span>
            <span className="text-xl font-extrabold text-status-success mt-1 block">
              {creator.engagementRate}%
            </span>
          </div>

          <div className="p-4 rounded-card bg-surface-card border border-surface-border text-center shadow-subtle">
            <span className="text-xs text-content-muted block font-medium">Completed Collabs</span>
            <span className="text-xl font-extrabold text-brand-primary mt-1 block">
              {creator.reviewCount}+ Deals
            </span>
          </div>
        </div>

        {/* Standard Rate Card */}
        <div className="p-6 rounded-card bg-surface-card border border-surface-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-content-primary">Standard Rate Card</h3>
              <p className="text-xs text-content-secondary">Indicative commercial rates per content deliverable</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-bg border border-surface-border text-center">
              <span className="text-xs text-content-muted block font-medium">1x Instagram Reel</span>
              <span className="text-base font-bold text-content-primary mt-1 block">
                {formatINR(creator.pricing.reel)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-bg border border-surface-border text-center">
              <span className="text-xs text-content-muted block font-medium">1x Instagram Story</span>
              <span className="text-base font-bold text-content-primary mt-1 block">
                {formatINR(creator.pricing.story)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-bg border border-surface-border text-center">
              <span className="text-xs text-content-muted block font-medium">1x Feed Post</span>
              <span className="text-base font-bold text-content-primary mt-1 block">
                {formatINR(creator.pricing.post)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-bg border border-surface-border text-center">
              <span className="text-xs text-content-muted block font-medium">Dedicated YouTube Video</span>
              <span className="text-base font-bold text-content-primary mt-1 block">
                {formatINR(creator.pricing.video)}
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Gallery */}
        <div className="p-6 rounded-card bg-surface-card border border-surface-border shadow-subtle space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-content-primary">Featured Brand Work & Portfolio</h3>
              <p className="text-xs text-content-secondary">High-performing reels, lookbooks, and authentic reviews</p>
            </div>

            {/* Creator can add portfolio item */}
            <button
              onClick={() => setIsAddingPortfolio(!isAddingPortfolio)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-primary text-brand-primary hover:bg-brand-light text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Portfolio Work
            </button>
          </div>

          {/* Form to add portfolio item */}
          {isAddingPortfolio && (
            <form onSubmit={handleAddPortfolio} className="p-4 rounded-xl bg-brand-light/40 border border-brand-soft space-y-3 animate-slide-down text-xs">
              <h4 className="font-bold text-content-primary">Upload Portfolio Content</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Content Title (e.g. Minimalist Festive Reel)"
                  value={portTitle}
                  onChange={e => setPortTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-white focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Brand Name (e.g. Nykaa)"
                  value={portBrand}
                  onChange={e => setPortBrand(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-white focus:outline-none"
                />
                <select
                  value={portType}
                  onChange={e => setPortType(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border bg-white focus:outline-none"
                >
                  <option value="Reel">Reel</option>
                  <option value="Video">YouTube Video</option>
                  <option value="Post">Feed Post</option>
                </select>
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-secondary"
              >
                Save Portfolio Item
              </button>
            </form>
          )}

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creator.portfolio.map(item => (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden border border-surface-border bg-surface-bg flex flex-col"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
                    {item.type}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-semibold text-brand-light block">{item.brandName}</span>
                    <h4 className="text-xs font-bold line-clamp-1">{item.title}</h4>
                  </div>
                </div>

                <div className="p-3 bg-white flex items-center justify-between text-xs">
                  <span className="text-content-secondary font-medium flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-content-muted" /> {item.views} Views
                  </span>
                  <span className="text-status-success font-semibold">
                    {item.likes} Likes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Reviews & Endorsements */}
        <div className="p-6 rounded-card bg-surface-card border border-surface-border shadow-subtle space-y-4">
          <h3 className="text-base font-bold text-content-primary">Brand Reviews & Ratings</h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-surface-bg border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-content-primary">boAt Lifestyle — Audio Campaign</span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                "Tanya delivered the draft within 48 hours and incorporated all our hybrid ANC guidelines flawlessly. The reel drove over 400K impressions and highest affiliate conversions this quarter!"
              </p>
              <span className="text-[10px] text-content-muted block">— Vikram Sethi, Marketing Lead</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-bg border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-content-primary">Nykaa Beauty — Glass Skin Launch</span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                "Super professional creator. Clean camera setup, natural lighting, and punctual deliverable handoff."
              </p>
              <span className="text-[10px] text-content-muted block">— Partnerships Team, Nykaa</span>
            </div>
          </div>
        </div>
      </main>

      <InviteCreatorModal
        creator={creator}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
      <ToastContainer />
      <AuthModal />
    </div>
  );
};
