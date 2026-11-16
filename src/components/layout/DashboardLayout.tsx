import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CreateCampaignModal } from '../campaigns/CreateCampaignModal';
import { ToastContainer } from '../common/ToastContainer';
import { AuthModal } from '../common/AuthModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col overflow-x-hidden selection:bg-[#F2ECFF] selection:text-[#6425E8]">
      <Navbar onCreateCampaignClick={() => setIsCreateCampaignOpen(true)} />

      {/* Main Container - Maximum Width 1440px with Responsive Padding */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 2xl:px-8 py-6 md:py-8 flex gap-[28px]">
        {/* Desktop Sidebar - exactly 240px width */}
        <div className="hidden lg:block w-[240px] flex-shrink-0">
          <Sidebar onCreateCampaignClick={() => setIsCreateCampaignOpen(true)} />
        </div>

        {/* Main Content Container */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>

      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
      />
      <ToastContainer />
      <AuthModal />
    </div>
  );
};
