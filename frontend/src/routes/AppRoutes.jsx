import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BaseLayout from '../layouts/BaseLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminProtectedRoute from './AdminProtectedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Dashboard from '../pages/Dashboard';
import Resumes from '../pages/Resumes';
import ResumeWizard from '../pages/ResumeWizard';
import Companies from '../pages/Companies';
import InterviewPrep from '../pages/InterviewPrep';
import Analytics from '../pages/Analytics';
import Reviews from '../pages/Reviews';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminReviews from '../pages/admin/AdminReviews';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Specific Public Routes (Redirect to profile if logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/resumes/wizard/:id" element={<ResumeWizard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reviews" element={<Reviews />} />
        </Route>

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="flex-grow flex flex-col items-center justify-center bg-black text-zinc-400 py-16 text-center">
              <h1 className="text-6xl font-extrabold text-white tracking-tighter">404</h1>
              <p className="mt-4 text-sm text-zinc-500">Page not found</p>
              <a
                href="/"
                className="mt-6 inline-flex items-center justify-center px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Return home
              </a>
            </div>
          }
        />
      </Route>

      {/* Admin Section — separate login + layout, outside the main site chrome */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
        </Route>
      </Route>
    </Routes>
  );
}
