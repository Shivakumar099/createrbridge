import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import {
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export const ForBrandsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col text-[#17152F] font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-6 2xl:px-8 py-10 space-y-[28px] animate-fade-in">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7FD] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Solutions for Brands</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#17152F] tracking-tight">
            Scale Influencer Marketing with Certainty
          </h1>
          <p className="text-sm sm:text-base text-[#77758B]">
            Stop managing messy DMs and manual spreadsheets. CreatorBridge provides verified metrics, escrow payments, and content review workflows in one unified dashboard.
          </p>
          <div className="pt-2">
            <Link
              to="/signup/brand"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6425E8] hover:bg-[#521dc7] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#6425E8]/20 transition-all"
            >
              <span>Get Started as Brand</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-3">
            <Users className="w-8 h-8 text-[#6425E8]" />
            <h3 className="text-lg font-bold text-[#17152F]">10,000+ Verified Creators</h3>
            <p className="text-xs text-[#77758B] leading-relaxed">
              Filter creators by authentic follower count, verified city location, real average view counts, and audited engagement rates.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#6425E8]" />
            <h3 className="text-lg font-bold text-[#17152F]">Safe Escrow Protection</h3>
            <p className="text-xs text-[#77758B] leading-relaxed">
              Your budget is safely locked in escrow and only released after you inspect and approve submitted creator videos and stories.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-3">
            <BarChart3 className="w-8 h-8 text-[#6425E8]" />
            <h3 className="text-lg font-bold text-[#17152F]">Campaign ROI Analytics</h3>
            <p className="text-xs text-[#77758B] leading-relaxed">
              Track total reach, cost per view (CPV), engagement benchmarks, and deliverable milestones in real-time.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-[#EAE8F2] text-center text-xs text-[#77758B] bg-white">
        © 2026 CreatorBridge. All rights reserved.
      </footer>
    </div>
  );
};
