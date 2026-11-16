import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Sparkles,
  Building2,
  Bell,
  Menu,
  X,
  ArrowRight,
  Maximize,
  Minimize,
  LogOut,
  ChevronDown,
  Search,
  Users,
  Plus,
  PanelLeft
} from 'lucide-react';

interface NavbarProps {
  onCreateCampaignClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateCampaignClick }) => {
  const { user, role, isAuthenticated, logout, switchRole } = useAuth();
  const { notifications, markAllNotificationsRead, showToast } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isDashboardRoute = location.pathname.startsWith('/brand') || location.pathname.startsWith('/creator');

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed Out', 'You have been successfully logged out.', 'info');
    navigate('/', { replace: true });
  };

  const handleSwitchRole = async (targetRole: 'brand' | 'creator') => {
    await switchRole(targetRole);
    showToast(
      'Role Switched',
      targetRole === 'brand' ? 'Now viewing Brand Control Center' : 'Now viewing Creator Studio',
      'success'
    );
    navigate(targetRole === 'brand' ? '/brand/dashboard' : '/creator/dashboard', { replace: true });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Dynamic Navigation items based on authenticated state & exact role
  const publicNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'Discover Creators', path: '/discover-creators' },
    { label: 'Campaigns', path: '/discover-campaigns' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'For Brands', path: '/for-brands' },
    { label: 'For Creators', path: '/for-creators' },
  ];

  const brandNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'Discover Creators', path: '/brand/discover-creators' },
    { label: 'Campaigns', path: '/brand/campaigns' },
    { label: 'Collaborations', path: '/brand/collaborations' },
    { label: 'Messages', path: '/brand/messages' },
    { label: 'Dashboard', path: '/brand/dashboard' },
  ];

  const creatorNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'Discover Campaigns', path: '/creator/discover-campaigns' },
    { label: 'My Applications', path: '/creator/applications' },
    { label: 'Collaborations', path: '/creator/collaborations' },
    { label: 'AI Script Writer', path: '/creator/ai-script-writer' },
    { label: 'Messages', path: '/creator/messages' },
    { label: 'Dashboard', path: '/creator/dashboard' },
  ];

  const navLinks = !isAuthenticated
    ? publicNavLinks
    : role === 'brand'
    ? brandNavLinks
    : creatorNavLinks;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE8F2] h-[64px] transition-colors select-none">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 2xl:px-8 h-full flex items-center justify-between gap-4">
        {/* Brand / Worksphere Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link to={isAuthenticated ? (role === 'brand' ? '/brand/dashboard' : '/creator/dashboard') : '/'} className="flex items-center gap-2 group">
            {/* Worksphere 8-Ray Starburst Icon matching reference */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-[#6425E8] flex-shrink-0 transition-transform group-hover:scale-105">
              <path
                d="M12 2C12.5523 2 13 2.44772 13 3V6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6V3C11 2.44772 11.4477 2 12 2Z"
                fill="currentColor"
              />
              <path
                d="M12 17C12.5523 17 13 17.4477 13 18V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V18C11 17.4477 11.4477 17 12 17Z"
                fill="currentColor"
              />
              <path
                d="M2 12C2 11.4477 2.44772 11 3 11H6C6.55228 11 7 11.4477 7 12C7 12.5523 6.55228 13 6 13H3C2.44772 13 2 12.5523 2 12Z"
                fill="currentColor"
              />
              <path
                d="M17 12C17 11.4477 17.4477 11 18 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H18C17.4477 13 17 12.5523 17 12Z"
                fill="currentColor"
              />
              <path
                d="M4.92893 4.92893C5.31946 4.53841 5.95262 4.53841 6.34315 4.92893L8.46447 7.05025C8.85499 7.44078 8.85499 8.07394 8.46447 8.46447C8.07394 8.85499 7.44078 8.85499 7.05025 8.46447L4.92893 6.34315C4.53841 5.95262 4.53841 5.31946 4.92893 4.92893Z"
                fill="currentColor"
              />
              <path
                d="M15.5355 15.5355C15.9261 15.145 16.5592 15.145 16.9497 15.5355L19.0711 17.6569C19.4616 18.0474 19.4616 18.6805 19.0711 19.0711C18.6805 19.4616 18.0474 19.4616 17.6569 19.0711L15.5355 16.9497C15.145 16.5592 15.145 15.9261 15.5355 15.5355Z"
                fill="currentColor"
              />
              <path
                d="M19.0711 4.92893C19.4616 5.31946 19.4616 5.95262 19.0711 6.34315L16.9497 8.46447C16.5592 8.85499 15.9261 8.85499 15.5355 8.46447C15.145 8.07394 15.145 7.44078 15.5355 7.05025L17.6569 4.92893C18.0474 4.53841 18.6805 4.53841 19.0711 4.92893Z"
                fill="currentColor"
              />
              <path
                d="M8.46447 15.5355C8.85499 15.9261 8.85499 16.5592 8.46447 16.9497L6.34315 19.0711C5.95262 19.4616 5.31946 19.4616 4.92893 19.0711C4.53841 18.6805 4.53841 18.0474 4.92893 17.6569L7.05025 15.5355C7.44078 15.145 8.07394 15.145 8.46447 15.5355Z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            <span className="text-[19px] font-bold tracking-tight text-[#17152F]">
              Worksphere
            </span>
          </Link>

          {/* Split View / Sidebar Toggle Icon */}
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[#EAE8F2] text-[#77758B] hover:text-[#17152F] hover:bg-[#F9F8FD] transition-colors ml-1"
            title="Toggle Sidebar Layout"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Middle Area: Dashboard Search or Public Links */}
        {isDashboardRoute ? (
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Quick Search ..."
                className="w-full h-[40px] pl-9 pr-4 rounded-xl bg-[#FAFAFC] border border-[#EAE8F2] text-[13px] text-[#17152F] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6425E8] focus:bg-white transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-1 max-w-2xl mx-auto">
            {navLinks.map(link => {
              const isActive = (link.path === '/' && location.pathname === '/') || (link.path !== '/' && location.pathname === link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-[14px] font-medium transition-colors relative py-1.5 ${
                    isActive
                      ? 'text-[#6425E8] font-semibold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#6425E8] after:rounded-full'
                      : 'text-[#77758B] hover:text-[#17152F]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {isDashboardRoute ? (
            <>
              {/* Manage Audience button */}
              <Link
                to={role === 'brand' ? '/brand/discover-creators' : '/creator/discover-campaigns'}
                className="hidden sm:inline-flex items-center gap-2 h-[40px] px-3.5 rounded-xl border border-[#EAE8F2] bg-white text-[13px] font-semibold text-[#17152F] hover:bg-[#FAFAFC] hover:border-[#D1D5DB] transition-all shadow-xs"
              >
                <span>Manage Audience</span>
                <Users className="w-4 h-4 text-[#77758B]" />
              </Link>

              {/* New Campaign button */}
              <button
                type="button"
                onClick={onCreateCampaignClick || (() => navigate('/brand/campaigns/create'))}
                className="inline-flex items-center gap-1.5 h-[40px] px-4 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[13px] font-semibold transition-all shadow-sm shadow-[#6425E8]/25 cursor-pointer"
              >
                <span>New Campaign</span>
                <Plus className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="w-[40px] h-[40px] rounded-xl border border-[#EAE8F2] bg-white hover:bg-[#FAFAFC] flex items-center justify-center text-[#77758B] hover:text-[#17152F] transition-all cursor-pointer shadow-xs relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#EF4444]" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-[16px] border border-[#EAE8F2] shadow-xl p-4 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE8F2]">
                      <span className="font-semibold text-[14px] text-[#17152F]">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[12px] text-[#6425E8] hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto py-2 divide-y divide-[#EAE8F2]/60 text-[13px]">
                      {notifications.slice(0, 4).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            if (notif.linkUrl) navigate(notif.linkUrl);
                          }}
                          className="p-2.5 rounded-xl hover:bg-[#FAFAFF] cursor-pointer"
                        >
                          <p className="font-semibold text-[#17152F] text-[13px]">{notif.title}</p>
                          <p className="text-[#77758B] text-[12px] mt-0.5">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen toggle button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="hidden md:flex p-2 rounded-xl text-[#77758B] hover:text-[#6425E8] hover:bg-[#F2ECFF] transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              {/* Role Switcher Pill */}
              <button
                type="button"
                onClick={() => handleSwitchRole(role === 'brand' ? 'creator' : 'brand')}
                className="hidden xl:inline-flex h-[36px] px-3 rounded-full text-[12px] font-semibold border border-[#6425E8]/30 bg-[#F2ECFF] text-[#6425E8] hover:bg-[#6425E8] hover:text-white transition-all shadow-2xs cursor-pointer items-center gap-1.5"
                title={`Switch view to ${role === 'brand' ? 'Creator' : 'Brand'}`}
              >
                <span>Switch to</span>
                <span className="font-bold">{role === 'brand' ? 'Creator' : 'Brand'}</span>
              </button>
            </>
          ) : (
            <>
              {/* Fullscreen toggle button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="p-2 rounded-xl text-[#77758B] hover:text-[#6425E8] hover:bg-[#F2ECFF] transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              {!isAuthenticated || !user ? (
                /* Public user actions */
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="h-[42px] px-4 text-[14px] font-semibold text-[#17152F] hover:text-[#6425E8] rounded-xl hover:bg-[#F2ECFF]/40 inline-flex items-center transition-colors cursor-pointer"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="h-[42px] px-5 rounded-xl bg-[#6425E8] hover:bg-[#521dc7] text-white text-[14px] font-semibold inline-flex items-center transition-all shadow-sm hover:shadow-md shadow-[#6425E8]/20 cursor-pointer"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                /* Authenticated User Menu */
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="relative p-2 rounded-xl text-[#77758B] hover:text-[#17152F] hover:bg-[#F2ECFF]/40 transition-colors"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#6425E8] text-white text-[9px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSwitchRole(role === 'brand' ? 'creator' : 'brand')}
                    className="h-[36px] px-3 rounded-full text-[12px] font-semibold border border-[#6425E8]/30 bg-[#F2ECFF] text-[#6425E8] hover:bg-[#6425E8] hover:text-white transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="hidden md:inline">Switch to</span>
                    <span className="font-bold">{role === 'brand' ? 'Creator' : 'Brand'}</span>
                  </button>

                  <Link
                    to={role === 'brand' ? '/brand/dashboard' : '/creator/dashboard'}
                    className="flex items-center gap-2.5 pl-2 border-l border-[#EAE8F2] hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                      alt={user?.name || "User"}
                      className="w-8 h-8 rounded-full object-cover border border-[#6425E8]/20"
                    />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-[13px] font-semibold text-[#17152F] leading-tight">{user?.name}</span>
                      <span className="text-[11px] text-[#6425E8] font-medium capitalize">{user?.role} Studio</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-[#77758B] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#77758B] hover:text-[#17152F] hover:bg-[#F2ECFF]/40 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#EAE8F2] px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-[14px] font-medium text-[#17152F] hover:bg-[#F2ECFF]/40"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <div className="pt-2 border-t border-[#EAE8F2] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSwitchRole(role === 'brand' ? 'creator' : 'brand');
                }}
                className="text-[13px] font-bold text-[#6425E8]"
              >
                Switch to {role === 'brand' ? 'Creator' : 'Brand'}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-[13px] font-bold text-[#EF4444]"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
