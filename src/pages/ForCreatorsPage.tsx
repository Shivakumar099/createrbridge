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
  FileCheck2,
  Crown,
  Check
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

        {/* Creator Membership Plans Section */}
        <div className="pt-10 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2ECFF] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5" />
              <span>Creator Membership Plans</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17152F]">
              Transparent Pricing for Ambitious Creators
            </h2>
            <p className="text-xs sm:text-sm text-[#77758B]">
              No hidden fees. Scale your applications, pitch to leading brands, and get full studio tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Creator Pro */}
            <div className="rounded-[24px] bg-white border border-[#EAE8F2] p-7 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#17152F]">Creator Pro</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F2ECFF] text-[#6425E8]">
                    50% OFF
                  </span>
                </div>
                <div className="my-5 p-4 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-[#9CA3AF] line-through font-semibold">₹599</span>
                    <span className="text-3xl font-extrabold text-[#17152F]">₹299</span>
                    <span className="text-xs text-[#77758B]">/ month</span>
                  </div>
                  <span className="text-[11px] text-[#77758B] block mt-1">+ 18% GST • Cancel anytime</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#555368]">
                  {[
                    "Unlimited campaign applications",
                    "AI Script Writer",
                    "30 AI scripts per month",
                    "Advanced creator portfolio",
                    "Creator analytics",
                    "Application tracking",
                    "Priority support"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#F2ECFF] text-[#6425E8] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  to="/membership"
                  className="w-full h-11 rounded-xl bg-[#F2ECFF] hover:bg-[#6425E8] text-[#6425E8] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Choose Creator Pro</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Creator Premium */}
            <div className="rounded-[24px] bg-white border-2 border-[#6425E8] p-7 shadow-[0_12px_40px_rgba(100,37,232,0.12)] flex flex-col justify-between relative md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#6425E8] to-[#8B5CF6] text-white text-[11px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Recommended Plan</span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#17152F]">Creator Premium</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F2ECFF] text-[#6425E8]">
                    57% OFF
                  </span>
                </div>
                <div className="my-5 p-4 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-[#9CA3AF] line-through font-semibold">₹1399</span>
                    <span className="text-3xl font-extrabold text-[#17152F]">₹599</span>
                    <span className="text-xs text-[#77758B]">/ month</span>
                  </div>
                  <span className="text-[11px] text-[#77758B] block mt-1">+ 18% GST • Cancel anytime</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#555368]">
                  {[
                    "Everything in Creator Pro",
                    "100 AI scripts per month",
                    "Advanced analytics",
                    "Portfolio insights",
                    "Profile promotion credits",
                    "Priority support",
                    "Exclusive creator resources"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#6425E8] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className={i === 0 ? "font-bold text-[#17152F]" : ""}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  to="/membership"
                  className="w-full h-11 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#6425E8]/25"
                >
                  <span>Get Creator Premium</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-[#EAE8F2] text-center text-xs text-[#77758B] bg-white">
        © 2026 CreatorBridge. All rights reserved.
      </footer>
    </div>
  );
};
