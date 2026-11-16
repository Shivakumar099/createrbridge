import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

export const SignUpRolePage: React.FC = () => {
  const navigate = useNavigate();

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
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#77758B] hover:text-[#6425E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </header>

      {/* Main Role Selection Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7FD] text-[#6425E8] text-xs font-bold tracking-wide uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>Choose Your Account Type</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17152F] tracking-tight">
              Join CreatorBridge Today
            </h1>
            <p className="text-sm text-[#77758B] max-w-md mx-auto">
              Select how you want to use the platform. We provide tailored workflows for businesses and content creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A: Brand / Business */}
            <div
              onClick={() => navigate('/signup/brand')}
              className="bg-white rounded-3xl border-2 border-[#EAE8F2] hover:border-[#6425E8] p-8 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-[#6425E8]/10 transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EDE7FD] group-hover:bg-[#6425E8] flex items-center justify-center text-[#6425E8] group-hover:text-white transition-colors shadow-xs">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#17152F] group-hover:text-[#6425E8] transition-colors">
                    I'm a Brand / Business
                  </h2>
                  <p className="text-xs text-[#77758B] mt-1">
                    Hire authentic influencers, run campaigns, manage content submissions, and track verified campaign ROI.
                  </p>
                </div>

                <ul className="space-y-2 pt-2 text-xs text-[#555368]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6425E8] flex-shrink-0" />
                    <span>Search 10,000+ verified creators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6425E8] flex-shrink-0" />
                    <span>Post campaigns & review applications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6425E8] flex-shrink-0" />
                    <span>Escrow payments & real-time analytics</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F0EDF6]">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F8F6FE] group-hover:bg-[#6425E8] text-[#6425E8] group-hover:text-white text-xs sm:text-sm font-bold transition-all"
                >
                  <span>Continue as Brand</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card B: Content Creator */}
            <div
              onClick={() => navigate('/signup/creator')}
              className="bg-white rounded-3xl border-2 border-[#EAE8F2] hover:border-[#6425E8] p-8 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-[#6425E8]/10 transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EDE7FD] group-hover:bg-[#6425E8] flex items-center justify-center text-[#6425E8] group-hover:text-white transition-colors shadow-xs">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#17152F] group-hover:text-[#6425E8] transition-colors">
                    I'm a Content Creator
                  </h2>
                  <p className="text-xs text-[#77758B] mt-1">
                    Discover high-paying brand collaborations, use our AI script writing engine, organize deliverables, and get paid.
                  </p>
                </div>

                <ul className="space-y-2 pt-2 text-xs text-[#555368]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6425E8] flex-shrink-0" />
                    <span>Apply to curated brand campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6425E8] flex-shrink-0" />
                    <span>Built-in AI Script Writer & Content Calendar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6425E8] flex-shrink-0" />
                    <span>Guaranteed on-time milestone payouts</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F0EDF6]">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F8F6FE] group-hover:bg-[#6425E8] text-[#6425E8] group-hover:text-white text-xs sm:text-sm font-bold transition-all"
                >
                  <span>Continue as Creator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Already have an account */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#77758B]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#6425E8] hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#77758B]">
        © 2026 CreatorBridge. Secure collaboration marketplace for Indian creators & brands.
      </footer>
    </div>
  );
};
