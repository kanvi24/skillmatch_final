import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FormSkeleton = () => (
  <div className="max-w-md mx-auto my-16 p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl space-y-6 animate-pulse w-full">
    <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto"></div>
    <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800/60 rounded mx-auto mt-2"></div>
    
    <div className="space-y-4 pt-4">
      <div className="space-y-1.5">
        <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
    
    <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded mt-6"></div>
  </div>
);

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FormSkeleton />;
  }

  return isAuthenticated ? <Navigate to="/profile" replace /> : <Outlet />;
}
