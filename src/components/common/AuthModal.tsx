import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { X, Building2, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalDefaultRole, login, register, switchRole } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(authModalDefaultRole);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Brand registration state
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [brandEmail, setBrandEmail] = useState('');
  const [brandPhone, setBrandPhone] = useState('');
  const [brandPassword, setBrandPassword] = useState('');
  const [brandCategory, setBrandCategory] = useState('Technology & Audio');
  const [brandLocation, setBrandLocation] = useState('Bengaluru, Karnataka');

  // Creator registration state
  const [creatorName, setCreatorName] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [creatorPhone, setCreatorPhone] = useState('');
  const [creatorPassword, setCreatorPassword] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [youtubeHandle, setYoutubeHandle] = useState('');
  const [creatorLocation, setCreatorLocation] = useState('Mumbai, Maharashtra');
  const [followersCount, setFollowersCount] = useState('485000');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Fashion', 'Lifestyle']);

  if (!isAuthModalOpen) return null;

  const categoriesList = ['Fashion', 'Lifestyle', 'Beauty', 'Technology', 'Food & Beverage', 'Fitness', 'Travel', 'Gaming'];

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginEmail, selectedRole);
    if (selectedRole === 'brand') {
      navigate('/brand/dashboard');
    } else {
      navigate('/creator/dashboard');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'brand') {
      await register({
        role: 'brand',
        businessName,
        ownerName,
        email: brandEmail,
        phone: brandPhone,
        password: brandPassword,
        category: brandCategory,
        location: brandLocation,
      });
      navigate('/brand/dashboard');
    } else {
      await register({
        role: 'creator',
        fullName: creatorName,
        email: creatorEmail,
        phone: creatorPhone,
        password: creatorPassword,
        instagramHandle,
        youtubeHandle,
        categories: selectedCategories,
        location: creatorLocation,
        followersCount: Number(followersCount) || 50000,
      });
      navigate('/creator/dashboard');
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    closeAuthModal();
    if (role === 'brand') {
      navigate('/brand/dashboard');
    } else {
      navigate('/creator/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-content-primary/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-surface-card rounded-card-lg border border-surface-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-border">
          <div>
            <h2 className="text-xl font-bold text-content-primary">
              {activeTab === 'login' ? 'Welcome Back to CreatorBridge' : 'Create Your Account'}
            </h2>
            <p className="text-sm text-content-secondary mt-0.5">
              Connecting India's top brands with premier creators.
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 text-content-muted hover:text-content-primary rounded-lg hover:bg-surface-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Demo Switcher Banner */}
          <div className="p-4 rounded-xl bg-brand-light/60 border border-brand-soft flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-brand-primary flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-content-primary">Instant Testing:</span> Explore both dashboards with 1-click
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleQuickDemo('brand')}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-primary text-white hover:bg-brand-secondary transition-colors"
              >
                Demo as Brand
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('creator')}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-brand-primary text-brand-primary hover:bg-brand-light transition-colors"
              >
                Demo as Creator
              </button>
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-content-muted mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('brand')}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                  selectedRole === 'brand'
                    ? 'border-brand-primary bg-brand-light/40 text-brand-primary font-semibold shadow-sm'
                    : 'border-surface-border bg-white text-content-secondary hover:border-brand-soft'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm leading-tight">I'm a Brand</div>
                  <div className="text-xs text-content-muted font-normal">Business or Agency</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('creator')}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                  selectedRole === 'creator'
                    ? 'border-brand-primary bg-brand-light/40 text-brand-primary font-semibold shadow-sm'
                    : 'border-surface-border bg-white text-content-secondary hover:border-brand-soft'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm leading-tight">I'm a Creator</div>
                  <div className="text-xs text-content-muted font-normal">Influencer / Artist</div>
                </div>
              </button>
            </div>
          </div>

          {/* Form Tabs: Login vs Register */}
          <div className="flex border-b border-surface-border">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors ${
                activeTab === 'login'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-content-secondary hover:text-content-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors ${
                activeTab === 'register'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-content-secondary hover:text-content-primary'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder={selectedRole === 'brand' ? 'partnerships@boat-lifestyle.com' : 'tanya@tanyastyle.com'}
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-semibold text-sm transition-all shadow-md shadow-brand-primary/20 mt-2"
              >
                Sign In to {selectedRole === 'brand' ? 'Brand Dashboard' : 'Creator Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTRATION FORM */}
          {activeTab === 'register' && selectedRole === 'brand' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. boAt Lifestyle"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Owner / Manager Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sethi"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="collabs@brand.com"
                    value={brandEmail}
                    onChange={e => setBrandEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 12345"
                    value={brandPhone}
                    onChange={e => setBrandPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Business Category
                  </label>
                  <select
                    value={brandCategory}
                    onChange={e => setBrandCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm bg-white"
                  >
                    <option>Technology & Audio</option>
                    <option>Beauty & Skincare</option>
                    <option>Food & Dining</option>
                    <option>Fitness & Wellness</option>
                    <option>Fashion & Apparel</option>
                    <option>Travel & Hospitality</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, Karnataka"
                    value={brandLocation}
                    onChange={e => setBrandLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={brandPassword}
                  onChange={e => setBrandPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-semibold text-sm transition-all shadow-md shadow-brand-primary/20 mt-2"
              >
                Complete Brand Registration
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'register' && selectedRole === 'creator' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanya Sharma"
                    value={creatorName}
                    onChange={e => setCreatorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="creator@gmail.com"
                    value={creatorEmail}
                    onChange={e => setCreatorEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@yourhandle"
                    value={instagramHandle}
                    onChange={e => setInstagramHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Total Followers Count
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 250000"
                    value={followersCount}
                    onChange={e => setFollowersCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    YouTube Channel (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="YouTube channel name"
                    value={youtubeHandle}
                    onChange={e => setYoutubeHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={creatorLocation}
                    onChange={e => setCreatorLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  Content Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoriesList.map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary font-medium'
                            : 'bg-surface-bg text-content-secondary border-surface-border hover:border-brand-soft'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={creatorPassword}
                  onChange={e => setCreatorPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-semibold text-sm transition-all shadow-md shadow-brand-primary/20 mt-2"
              >
                Complete Creator Registration
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
