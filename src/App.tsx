import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PookieFloatingBar } from './components/common/PookieFloatingBar';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { ExplorePage } from './pages/public/ExplorePage';
import { CreatePage } from './pages/public/CreatePage';
import { QuizPlayPage } from './pages/public/QuizPlayPage';
import { AnonymousPlayPage } from './pages/public/AnonymousPlayPage';
import { PollPlayPage } from './pages/public/PollPlayPage';
import { AboutPage } from './pages/public/AboutPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { GuidelinesPage } from './pages/public/GuidelinesPage';
import { ReportPage } from './pages/public/ReportPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Creator Dashboard pages
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { DashboardExperiences } from './pages/dashboard/DashboardExperiences';
import { DashboardResponses } from './pages/dashboard/DashboardResponses';
import { DashboardSettings } from './pages/dashboard/DashboardSettings';

// Admin Protected pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminExperiences } from './pages/admin/AdminExperiences';
import { AdminSubmissions } from './pages/admin/AdminSubmissions';
import { AdminAnonymousResponses } from './pages/admin/AdminAnonymousResponses';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuchsia-50/70 via-purple-50/60 to-pink-50/70 text-slate-850 selection:bg-pink-400 selection:text-white transition-colors">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/quiz/:slugOrId" element={<QuizPlayPage />} />
                <Route path="/anonymous/:slugOrId" element={<AnonymousPlayPage />} />
                <Route path="/poll/:slugOrId" element={<PollPlayPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/community-guidelines" element={<GuidelinesPage />} />
                <Route path="/report" element={<ReportPage />} />

                {/* Creator Authenticated Dashboard */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="experiences" element={<DashboardExperiences />} />
                  <Route path="responses" element={<DashboardResponses />} />
                  <Route path="analytics" element={<DashboardResponses />} />
                  <Route path="settings" element={<DashboardSettings />} />
                  <Route path="profile" element={<DashboardSettings />} />
                </Route>

                {/* Platform Admin Console */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="experiences" element={<AdminExperiences />} />
                  <Route path="submissions" element={<AdminSubmissions />} />
                  <Route path="anonymous-responses" element={<AdminAnonymousResponses />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Fallback 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Footer />
            <PookieFloatingBar />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
