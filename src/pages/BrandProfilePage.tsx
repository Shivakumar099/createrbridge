import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Building2, MapPin, Globe, CheckCircle2, Mail, Phone, Save } from 'lucide-react';

export const BrandProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useData();

  const [companyName, setCompanyName] = useState(user?.businessName || 'boAt Lifestyle');
  const [website, setWebsite] = useState('https://www.boat-lifestyle.com');
  const [description, setDescription] = useState("India's leading consumer tech brand delivering premium wireless audio, ANC earphones, and trendy smartwatches.");
  const [category, setCategory] = useState('Technology & Audio');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [email, setEmail] = useState('partnerships@boat-lifestyle.com');
  const [phone, setPhone] = useState('+91 98201 44512');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Brand Profile Updated', 'Public company details saved successfully.');
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1020px] mx-auto space-y-[28px] animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-[30px] font-bold text-[#17152F] leading-tight">Brand Profile & Verification</h1>
          <p className="text-[14px] text-[#77758B]">
            Manage your public business listing and verified brand credentials on CreatorBridge.
          </p>
        </div>

        <form onSubmit={handleSave} className="p-[22px] rounded-[16px] bg-white border border-[#EAE8F2] shadow-subtle space-y-6 text-[14px]">
          <div className="flex items-center gap-4 pb-4 border-b border-[#EAE8F2]">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80"
              alt="Brand Logo"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F2ECFF] shadow-sm"
            />
            <div>
              <h3 className="text-[22px] font-semibold text-[#17152F] flex items-center gap-1.5 leading-snug">
                {companyName} <CheckCircle2 className="w-5 h-5 text-[#6425E8]" />
              </h3>
              <p className="text-[13px] text-[#77758B]">{category} • Verified Business Account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Company / Brand Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Company Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Industry Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Headquarters City</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Partnerships Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#77758B] mb-1.5">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-xl border border-[#EAE8F2] focus:outline-none focus:border-[#6425E8] text-[14px] text-[#17152F]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="h-[42px] flex items-center gap-1.5 px-6 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white font-semibold text-[14px] transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};
