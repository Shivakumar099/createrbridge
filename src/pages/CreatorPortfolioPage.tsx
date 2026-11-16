import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CreatorPortfolioItem } from '../types';
import { formatNumber, formatINR } from '../utils/helpers';
import {
  UserCheck,
  Plus,
  Eye,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Save,
  Instagram,
  Youtube
} from 'lucide-react';

export const CreatorPortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const { creators, showToast } = useData();

  const myProfile = (user?.id ? creators.find(c => c.id === user.id) : null) || creators[0];

  const [instagram, setInstagram] = useState(myProfile.instagramHandle);
  const [youtube, setYoutube] = useState(myProfile.youtubeHandle || 'TanyaSharmaVlogs');
  const [reelPrice, setReelPrice] = useState(myProfile.pricing.reel);
  const [storyPrice, setStoryPrice] = useState(myProfile.pricing.story);
  const [videoPrice, setVideoPrice] = useState(myProfile.pricing.video);
  const [bio, setBio] = useState(myProfile.bio);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newType, setNewType] = useState<'Reel' | 'Video' | 'Post'>('Reel');
  const [newThumbnail, setNewThumbnail] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80');

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Commercial Rate Card Updated', 'Your rates are now visible to prospective brands.');
  };

  const handleAddWork = (e: React.FormEvent) => {
    e.preventDefault();
    myProfile.portfolio.unshift({
      id: 'port_' + Date.now(),
      title: newTitle,
      type: newType,
      thumbnail: newThumbnail,
      url: 'https://instagram.com',
      views: '150K',
      likes: '12K',
      brandName: newBrand
    });
    showToast('Portfolio Item Added!', `"${newTitle}" added to your live portfolio.`);
    setIsAdding(false);
    setNewTitle('');
    setNewBrand('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1440px] mx-auto space-y-[28px] animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">Creator Portfolio & Rate Card</h1>
            <p className="text-[14px] text-[#77758B]">
              Showcase your highest converting social deliverables to prospective brands.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="h-[42px] flex items-center gap-1.5 px-5 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[14px] font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Work
          </button>
        </div>

        {/* Add Work Form Modal/Drawer */}
        {isAdding && (
          <form onSubmit={handleAddWork} className="p-[22px] rounded-[16px] bg-white border border-[#6425E8]/30 shadow-subtle space-y-4 text-[14px] animate-slide-down">
            <h3 className="text-[16px] font-semibold text-[#17152F]">Upload Portfolio Work</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                required
                placeholder="Title (e.g. Minimalist Festive Lookbook)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px]"
              />
              <input
                type="text"
                required
                placeholder="Brand Name (e.g. Nykaa)"
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                className="h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px]"
              />
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] bg-white text-[14px]"
              >
                <option value="Reel">Instagram Reel</option>
                <option value="Video">YouTube Video</option>
                <option value="Post">Feed Post</option>
              </select>
            </div>
            <button
              type="submit"
              className="h-[42px] px-6 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white font-semibold text-[14px] cursor-pointer"
            >
              Save to Showcase
            </button>
          </form>
        )}

        {/* Portfolio Gallery Grid: 3 on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {myProfile.portfolio.map(item => (
            <div
              key={item.id}
              className="group rounded-[16px] overflow-hidden border border-[#EAE8F2] bg-white shadow-subtle hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#FAFAFF]">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/70 text-white backdrop-blur-xs">
                  {item.type}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[12px] font-semibold text-[#F2ECFF] block drop-shadow-sm">{item.brandName}</span>
                  <h4 className="text-[14px] font-bold line-clamp-1 drop-shadow-sm">{item.title}</h4>
                </div>
              </div>
              <div className="p-4 bg-white flex items-center justify-between text-[13px] border-t border-[#EAE8F2]">
                <span className="text-[#77758B] font-medium">{item.views} Views</span>
                <span className="text-emerald-600 font-semibold">{item.likes} Likes</span>
              </div>
            </div>
          ))}
        </div>

        {/* Rate Card & Social Handles Editor */}
        <form onSubmit={handleSaveRates} className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-5 text-[14px]">
          <div>
            <h3 className="text-[22px] font-semibold text-[#17152F]">Rate Card & Profile Details</h3>
            <p className="text-[14px] text-[#77758B] mt-0.5">Commercial rates used when brands request direct collaboration quotes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Reel Price (₹)</label>
              <input
                type="number"
                value={reelPrice}
                onChange={e => setReelPrice(Number(e.target.value))}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] font-semibold text-[14px] text-[#17152F]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Story Price (₹)</label>
              <input
                type="number"
                value={storyPrice}
                onChange={e => setStoryPrice(Number(e.target.value))}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] font-semibold text-[14px] text-[#17152F]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">YouTube Video Price (₹)</label>
              <input
                type="number"
                value={videoPrice}
                onChange={e => setVideoPrice(Number(e.target.value))}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] font-semibold text-[14px] text-[#17152F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Instagram Handle</label>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">YouTube Channel</label>
              <input
                type="text"
                value={youtube}
                onChange={e => setYoutube(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-content-secondary mb-1">Bio & Creator Aesthetic</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-brand-primary"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
          >
            <Save className="w-3.5 h-3.5" />
            Update Commercial Rates
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};
