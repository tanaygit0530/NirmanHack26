import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts and Pages would be lazily loaded in a real app, but imports are fine for now
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import CitizenDashboard from './pages/citizen/Dashboard';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import AnonymousTracker from './pages/citizen/AnonymousTracker';

import OfficerDashboard from './pages/officer/Dashboard';
import TicketDetail from './pages/officer/TicketDetail';

import AdminDashboard from './pages/admin/Dashboard';
import AdminHeatmap from './pages/admin/Heatmap';
import AdminAnalytics from './pages/admin/Analytics';
import AdminOfficers from './pages/admin/Officers';
import AdminWhistleblower from './pages/admin/Whistleblower';
import AdminCivicMemory from './pages/admin/CivicMemory';
import AdminAuditLog from './pages/admin/AuditLog';

// Role-based protection wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { profile, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-bg font-sora font-extrabold text-navy animate-pulse">Loading NagarVaani Authentication...</div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }
  
  return children;
};

// Route redirection logic if logged in
const PublicOnlyRoute = ({ children }) => {
  const { profile, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-bg font-sora font-extrabold text-navy animate-pulse">Loading NagarVaani Authentication...</div>;
  if (profile) return <Navigate to={`/${profile.role}/dashboard`} replace />;
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans text-text-primary min-h-screen bg-bg antialiased">
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              style: { borderRadius: '16px', fontSora: '700', border: '1px solid #E5E9F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } }
            }} 
          />
          <Suspense fallback={<div className="p-12 text-center text-navy font-sora font-extrabold text-2xl animate-pulse">Initializing Civic Systems...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/track" element={<AnonymousTracker />} />
              <Route path="/auth" element={
                <PublicOnlyRoute>
                  <Auth />
                </PublicOnlyRoute>
              } />

              {/* Citizen Routes */}
              <Route path="/citizen/dashboard" element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } />
              <Route path="/citizen/complaints/:id" element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <ComplaintDetail />
                </ProtectedRoute>
              } />

              {/* Officer / Admin Shared Detail */}
              <Route path="/officer/dashboard" element={
                <ProtectedRoute allowedRoles={['officer', 'admin']}>
                  <OfficerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/officer/tickets/:id" element={
                <ProtectedRoute allowedRoles={['officer', 'admin']}>
                  <TicketDetail />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/heatmap" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminHeatmap />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/officers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOfficers />
                </ProtectedRoute>
              } />
              <Route path="/admin/whistleblower" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminWhistleblower />
                </ProtectedRoute>
              } />
              <Route path="/admin/civic-memory" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCivicMemory />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAuditLog />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}
