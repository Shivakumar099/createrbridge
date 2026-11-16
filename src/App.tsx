import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Route Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';

// Public Marketing & Marketplace Pages
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ForBrandsPage } from './pages/ForBrandsPage';
import { ForCreatorsPage } from './pages/ForCreatorsPage';
import { AboutPage } from './pages/AboutPage';
import { DiscoverCampaignsPage } from './pages/DiscoverCampaignsPage';
import { DiscoverCreatorsPage } from './pages/DiscoverCreatorsPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';

// Authentication Pages
import { LoginPage } from './pages/LoginPage';
import { SignUpRolePage } from './pages/SignUpRolePage';
import { BrandSignUpPage } from './pages/BrandSignUpPage';
import { CreatorSignUpPage } from './pages/CreatorSignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Protected Brand Dashboard Pages
import { BrandDashboard } from './pages/BrandDashboard';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { CollaborationsPage } from './pages/CollaborationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { BrandProfilePage } from './pages/BrandProfilePage';

// Protected Creator Dashboard Pages
import { CreatorDashboard } from './pages/CreatorDashboard';
import { ContentCalendarPage } from './pages/ContentCalendarPage';
import { AIScriptWriterPage } from './pages/AIScriptWriterPage';
import { CreatorPortfolioPage } from './pages/CreatorPortfolioPage';
import { CreatorMembershipPage } from './pages/CreatorMembershipPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/for-brands" element={<ForBrandsPage />} />
            <Route path="/for-creators" element={<ForCreatorsPage />} />
            <Route path="/discover-campaigns" element={<DiscoverCampaignsPage />} />
            <Route path="/discover-creators" element={<DiscoverCreatorsPage />} />
            <Route path="/creator-profile/:id" element={<CreatorProfilePage />} />
            <Route path="/membership" element={<CreatorMembershipPage />} />

            {/* ================= PUBLIC-ONLY AUTH ROUTES ================= */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignUpRolePage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup/brand"
              element={
                <PublicOnlyRoute>
                  <BrandSignUpPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup/creator"
              element={
                <PublicOnlyRoute>
                  <CreatorSignUpPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPasswordPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicOnlyRoute>
                  <ResetPasswordPage />
                </PublicOnlyRoute>
              }
            />

            {/* ================= PROTECTED BRAND ROUTES ================= */}
            <Route
              path="/brand/dashboard"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <BrandDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/campaigns"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <DiscoverCampaignsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/campaigns/create"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <BrandDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/campaigns/:id"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <DiscoverCampaignsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/discover-creators"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <DiscoverCreatorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/applications"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/collaborations"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <CollaborationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/messages"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/analytics"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/payments"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/profile"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <BrandProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand/settings"
              element={
                <ProtectedRoute allowedRoles={['brand']}>
                  <BrandProfilePage />
                </ProtectedRoute>
              }
            />

            {/* ================= PROTECTED CREATOR ROUTES ================= */}
            <Route
              path="/creator/dashboard"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/discover-campaigns"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <DiscoverCampaignsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/applications"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/collaborations"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CollaborationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/calendar"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <ContentCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/ai-script-writer"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <AIScriptWriterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/messages"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/earnings"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/membership"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorMembershipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/membership/plans"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorMembershipPage initialTab="plans" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/membership/checkout"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorMembershipPage initialTab="checkout" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/membership/billing"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorMembershipPage initialTab="billing" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/membership/manage"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorMembershipPage initialTab="manage" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/portfolio"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorPortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/analytics"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/profile"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorPortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/settings"
              element={
                <ProtectedRoute allowedRoles={['creator']}>
                  <CreatorPortfolioPage />
                </ProtectedRoute>
              }
            />

            {/* ================= WILDCARD FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
