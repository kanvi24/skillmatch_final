import React, { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  FileText,
  Briefcase,
  Award,
  MessageSquareText,
  Settings,
  Bell,
  BrainCircuit
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Background from '../components/Background';
import { toast } from 'react-toastify';

export default function BaseLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);

  // Lock body scroll when mobile sidebar is open or when cursor hovers on the sidebar
  React.useEffect(() => {
    const handleScrollLock = () => {
      const shouldLock = (sidebarOpen && window.innerWidth < 768) || isHoveringSidebar;
      if (shouldLock) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    handleScrollLock();

    window.addEventListener('resize', handleScrollLock);
    return () => {
      window.removeEventListener('resize', handleScrollLock);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isHoveringSidebar]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const navItems = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Resumes', path: '/resumes', icon: FileText },
        { name: 'Company Intel', path: '/companies', icon: Briefcase },
        { name: 'AI Match', path: '/analytics', icon: BrainCircuit },
        { name: 'Interview Prep', path: '/interview-prep', icon: Award },
        { name: 'Reviews', path: '/reviews', icon: MessageSquareText },
        { name: 'Profile', path: '/profile', icon: User },
      ]
    : [
        { name: 'Home', path: '/', icon: LayoutDashboard },
      ];

  return (
    <Background>
      <div className="flex-grow flex flex-col min-h-screen selection:bg-zinc-800 selection:text-white">
        
        {/* Overlay backdrop */}
        {isAuthenticated && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-all duration-300 ease-in-out"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Component */}
        {isAuthenticated && (
          <aside
            className={`fixed top-0 left-0 bottom-0 w-[260px] z-40 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-lg border-r border-blue-500/10 dark:border-blue-500/5 transform transition-all duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } flex flex-col no-print`}
            onMouseEnter={() => setIsHoveringSidebar(true)}
            onMouseLeave={() => setIsHoveringSidebar(false)}
          >
            {/* Sidebar Header: Logo / App Name */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-blue-500/10 dark:border-blue-500/5">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-heading">
                  SkillMatch
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-blue-500/20 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.path === 'logout') {
                  return (
                    <button
                      key={item.name}
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-all duration-300 ease-in-out cursor-pointer"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </button>
                  );
                }
                const isItemActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={(e) => {
                      if (item.path === '#') {
                        e.preventDefault();
                        toast.info(`${item.name} feature coming soon!`);
                      } else {
                        setSidebarOpen(false);
                      }
                    }}
                    className={({ isActive }) => {
                      const active = isActive || isItemActive;
                      return `flex items-center space-x-3 px-4 py-3 text-xs font-semibold ${
                        active
                          ? 'bg-blue-800 hover:bg-blue-900 !text-white hover:!text-white rounded-lg transition-colors duration-200'
                          : 'rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-500/10 dark:hover:bg-blue-500/5 transition-all duration-300 ease-in-out'
                      }`;
                    }}
                  >
                    {Icon && <Icon className="w-4.5 h-4.5" />}
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Sidebar Footer User Info */}
            <div className="p-4 border-t border-blue-500/10 dark:border-blue-500/5 bg-blue-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {getInitials(user?.name)}
                  </div>
                  <div className="truncate max-w-[120px]">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-650 transition-colors duration-300 ease-in-out cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Outer Wrapper Content (resizes side-by-side on desktop when sidebar is open) */}
        <div className={`flex-grow flex flex-col transition-all duration-300 ${
          isAuthenticated && sidebarOpen ? 'md:pl-[260px]' : 'md:pl-0'
        }`}>
          
          {/* Top Bar Header */}
          <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-gray-200 dark:border-zinc-900 no-print transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                
                {/* Logo & Menu Hamburger Button */}
                <div className="flex items-center space-x-4">
                  {isAuthenticated && (
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-955 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 focus:outline-none transition-all duration-300 ease-in-out cursor-pointer"
                    >
                      {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                  )}
                  
                  {(!isAuthenticated || !sidebarOpen) && (
                    <Link to="/" className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-heading transition-colors duration-300">
                        SkillMatch
                      </span>
                    </Link>
                  )}
                </div>

                {/* Right Area: Theme Toggle, User Avatar, Notification Bell */}
                <div className="flex items-center space-x-4">
                  {/* {isAuthenticated && (
                    <button className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors duration-200 focus:outline-none cursor-pointer">
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-950" />
                    </button>
                  )} */}

                  <ThemeToggle />

                  {isAuthenticated ? (
                    <div className="relative">
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-700 dark:text-white font-bold text-xs transition-colors hover:border-gray-400 dark:hover:border-zinc-600">
                          {getInitials(user?.name)}
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {userDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setUserDropdownOpen(false)}
                          />
                          <div className="absolute right-0 mt-3 w-52 rounded-lg bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 py-1.5 z-20 shadow-xl dark:shadow-2xl">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-900">
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Logged In User</p>
                              <p className="text-xs font-bold truncate text-gray-900 dark:text-white mt-0.5">{user?.name || user?.email}</p>
                            </div>
                            
                            <Link
                              to="/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
                            >
                              <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                              <span>Credentials</span>
                            </Link>
                            
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center space-x-2 px-4 py-2 text-xs text-red-500 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-red-650 dark:hover:text-red-300 text-left border-t border-gray-100 dark:border-zinc-900 mt-1 cursor-pointer transition-colors duration-300"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link
                        to="/login"
                        className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="vercel-btn-primary px-4 py-2 text-xs transition-colors duration-300"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow flex flex-col relative">
            <Outlet />
          </main>

          {/* Footer */}
          {location.pathname === '/' && (
            <footer className="bg-white/80 dark:bg-zinc-950/80 border-t border-gray-200 dark:border-zinc-900 py-8 no-print mt-auto transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-gray-900 dark:text-white font-heading transition-colors duration-300">
                    SkillMatch
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 transition-colors duration-300">© 2026. Geist Minimalist System.</span>
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                    Terms of Service
                  </a>
                  <a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                    Support API
                  </a>
                </div>
              </div>
            </footer>
          )}
        </div>
      </div>
    </Background>
  );
}

