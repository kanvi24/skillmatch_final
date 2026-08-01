import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Building2,
  Plus,
  Loader2,
  ExternalLink,
  Briefcase,
  Users,
  ShieldCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="vercel-card border border-zinc-800 rounded-xl p-5 bg-zinc-950/40 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [companyName, setCompanyName] = useState('');
  const [careersUrl, setCareersUrl] = useState('');
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/companies/admin/stats`, authHeaders());
      return response.data;
    },
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/companies/list`, authHeaders());
      return response.data;
    },
  });

  const { data: jobsData = [] } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/companies/jobs?all=true`, authHeaders());
      return response.data;
    },
  });

  const jobs = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);

  const scrapeMutation = useMutation({
    mutationFn: async ({ company_name, careers_url }) => {
      const response = await axios.post(
        `${backendUrl}/companies/scrape`,
        { company_name, careers_url },
        authHeaders()
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Crawled successfully! Extracted ${data.length} job postings.`);
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setCompanyName('');
      setCareersUrl('');
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Scraping career page failed.';
      toast.error(msg);
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId) => {
      const response = await axios.delete(`${backendUrl}/companies/admin/companies/${companyId}`, authHeaders());
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.detail || 'Company deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Could not delete company.'),
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await axios.delete(`${backendUrl}/companies/admin/jobs/${jobId}`, authHeaders());
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.detail || 'Job deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Could not delete job.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyName.trim() || !careersUrl.trim()) return;
    scrapeMutation.mutate({
      company_name: companyName.trim(),
      careers_url: careersUrl.trim(),
    });
  };

  const jobsByCompany = (companyId) => jobs.filter((j) => j.company_id === companyId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Companies &amp; Job Data</h1>
        <p className="text-zinc-500 mt-1.5 text-xs max-w-2xl leading-relaxed">
          Import company career pages via the Playwright + Gemini crawler, and manage everything that's live for users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Building2} label="Companies" value={stats?.total_companies ?? '—'} />
        <StatCard icon={Briefcase} label="Job Postings" value={stats?.total_jobs ?? '—'} />
        <StatCard icon={Users} label="Total Users" value={stats?.total_users ?? '—'} />
        <StatCard icon={ShieldCheck} label="Admins" value={stats?.total_admins ?? '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scrape form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="vercel-card p-6 border border-zinc-800 rounded-xl bg-zinc-950/40">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Import a Company
            </h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Paste a careers page URL — the crawler extracts and structures every open role.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white placeholder-zinc-700 text-xs focus:outline-none"
                  placeholder="e.g. Stripe"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Careers Page URL</label>
                <input
                  type="url"
                  required
                  value={careersUrl}
                  onChange={(e) => setCareersUrl(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white placeholder-zinc-700 text-xs focus:outline-none"
                  placeholder="e.g. https://stripe.com/jobs"
                />
              </div>

              <button
                type="submit"
                disabled={scrapeMutation.isPending}
                className="vercel-btn-primary w-full px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {scrapeMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Crawling &amp; Parsing...
                  </>
                ) : (
                  'Import & Scrape'
                )}
              </button>
            </form>
          </div>

          {stats?.top_companies_by_jobs?.length > 0 && (
            <div className="vercel-card p-6 border border-zinc-800 rounded-xl bg-zinc-950/40">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Most Jobs Imported</h3>
              <div className="space-y-2.5">
                {stats.top_companies_by_jobs.map((c) => (
                  <div key={c.company_name} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">{c.company_name}</span>
                    <span className="text-zinc-500 font-semibold">{c.job_count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company list */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Imported Companies ({companies.length})
          </h3>

          {companiesLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950/20 border border-dashed border-zinc-850 rounded-xl">
              <p className="text-xs text-zinc-500">No companies imported yet. Use the form to add your first one.</p>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-900 overflow-hidden">
              {companies.map((c) => {
                const companyJobs = jobsByCompany(c.id);
                const isExpanded = expandedCompanyId === c.id;
                return (
                  <div key={c.id} className="bg-zinc-950/40">
                    <div className="flex items-center justify-between px-4 py-3">
                      <button
                        onClick={() => setExpandedCompanyId(isExpanded ? null : c.id)}
                        className="flex items-center gap-2 text-left flex-grow cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{c.name}</p>
                          <p className="text-[11px] text-zinc-500">
                            {companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''} &middot; {c.careers_url}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-3 shrink-0">
                        <a
                          href={c.careers_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${c.name}" and all its jobs? This can't be undone.`)) {
                              deleteCompanyMutation.mutate(c.id);
                            }
                          }}
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-zinc-900 divide-y divide-zinc-900/60">
                        {companyJobs.length === 0 ? (
                          <p className="text-[11px] text-zinc-600 px-4 py-3">No jobs stored for this company.</p>
                        ) : (
                          companyJobs.map((j) => (
                            <div key={j.id} className="flex items-center justify-between px-4 py-2.5 pl-9">
                              <div>
                                <p className="text-xs text-zinc-200 font-medium">{j.title}</p>
                                <p className="text-[10px] text-zinc-500">{j.location} &middot; {j.type}</p>
                              </div>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete job "${j.title}"?`)) {
                                    deleteJobMutation.mutate(j.id);
                                  }
                                }}
                                className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete job"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
