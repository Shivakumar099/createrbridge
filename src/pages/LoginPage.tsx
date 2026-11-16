import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Building2,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeRole, setActiveRole] = useState<'creator' | 'brand'>('creator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const targetPath = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password, rememberMe, activeRole);

      if (!result.success) {
        setErrorMessage(result.error || 'Invalid email or password.');
        setIsSubmitting(false);
        return;
      }

      // Successful login -> Redirect
      if (targetPath && typeof targetPath === 'string') {
        if (result.role === 'brand' && targetPath.startsWith('/brand')) {
          navigate(targetPath, { replace: true });
          return;
        }
        if (result.role === 'creator' && targetPath.startsWith('/creator')) {
          navigate(targetPath, { replace: true });
          return;
        }
      }

      // Default role-based redirect
      if (result.role === 'brand') {
        navigate('/brand/dashboard', { replace: true });
      } else {
        navigate('/creator/dashboard', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage('Connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (role: 'brand' | 'creator') => {
    setErrorMessage('');
    setActiveRole(role);
    if (role === 'brand') {
      setEmail('partnerships@boat-lifestyle.com');
      setPassword('password123');
    } else {
      setEmail('tanya@tanyastyle.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col justify-between text-[#17152F] font-sans antialiased">
      {/* Top Simple Header */}
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
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#77758B] hover:text-[#6425E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px] bg-white rounded-3xl border border-[#EAE8F2] shadow-xl shadow-[#6425E8]/5 p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152F] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#77758B]">
              {activeRole === 'creator'
                ? 'Log in to Creator Studio & track brand collaborations'
                : 'Log in to Brand Control Center & discover top creators'}
            </p>
          </div>

          {/* Account Role Chooser Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F4F2F8] rounded-2xl border border-[#EAE8F2]">
            <button
              type="button"
              onClick={() => setActiveRole('creator')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'creator'
                  ? 'bg-white text-[#6425E8] shadow-sm'
                  : 'text-[#77758B] hover:text-[#17152F]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#6425E8]" />
              <span>Content Creator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('brand')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'brand'
                  ? 'bg-white text-[#6425E8] shadow-sm'
                  : 'text-[#77758B] hover:text-[#17152F]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#6425E8]" />
              <span>Brand Partner</span>
            </button>
          </div>

          {/* Quick Demo Fill Buttons for convenience */}
          <div className="p-3 bg-[#F8F6FE] border border-[#E8DDFF] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6425E8] uppercase tracking-wider">
                Instant Test Credentials
              </span>
              <span className="text-[10px] text-[#77758B]">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('creator')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-xl border text-[11px] font-semibold transition-all shadow-2xs ${
                  activeRole === 'creator' ? 'border-[#6425E8] text-[#6425E8] ring-1 ring-[#6425E8]/20' : 'border-[#EAE8F2] text-[#17152F]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6425E8]" />
                <span>Creator Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('brand')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-xl border text-[11px] font-semibold transition-all shadow-2xs ${
                  activeRole === 'brand' ? 'border-[#6425E8] text-[#6425E8] ring-1 ring-[#6425E8]/20' : 'border-[#EAE8F2] text-[#17152F]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#6425E8]" />
                <span>Brand Demo</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17152F]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9E9CAB] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@business.com or creator@mail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE8F2] bg-white text-xs sm:text-sm text-[#17152F] placeholder-[#9E9CAB] focus:outline-none focus:border-[#6425E8] focus:ring-2 focus:ring-[#6425E8]/10 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#17152F]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#6425E8] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9E9CAB] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EAE8F2] bg-white text-xs sm:text-sm text-[#17152F] placeholder-[#9E9CAB] focus:outline-none focus:border-[#6425E8] focus:ring-2 focus:ring-[#6425E8]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E9CAB] hover:text-[#17152F] transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6425E8] focus:ring-[#6425E8] border-gray-300 rounded cursor-pointer accent-[#6425E8]"
                />
                <span className="text-xs text-[#555368] font-medium">Remember me on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#6425E8]/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="pt-2 text-center border-t border-[#F0EDF6]">
            <p className="text-xs text-[#77758B]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-[#6425E8] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#77758B]">
        © 2026 CreatorBridge. All rights reserved. India's Premier Collaboration Hub.
      </footer>
    </div>
  );
};
