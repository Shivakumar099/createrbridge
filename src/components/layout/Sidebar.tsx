import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  BarChart3,
  GitPullRequest,
  Camera,
  FileText,
  Layers,
  Store,
  HelpCircle,
  Settings,
  ChevronsUpDown,
  Zap,
  LogOut,
  Plus,
  Crown
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string | number;
  badgeColor?: string;
}

interface SidebarProps {
  onCreateCampaignClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCreateCampaignClick }) => {
  const { user, role, logout } = useAuth();
  const { applications, showToast } = useData();
  const navigate = useNavigate();

  const isBrand = role === 'brand';

  const menuItems: NavItem[] = [
    { label: 'Dashboard', path: isBrand ? '/brand/dashboard' : '/creator/dashboard', icon: LayoutDashboard },
    { label: isBrand ? 'Discover Creators' : 'Discover Campaigns', path: isBrand ? '/brand/discover-creators' : '/creator/discover-campaigns', icon: Users },
    { label: 'Campaigns', path: isBrand ? '/brand/campaigns' : '/creator/discover-campaigns', icon: Megaphone, badge: 'New!', badgeColor: 'bg-[#F2ECFF] text-[#6425E8]' },
    { label: 'Analytics', path: isBrand ? '/brand/analytics' : '/creator/analytics', icon: BarChart3 },
    { label: 'Automation', path: isBrand ? '/brand/collaborations' : '/creator/collaborations', icon: GitPullRequest },
    { label: 'Content Studio', path: isBrand ? '/creator/ai-script-writer' : '/creator/ai-script-writer', icon: Camera, badge: 3, badgeColor: 'bg-[#FDF2F8] text-[#DB2777]' },
    { label: 'Membership', path: '/creator/membership', icon: Crown, badge: '50% OFF', badgeColor: 'bg-[#F2ECFF] text-[#6425E8]' },
    { label: 'Documents', path: isBrand ? '/brand/applications' : '/creator/applications', icon: FileText },
    { label: 'Integrations', path: isBrand ? '/brand/profile' : '/creator/portfolio', icon: Layers },
  ];

  const secondaryItems: NavItem[] = [
    { label: 'Market Place Sync', path: '/discover-campaigns', icon: Store },
    { label: 'Help & Support', path: '/how-it-works', icon: HelpCircle },
    { label: 'Settings', path: isBrand ? '/brand/settings' : '/creator/profile', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    showToast('Signed Out', 'You have been successfully logged out.', 'info');
    navigate('/', { replace: true });
  };

  return (
    <aside className="w-[240px] bg-white border border-[#EAE8F2] rounded-[20px] shadow-sm flex flex-col h-[calc(100vh-5.5rem)] sticky top-[80px] overflow-hidden select-none">
      {/* Top Profile Card matching Reference */}
      <div className="p-3.5 border-b border-[#F0F1F3]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAFC] hover:bg-[#F4F4F8] transition-colors cursor-pointer border border-[#EAE8F2]">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name || 'Robin William'}
              className="w-9 h-9 rounded-full object-cover border border-[#6425E8]/20 flex-shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-[13px] font-bold text-[#17152F] truncate">
                {user?.name || 'Robin William'}
              </h4>
              <p className="text-[11px] text-[#77758B] truncate">
                {isBrand ? 'Marketing Lead' : 'Content Creator'}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-[#77758B] flex-shrink-0 ml-1" />
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 h-[38px] rounded-xl text-[13.5px] transition-all ${
                  isActive
                    ? 'bg-[#F1F0F7] text-[#17152F] font-bold shadow-2xs'
                    : 'text-[#555368] hover:text-[#17152F] hover:bg-[#F9F8FD] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#17152F]' : 'text-[#77758B]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                        item.badgeColor || 'bg-[#F2ECFF] text-[#6425E8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Separator */}
        <div className="my-2 border-t border-[#F0F1F3]" />

        {secondaryItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 h-[38px] rounded-xl text-[13.5px] transition-all ${
                  isActive
                    ? 'bg-[#F1F0F7] text-[#17152F] font-bold shadow-2xs'
                    : 'text-[#555368] hover:text-[#17152F] hover:bg-[#F9F8FD] font-medium'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 flex-shrink-0 text-[#77758B]" />
                <span className="truncate">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Storage Widget matching Reference */}
      <div className="p-3.5 border-t border-[#F0F1F3]">
        <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#EAE8F2] space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[#17152F]">Storage</span>
            <span className="font-bold text-[#77758B]">78%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#EAE8F2] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#6425E8] rounded-full w-[78%]" />
          </div>

          <p className="text-[11px] text-[#77758B]">
            1.8 GB of 2 GB used
          </p>

          <button
            onClick={() => showToast('Storage Upgrade', 'Storage tier expansion request submitted.', 'info')}
            className="w-full flex items-center justify-center gap-1.5 pt-1 text-[11px] font-bold text-[#17152F] hover:text-[#6425E8] transition-colors cursor-pointer"
          >
            <span>Upgrade Storage (up to 10GB)</span>
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </button>
        </div>
      </div>
    </aside>
  );
};
