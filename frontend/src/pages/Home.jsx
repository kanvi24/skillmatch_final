import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Building2, Flame, Zap } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden bg-transparent flex-grow flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      
      {/* Hero Body */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        {/* Left Side: Call to Action */}
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl flex-shrink-0 text-center lg:text-left">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-zinc-900 px-3.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-800 backdrop-blur-md mb-8">
            <Zap className="w-3 h-3 text-white fill-white" />
            <span>SkillMatch AI Platform v1.0</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-none font-heading">
            Deploy your career. <br />
            <span className="text-zinc-500">Automate applications.</span>
          </h1>
          
          <p className="mt-6 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md mx-auto lg:mx-0">
            Build ATS-optimized resumes, scrape career pages, store credentials in vector indexes, and prepare targeted interview sheets.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="vercel-btn-primary px-6 py-3 text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="vercel-btn-primary px-6 py-3 text-sm"
                >
                  Start Building Free
                </Link>
                <Link
                  to="/login"
                  className="vercel-btn-secondary px-6 py-3 text-sm"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Features */}
        <div className="w-full max-w-xl lg:max-w-none flex-grow">
          <div className="grid grid-cols-1 gap-4">
            
            {/* Feature 1 */}
            <div className="vercel-card p-6 flex gap-5 group">
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors h-fit">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ATS-Optimized Resume Builder</h3>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  Automatically adjust bullet points and write achievements matching target descriptions.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="vercel-card p-6 flex gap-5 group">
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors h-fit">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Company Intel Scrapers</h3>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  Automatic crawlers visiting careers pages to find open positions.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="vercel-card p-6 flex gap-5 group">
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors h-fit">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Semantic Search Index</h3>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  Calculate resume job matching quotients using PyMongo vectors.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
