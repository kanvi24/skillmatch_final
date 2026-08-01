import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-pulse">
    {/* Page Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 pb-6 border-b border-zinc-205 dark:border-zinc-900">
      <div className="space-y-2">
        <div className="h-7 w-60 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-3.5 w-96 max-w-full bg-zinc-200 dark:bg-zinc-800/60 rounded"></div>
      </div>
    </div>

    {/* Layout Content Skeleton */}
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Skeleton (hidden on mobile/tablet) */}
      <aside className="hidden lg:block w-[280px] shrink-0 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black p-4 rounded-xl space-y-6 h-fit">
        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800/60 rounded"></div>
            <div className="h-3.5 w-5/6 bg-zinc-200 dark:bg-zinc-800/60 rounded"></div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800/60 rounded"></div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 space-y-6">
        {/* Sort & Stats Bar Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="vercel-card p-6 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl min-h-[220px]"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
                <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mt-2"></div>
                <div className="h-3.5 w-1/2 bg-zinc-200 dark:bg-zinc-800/60 rounded mt-2"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-3.5 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 mt-4 flex items-center justify-between">
                <div className="h-3.5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
