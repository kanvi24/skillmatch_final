import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  FileText,
  Briefcase,
  Award,
  ArrowUpRight,
  Sparkles,
  Loader2,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─── Custom tooltip for skill bar chart ───────────────────────────────────────
const SkillTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white shadow-xl">
        <p className="font-bold">{payload[0].payload.skill}</p>
        <p className="text-zinc-550 dark:text-zinc-400">{payload[0].value} resume{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

// ─── Custom tooltip for match distribution ────────────────────────────────────
const MatchTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white shadow-xl">
        <p className="font-bold">{payload[0].payload.range}</p>
        <p className="text-zinc-550 dark:text-zinc-400">{payload[0].value} job{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

const BAR_COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#a5b4fc', '#818cf8', '#6366f1'];
const MATCH_COLORS = { '0–25%': '#93c5fd', '26–50%': '#60a5fa', '51–75%': '#3b82f6', '76–100%': '#1d4ed8' };

export default function Dashboard() {
  const { user } = useAuth();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Single analytics endpoint — returns everything
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/resumes/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  // Recommendations for first resume
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/resumes/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const activeResume = resumes[0];

  const { data: recommendations = [], isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations', activeResume?.id],
    queryFn: async () => {
      if (!activeResume?.id) return [];
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/resumes/${activeResume.id}/recommend`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!activeResume?.id
  });

  const counts = analytics?.counts || { resumes: 0, jobs: 0, preps: 0 };
  const skillChart = analytics?.skill_chart || [];
  const matchDistribution = analytics?.match_distribution || [];
  const activityFeed = analytics?.activity || [];

  // Avg match score
  const avgMatch = recommendations.length > 0
    ? Math.round(recommendations.reduce((sum, r) => sum + r.match_percentage, 0) / recommendations.length)
    : 0;

  if (analyticsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-zinc-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-72 bg-zinc-100 dark:bg-slate-900 rounded" />
          </div>
          <div className="h-9 w-32 bg-zinc-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vercel-card p-6 rounded-2xl shadow-md h-[130px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-grow">
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-slate-800 rounded" />
                  <div className="h-8 w-12 bg-zinc-300 dark:bg-slate-700 rounded" />
                </div>
                <div className="w-10 h-10 bg-zinc-100 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="h-3 w-16 bg-zinc-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Chart Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="vercel-card lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-zinc-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-56 bg-zinc-100 dark:bg-slate-900 rounded" />
            </div>
            <div className="h-[180px] bg-zinc-50 dark:bg-slate-950/30 rounded-xl" />
          </div>
          <div className="vercel-card space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-zinc-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-56 bg-zinc-100 dark:bg-slate-900 rounded" />
            </div>
            <div className="h-[130px] bg-zinc-50 dark:bg-slate-950/30 rounded-xl" />
          </div>
        </div>

        {/* Bottom Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="vercel-card lg:col-span-2 space-y-4">
            <div className="h-4 w-60 bg-zinc-200 dark:bg-slate-800 rounded" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 bg-zinc-50 dark:bg-slate-950/20 border border-zinc-100 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-24 bg-zinc-100 dark:bg-slate-900 rounded" />
                  </div>
                  <div className="h-5 w-48 bg-zinc-300 dark:bg-slate-700 rounded" />
                  <div className="flex gap-1">
                    <div className="h-4 w-12 bg-zinc-250 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-12 bg-zinc-250 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-12 bg-zinc-250 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="vercel-card space-y-4">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-slate-800 rounded" />
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-2 h-2 bg-zinc-300 dark:bg-slate-700 rounded-full mt-1.5 shrink-0" />
                  <div className="space-y-1.5 flex-grow">
                    <div className="h-3 w-full bg-zinc-200 dark:bg-slate-800 rounded" />
                    <div className="h-2 w-16 bg-zinc-100 dark:bg-slate-900 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { name: 'Resumes Built', value: counts.resumes.toString(), icon: FileText, path: '/resumes', locked: false },
    { name: 'Jobs Scraped', value: counts.jobs.toString(), icon: Briefcase, path: '/companies', locked: false },
    { name: 'Prep Guides', value: counts.preps.toString(), icon: Award, path: '/interview-prep', locked: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dashboard Analytics
          </h1>
          <p className="text-zinc-500 mt-1 text-xs">
            Welcome back, <span className="text-gray-900 dark:text-white font-semibold">{user?.name || user?.email}</span>. Here is your career platform at a glance.
          </p>
        </div>
        {/* <Link to="/profile" className="vercel-btn-primary px-4 py-2 text-xs self-start md:self-auto">
          View Credentials
        </Link> */}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.path}
              className="vercel-card group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.name}</p>
                  <p className="mt-2 text-4xl font-black text-gray-900 dark:text-white leading-none tabular-nums">{stat.value}</p>
                </div>
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 group-hover:text-blue-800 dark:group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-blue-800 dark:group-hover:text-white flex items-center gap-1 transition-colors">
                  Manage <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Skills Bar Chart */}
        <div className="vercel-card lg:col-span-2 bg-[#edf4fc] dark:bg-[#0b162c] border border-blue-150 dark:border-blue-950/40">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Your Top Resume Skills</h2>
              <p className="text-[10px] text-zinc-500 mt-0.5">Skills appearing across all your resumes</p>
            </div>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </div>
          {skillChart.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-xs text-zinc-600">No resume skills to display yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={skillChart} barSize={18} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="skill"
                  tick={{ fill: '#71717a', fontSize: 9, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#52525b', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<SkillTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {skillChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Match Score Distribution */}
        <div className="vercel-card bg-[#edf4fc] dark:bg-[#0b162c] border border-blue-150 dark:border-blue-950/40">
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Match Score Distribution</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">Jobs bucketed by skill overlap %</p>
          </div>
          {matchDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-xs text-zinc-600">Scrape jobs to see distribution.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={matchDistribution} barSize={28} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                  <XAxis
                    dataKey="range"
                    tick={{ fill: '#71717a', fontSize: 8, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<MatchTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="jobs" radius={[4, 4, 0, 0]}>
                    {matchDistribution.map((entry) => (
                      <Cell key={entry.range} fill={MATCH_COLORS[entry.range] || '#52525b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Avg score badge */}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Avg Match Score</span>
                <span className={`text-sm font-extrabold ${avgMatch >= 70 ? 'text-emerald-400' : avgMatch >= 40 ? 'text-yellow-400' : 'text-zinc-400'}`}>
                  {avgMatch}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Recommendations */}
        <div className="vercel-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-450" /> AI Career Match Recommendations
            </h2>
            {activeResume && (
              <span className="text-[10px] text-zinc-500 font-medium hidden sm:block">
                Resume: <span className="text-gray-900 dark:text-white">{activeResume.title}</span>
              </span>
            )}
          </div>

          {resumes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-500">Create a resume to activate match recommendations.</p>
              <Link to="/resumes" className="mt-3 inline-flex text-xs font-bold text-white Verlink text-blue-800 dark:text-blue-400">Build Resume</Link>
            </div>
          ) : recsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
              <span className="text-xs text-zinc-400 ml-2">Calculating...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8">Scrape companies first to populate recommendations.</p>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-4 bg-zinc-50 dark:bg-slate-950/20 border border-zinc-200 dark:border-slate-800 hover:border-zinc-350 dark:hover:border-zinc-700 rounded-lg transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {rec.company_name}
                        </span>
                        <span className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />{rec.location}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">{rec.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {rec.matched_skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-500 text-[8px] font-semibold">{s}</span>
                        ))}
                        {rec.missing_skills.length > 0 && (
                          <span className="text-[8px] text-zinc-550">+{rec.missing_skills.length} missing</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center shrink-0">
                      <span className={`text-sm font-extrabold ${rec.match_percentage >= 70 ? 'text-emerald-400' : rec.match_percentage >= 40 ? 'text-yellow-500' : 'text-zinc-500'}`}>
                        {rec.match_percentage}%
                      </span>
                      <span className="text-[8px] text-zinc-650 uppercase tracking-widest font-bold">match</span>
                      <a href={rec.url} target="_blank" rel="noreferrer"
                        className="mt-2 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-gray-900 dark:text-white text-[9px] rounded font-bold cursor-pointer transition-colors">
                        Apply
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="vercel-card">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-500" /> Recent Activity
          </h2>
          {activityFeed.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${item.type === 'prep' ? 'bg-cyan-500' : 'bg-gray-400 dark:bg-zinc-500'}`} />
                  <div>
                    <p className="text-[10px] font-medium text-gray-700 dark:text-zinc-300 leading-tight">{item.label}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">
                      {item.time ? new Date(item.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
