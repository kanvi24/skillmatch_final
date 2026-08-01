import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, ShieldCheck, Users, MessageSquare } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Background from '../components/Background';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 font-medium transition-colors duration-300 ${
      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
    }`;

  return (
    <Background>
      <div className="flex-grow flex flex-col">
        <header className="border-b border-gray-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">SkillMatch</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-650 dark:text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            </div>

            <nav className="flex items-center gap-6 text-sm">
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                <Building2 className="w-4 h-4" /> Companies &amp; Jobs
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="w-4 h-4" /> Users
              </NavLink>
              <NavLink to="/admin/reviews" className={navLinkClass}>
                <MessageSquare className="w-4 h-4" /> Reviews
              </NavLink>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    </Background>
  );
}

