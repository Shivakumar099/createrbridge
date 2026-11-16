import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  Tag,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

export const BrandSignUpPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [category, setCategory] = useState('Food & Beverage');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Food & Beverage',
    'Technology & Audio',
    'Beauty & Skincare',
    'Fashion & Apparel',
    'Fitness & Health',
    'Travel & Hospitality',
    'Gaming & Esports',
    'E-Commerce & Retail'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!businessName.trim()) {
      setErrorMessage('Please enter your business or brand name.');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMessage('Please enter the owner or manager name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid business email.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please provide a contact phone number.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please accept the Terms of Service to create an account.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        role: 'brand',
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        category,
        location
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed.');
        setIsSubmitting(false);
        return;
      }

      // Successful registration -> Navigate to Brand Dashboard
      navigate('/brand/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMessage('Connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col justify-between text-[#17152F] font-sans antialiased">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#6425E8] to-[#8B5CF6] text-white shadow-md shadow-[#6425E8]/20 group-hover:scale-105 transition-transform">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
              <path d="M20.5 7L12 12L3.5 7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#17152F]">
            CreatorBridge
          </span>
        </Link>

        <Link
          to="/signup"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#77758B] hover:text-[#6425E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Switch Account Type</span>
        </Link>
      </header>

      {/* Main Registration Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[540px] bg-white rounded-3xl border border-[#EAE8F2] shadow-xl shadow-[#6425E8]/5 p-8 sm:p-10 space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7FD] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Brand Account Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152F] tracking-tight">
              Create Your Brand Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#77758B]">
              Connect with top influencers, launch campaigns, and measure real reach
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business & Owner Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Business Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urban Bites Cafe"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Owner / Manager Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="partnerships@brand.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Category</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8] cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, KA"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-9 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#17152F]">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#77758B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#EAE8F2] bg-white text-[14px] text-[#17152F] focus:outline-none focus:border-[#6425E8]"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6425E8] focus:ring-[#6425E8] border-gray-300 accent-[#6425E8]"
                />
                <span className="text-[13px] text-[#77758B]">
                  I agree to the CreatorBridge <span className="text-[#6425E8] font-semibold">Terms of Service</span> and <span className="text-[#6425E8] font-semibold">Privacy Policy</span>.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[46px] flex items-center justify-center gap-2 px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[14px] font-semibold shadow-md shadow-[#6425E8]/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Brand Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Brand Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <div className="text-center pt-2 border-t border-[#F0EDF6]">
            <p className="text-xs text-[#77758B]">
              Already registered as a brand?{' '}
              <Link to="/login" className="font-bold text-[#6425E8] hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#77758B]">
        © 2026 CreatorBridge. Secure collaboration marketplace for Indian creators & brands.
      </footer>
    </div>
  );
};
