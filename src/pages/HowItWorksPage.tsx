import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import {
  Search,
  Send,
  Sparkles,
  ShieldCheck,
  CreditCard,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col text-[#17152F] font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-6 2xl:px-8 py-10 space-y-[28px] animate-fade-in">
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7FD] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How CreatorBridge Works</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#17152F] tracking-tight">
            Seamless Brand & Creator Collaborations
          </h1>
          <p className="text-sm sm:text-base text-[#77758B]">
            From discovery to script writing, review, delivery and instant payment escrow, our end-to-end platform makes influencer marketing effortless.
          </p>
        </div>

        {/* 3 Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE7FD] text-[#6425E8] flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-[#17152F]">Discover Opportunities</h3>
            <p className="text-xs sm:text-sm text-[#77758B] leading-relaxed">
              Brands post detailed campaign briefs. Creators discover verified opportunities filtered by niche, budget, location, and platform requirements.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE7FD] text-[#6425E8] flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-[#17152F]">Apply or Invite</h3>
            <p className="text-xs sm:text-sm text-[#77758B] leading-relaxed">
              Creators send custom pitches with portfolio showcases. Brands can also directly invite curated top creators with 1-click offers.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE7FD] text-[#6425E8] flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-[#17152F]">Collaborate & Escrow</h3>
            <p className="text-xs sm:text-sm text-[#77758B] leading-relaxed">
              Use our AI Script Writer and Content Calendar. Deliverables are submitted for review, and payments are safely released from escrow upon approval.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#6425E8] to-[#8B5CF6] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-[#6425E8]/20">
          <h2 className="text-2xl sm:text-3xl font-extrabold max-w-xl mx-auto">
            Ready to experience India's easiest collaboration hub?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup/brand"
              className="px-6 py-3 rounded-full bg-white text-[#6425E8] text-xs sm:text-sm font-bold shadow-md hover:bg-gray-100 transition-colors"
            >
              Sign Up as Brand
            </Link>
            <Link
              to="/signup/creator"
              className="px-6 py-3 rounded-full bg-[#17152F] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-black transition-colors"
            >
              Sign Up as Creator
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-[#EAE8F2] text-center text-xs text-[#77758B] bg-white">
        © 2026 CreatorBridge. All rights reserved.
      </footer>
    </div>
  );
};
