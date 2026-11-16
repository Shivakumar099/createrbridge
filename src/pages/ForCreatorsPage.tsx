import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import {
  Sparkles,
  CreditCard,
  Calendar,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export const ForCreatorsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col text-[#17152F] font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-6 2xl:px-8 py-10 space-y-[28px] animate-fade-in">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7FD] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Content Creators</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#17152F] tracking-tight">
            Monetise Your Passion with Real Deals
          </h1>
          <p className="text-sm sm:text-base text-[#77758B]">
            Get discovered by top Indian brands, use our AI Script Writer to draft viral content hooks, organize your shooting schedule, and get paid on time.
          </p>
          <div className="pt-2">
            <Link
              to="/signup/creator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6425E8] hover:bg-[#521dc7] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#6425E8]/20 transition-all"
            >
              <span>Get Started as Creator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-3">
            <Sparkles className="w-8 h-8 text-[#6425E8]" />
            <h3 className="text-lg font-bold text-[#17152F]">AI Script Writing Engine</h3>
            <p className="text-xs text-[#77758B] leading-relaxed">
              Auto-generate viral Reel and Short scripts in English, Hinglish, or Hindi, tailored directly to the brand brief with high-converting hooks and CTAs.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-3">
            <CreditCard className="w-8 h-8 text-[#6425E8]" />
            <h3 className="text-lg font-bold text-[#17152F]">Guaranteed Payments</h3>
            <p className="text-xs text-[#77758B] leading-relaxed">
              No more chasing brand payments for months. All campaign funds are deposited into verified Escrow before you begin shooting.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-3">
            <Calendar className="w-8 h-8 text-[#6425E8]" />
            <h3 className="text-lg font-bold text-[#17152F]">Content Calendar</h3>
            <p className="text-xs text-[#77758B] leading-relaxed">
              Manage your shooting dates, script drafts, editing deadlines, and brand revision notes in one intuitive interactive calendar.
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
