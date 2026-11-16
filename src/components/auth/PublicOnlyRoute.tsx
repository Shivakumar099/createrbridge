import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFF] flex flex-col items-center justify-center p-6 select-none animate-fade-in">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#6425E8] to-[#8B5CF6] text-white shadow-md shadow-[#6425E8]/25 animate-pulse">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to their role dashboard or target destination
  if (isAuthenticated && user) {
    const fromPath = (location.state as any)?.from?.pathname;
    if (fromPath && typeof fromPath === 'string') {
      // Validate that the target path matches their role
      if (user.role === 'brand' && fromPath.startsWith('/brand')) {
        return <Navigate to={fromPath} replace />;
      }
      if (user.role === 'creator' && fromPath.startsWith('/creator')) {
        return <Navigate to={fromPath} replace />;
      }
    }

    // Default dashboard redirection
    if (user.role === 'brand') {
      return <Navigate to="/brand/dashboard" replace />;
    } else {
      return <Navigate to="/creator/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
