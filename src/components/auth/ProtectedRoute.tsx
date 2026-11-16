import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show a clean, branded loading screen while verifying auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFF] flex flex-col items-center justify-center p-6 select-none animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#6425E8] to-[#8B5CF6] text-white shadow-lg shadow-[#6425E8]/25 animate-pulse">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2.2"/>
              <path d="M20.5 7L12 12L3.5 7" stroke="currentColor" strokeWidth="2.2"/>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#6425E8] animate-ping" />
            <span className="text-xs font-bold text-[#17152F] tracking-wider uppercase">
              Verifying Session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login and remember attempted path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Cross-role redirect: Brand tries to access Creator page -> Brand Dashboard
    // Creator tries to access Brand page -> Creator Dashboard
    if (user.role === 'brand') {
      return <Navigate to="/brand/dashboard" replace />;
    } else {
      return <Navigate to="/creator/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
