import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sparkles, Users, Award, ShieldCheck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col text-[#17152F] font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-[1020px] w-full mx-auto px-4 md:px-6 2xl:px-8 py-10 space-y-[28px] animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE7FD] text-[#6425E8] text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#17152F] tracking-tight">
            About CreatorBridge
          </h1>
          <p className="text-sm sm:text-base text-[#77758B] max-w-xl mx-auto leading-relaxed">
            CreatorBridge was founded to bridge the gap between forward-thinking Indian businesses and talented digital content creators.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#EAE8F2] p-8 sm:p-10 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#17152F]">Why We Built CreatorBridge</h2>
          <p className="text-xs sm:text-sm text-[#555368] leading-relaxed">
            Influencer marketing in India has exploded, but the day-to-day workflow remained chaotic: endless WhatsApp messages, delayed payments, non-transparent metrics, and misaligned creative expectations.
          </p>
          <p className="text-xs sm:text-sm text-[#555368] leading-relaxed">
            CreatorBridge eliminates these friction points by providing a secure escrow system, an AI script assistant that turns brand briefs into actionable hooks, and structured review stages so brands and creators thrive together.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#F0EDF6] text-center">
            <div>
              <div className="text-2xl font-extrabold text-[#6425E8]">10,000+</div>
              <div className="text-xs text-[#77758B] mt-0.5">Creators</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#6425E8]">500+</div>
              <div className="text-xs text-[#77758B] mt-0.5">Partner Brands</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#6425E8]">₹5 Cr+</div>
              <div className="text-xs text-[#77758B] mt-0.5">Escrow Payouts</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#6425E8]">99.4%</div>
              <div className="text-xs text-[#77758B] mt-0.5">Satisfaction</div>
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
