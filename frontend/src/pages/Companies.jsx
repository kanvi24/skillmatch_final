import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Building2,
  Search,
  MapPin,
  Sparkles,
  Loader2,
  Briefcase,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  DollarSign,
  IndianRupee,
  Clock,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

import FilterSidebar from '../components/filters/FilterSidebar';
import FilterChips from '../components/filters/FilterChips';
import Pagination from '../components/filters/Pagination';

const DEFAULT_FILTERS = {
  search: '',
  companies: [],
  departments: [],
  categories: [],
  employment_types: [],
  role_types: [],
  experience_levels: [],
  skills: [],
  country: '',
  state: '',
  city: '',
  salary_min: null,
  salary_max: null,
  posted_within: '',
  sort_by: 'created_at',
  sort_order: -1,
  page: 1,
  limit: 12,
};

const JobCardSkeleton = () => (
  <div className="vercel-card p-6 flex flex-col justify-between border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl transition-all animate-pulse">
    <div>
      {/* Company & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>

      {/* Title */}
      <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mt-3"></div>

      {/* Location & Time */}
      <div className="flex items-center gap-3 mt-3">
        <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>

      {/* Salary Range */}
      <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mt-3"></div>

      {/* Job Description Snippet */}
      <div className="space-y-2 mt-4">
        <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-3.5 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>

      {/* Skills Tags List */}
      <div className="flex flex-wrap gap-1.5 mt-5">
        <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="h-5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
      </div>
    </div>

    {/* Bottom Actions */}
    <div className="border-t border-zinc-900 pt-3 mt-6 flex items-center justify-between">
      <div className="h-3 w-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
    </div>
  </div>
);

export default function Companies() {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Filters State
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchVal, setSearchVal] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Matching State
  const [matchingJob, setMatchingJob] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [matchResults, setMatchResults] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchVal,
        page: 1, // reset page when search changes
      }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Lock body scroll when resume match modal is open
  useEffect(() => {
    if (matchingJob) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [matchingJob]);

  // Fetch Resumes for Match Dropdown
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/resumes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // Fetch Available Filter Options
  const { data: filterOptions = {}, isLoading: optionsLoading } = useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/companies/filters/options`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // Set default salary min/max filters once options are loaded
  useEffect(() => {
    if (filterOptions.salary_range) {
      setFilters((prev) => ({
        ...prev,
        salary_min: prev.salary_min !== null ? prev.salary_min : filterOptions.salary_range.min,
        salary_max: prev.salary_max !== null ? prev.salary_max : filterOptions.salary_range.max,
      }));
    }
  }, [filterOptions]);

  // Fetch Jobs List based on all filters
  const { data: jobsData = { jobs: [], pagination: { total: 0, total_pages: 1 } }, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = {};

      // Only attach non-empty filters
      if (filters.search) params.search = filters.search;
      if (filters.companies.length > 0) params.company_name = filters.companies.join(',');
      if (filters.departments.length > 0) params.department = filters.departments.join(',');
      if (filters.categories.length > 0) params.category = filters.categories.join(',');
      if (filters.employment_types.length > 0) params.employment_type = filters.employment_types.join(',');
      if (filters.role_types.length > 0) params.role_type = filters.role_types.join(',');
      if (filters.experience_levels.length > 0) params.experience_level = filters.experience_levels.join(',');
      if (filters.skills.length > 0) params.skills = filters.skills.join(',');
      
      if (filters.country) params.country = filters.country;
      if (filters.state) params.state = filters.state;
      if (filters.city) params.city = filters.city;

      if (filters.salary_min !== null) params.salary_min = filters.salary_min;
      if (filters.salary_max !== null) params.salary_max = filters.salary_max;
      if (filters.posted_within) params.posted_within = filters.posted_within;

      params.sort_by = filters.sort_by;
      params.sort_order = filters.sort_order;
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await axios.get(`${backendUrl}/companies/jobs`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // Handle comparing job description with selected resume
  const handleRunMatch = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !matchingJob) return;
    setMatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/resumes/${selectedResumeId}/match`,
        {
          job_description: matchingJob.description,
          skills: matchingJob.skills,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatchResults(response.data);
      toast.success('Resume match analysis complete!');
    } catch (err) {
      console.error(err);
      toast.error('Could not compute match score.');
    } finally {
      setMatchLoading(false);
    }
  };

  // Remove a single active filter chip
  const handleRemoveChip = (chip) => {
    if (chip.id === 'search') {
      setSearchVal('');
    } else if (chip.field) {
      const field = chip.field;
      if (Array.isArray(filters[field])) {
        setFilters((prev) => ({
          ...prev,
          [field]: prev[field].filter((val) => val !== chip.value),
          page: 1,
        }));
      } else {
        // Scalar fields
        let defaultValue = '';
        if (field === 'salary_min') defaultValue = filterOptions.salary_range?.min || null;
        if (field === 'salary_max') defaultValue = filterOptions.salary_range?.max || null;
        setFilters((prev) => ({
          ...prev,
          [field]: defaultValue,
          page: 1,
        }));
      }
    }
  };

  const handleClearAll = () => {
    setSearchVal('');
    setFilters({
      ...DEFAULT_FILTERS,
      salary_min: filterOptions.salary_range?.min || null,
      salary_max: filterOptions.salary_range?.max || null,
    });
  };

  const formatSalary = (min, max, currency) => {
    if (min === null || max === null) return 'Not disclosed';
    const symbol = '₹';
    const minStr = min >= 1000 ? `${(min / 1000).toFixed(0)}k` : min;
    const maxStr = max >= 1000 ? `${(max / 1000).toFixed(0)}k` : max;
    return `${symbol}${minStr} — ${symbol}${maxStr}`;
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const now = new Date();
    const created = new Date(dateStr);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const jobs = jobsData.jobs || [];
  const pagination = jobsData.pagination || { total: 0, page: 1, limit: 12, total_pages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 pb-6 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Company Intelligence
          </h1>
          <p className="text-zinc-500 mt-1.5 text-xs max-w-2xl leading-relaxed">
            Import corporate career postings using Playwright crawlers, analyze skills using Gemini, and match them against your resumes.
          </p>
        </div>
      </div>

      {/* Prominent Search bar & Filter Toggle for Mobile */}
      <div className="flex gap-4 mb-6">
        <div className="flex-grow relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search jobs by title, description, company, or skills..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="block w-full !pl-10 pr-4 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-lg text-white placeholder-zinc-700 text-xs focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-white text-xs cursor-pointer transition-colors"
        >
          <Filter className="h-4 w-4 text-zinc-400" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <FilterChips
        filters={filters}
        onRemove={handleRemoveChip}
        onClearAll={handleClearAll}
        defaultFilters={{
          ...DEFAULT_FILTERS,
          salary_min: filterOptions.salary_range?.min || null,
          salary_max: filterOptions.salary_range?.max || null,
        }}
      />

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Filter Sidebar - Desktop (hidden on mobile/tablet) */}
        <aside className="hidden lg:block w-[280px] shrink-0 border border-zinc-900 bg-black p-4 rounded-xl h-fit sticky top-6">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
            defaultFilters={DEFAULT_FILTERS}
            onClearAll={handleClearAll}
            isLoading={optionsLoading}
          />
        </aside>

        {/* Mobile Filter Drawer / Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm lg:hidden">
            <div className="w-full max-w-sm bg-black h-full border-l border-zinc-850 p-6 flex flex-col justify-between">
              <div className="flex-grow overflow-y-auto">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h3>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  filterOptions={filterOptions}
                  defaultFilters={DEFAULT_FILTERS}
                  onClearAll={handleClearAll}
                  isLoading={optionsLoading}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full mt-4 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Close Filters
              </button>
            </div>
          </div>
        )}

        {/* Content Section (Jobs listing + Sort + Pagination) */}
        <section className="flex-1">
          {/* Sorting & Stats Row */}
          <div className="flex items-center justify-between mb-6 text-xs text-zinc-400">
            <div>
              {jobsLoading ? (
                <span>Finding job matches...</span>
              ) : (
                <span>
                  Found <strong className="text-white">{pagination.total}</strong> active openings
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3 w-3 text-zinc-500" />
              <span className="text-zinc-500">Sort by:</span>
              <select
                value={`${filters.sort_by}:${filters.sort_order}`}
                onChange={(e) => {
                  const [sort_by, orderStr] = e.target.value.split(':');
                  setFilters((prev) => ({
                    ...prev,
                    sort_by,
                    sort_order: parseInt(orderStr),
                    page: 1,
                  }));
                }}
                className="bg-black border border-zinc-800 rounded px-2.5 py-1 text-white text-[11px] outline-none cursor-pointer focus:border-zinc-700 transition-colors"
              >
                <option value="created_at:-1">Newest First</option>
                <option value="created_at:1">Oldest First</option>
                <option value="salary_max:-1">Salary: High to Low</option>
                <option value="salary_min:1">Salary: Low to High</option>
                <option value="title:1">Job Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Jobs Listing */}
          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-950/20 border border-dashed border-zinc-250 dark:border-zinc-850 rounded-xl p-8 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-lg bg-zinc-150 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-5 text-zinc-550 dark:text-zinc-500">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No job openings match your criteria</h3>
              <p className="text-zinc-600 dark:text-zinc-500 mt-1.5 text-xs max-w-sm mx-auto leading-relaxed">
                Try widening your search terms, removing active filters, or checking out other categories.
              </p>
            </div>
          ) : (
            <>
              {/* Jobs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="vercel-card p-6 flex flex-col justify-between border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-xl transition-all"
                  >
                    <div>
                      {/* Company & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider">
                          {job.company_name}
                        </span>
                        <div className="flex gap-1.5">
                          {job.department && job.department !== 'Other' && (
                            <span className="text-[9px] font-medium text-zinc-500 border border-zinc-850 px-1.5 py-0.5 rounded">
                              {job.department}
                            </span>
                          )}
                          <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded uppercase">
                            {job.role_type || 'On-site'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Location */}
                      <h3 className="font-bold text-white text-sm truncate leading-snug">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-650" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-650" /> {formatRelativeTime(job.created_at)}
                        </span>
                      </div>

                      {/* Salary Range */}
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-2 bg-zinc-900/40 border border-zinc-850/60 w-fit px-2 py-0.5 rounded">
                        <IndianRupee className="w-3.5 h-3.5 text-zinc-550" />
                        <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                      </div>

                      {/* Job Description Snippet */}
                      <p className="text-xs text-zinc-400 mt-3.5 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Skills Tags List */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {job.skills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-[9px] font-semibold text-zinc-300 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="text-[9px] font-medium text-zinc-550 px-1.5 py-0.5">
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="border-t border-zinc-900 pt-3 mt-5 flex items-center justify-between">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        Apply ↗
                      </a>
                      <button
                        onClick={() => {
                          setMatchingJob(job);
                          setSelectedResumeId(resumes[0]?.id || '');
                          setMatchResults(null);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 px-2.5 py-1.5 rounded cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-zinc-400" /> Match Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={filters.page}
                totalPages={pagination.total_pages}
                totalResults={pagination.total}
                limit={filters.limit}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </>
          )}
        </section>
      </div>

      {/* Resume Match Modal (Unchanged functionality) */}
      {matchingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl vercel-card p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <button
              onClick={() => setMatchingJob(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-gray-900 dark:hover:text-white p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {!matchResults ? (
              /* Selection Screen */
              <form onSubmit={handleRunMatch} className="flex flex-col h-full overflow-hidden">
                <div className="shrink-0 mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-zinc-500 dark:text-zinc-300" /> Match with Resume
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-500 leading-relaxed">
                    Select which document to test against the requirements for <strong className="text-gray-900 dark:text-white">{matchingJob.title}</strong> ({matchingJob.company_name}).
                  </p>
                </div>

                <div className="flex-grow overflow-y-auto pr-3 scrollbar-thin">
                  {resumes.length === 0 ? (
                    <p className="text-xs text-red-400">You must create a resume before running match tests.</p>
                  ) : (
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Select Resume Document</label>
                      <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="block w-full px-3.5 py-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-blue-800 dark:focus:border-white rounded-lg text-gray-900 dark:text-white text-xs focus:outline-none cursor-pointer"
                      >
                        {resumes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-900 mt-6 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMatchingJob(null)}
                    className="vercel-btn-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={matchLoading || !selectedResumeId}
                    className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {matchLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Briefcase className="w-3.5 h-3.5" /> Analyze Score
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Report Screen */
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full overflow-hidden">
                <div className="shrink-0 mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-zinc-550 dark:text-zinc-300" /> Match Report: {matchingJob.title}
                  </h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Casing & Synonyms normalized analysis</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto pr-3 mb-2 scrollbar-thin space-y-6">
                  {/* Score Indicator */}
                  <div className="flex flex-col items-center justify-center py-6 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center">
                    <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{matchResults.match_percentage}%</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-widest mt-1">Match Alignment</div>
                    
                    {/* Progress bar */}
                    <div className="w-full max-w-md bg-zinc-200 dark:bg-zinc-900 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-blue-800 dark:bg-white h-full transition-all duration-500"
                        style={{ width: `${matchResults.match_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Grid Lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matched Skills */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Skills ({matchResults.matched_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResults.matched_skills.map((s) => (
                          <span key={s} className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                        {matchResults.matched_skills.length === 0 && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase tracking-widest">No matching skills</p>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <AlertCircle className="w-4 h-4 text-red-500" /> Missing Skills ({matchResults.missing_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResults.missing_skills.map((s) => (
                          <span key={s} className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                        {matchResults.missing_skills.length === 0 && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-650 font-semibold uppercase tracking-widest">No missing skills detected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  {matchResults.recommended_skills?.length > 0 && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> Recommended to Learn / Add
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResults.recommended_skills.map((s) => (
                          <span key={s} className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-900 mt-2 shrink-0">
                  <button
                    onClick={() => setMatchResults(null)}
                    className="vercel-btn-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Scan Another Resume
                  </button>
                  <button
                    onClick={() => setMatchingJob(null)}
                    className="vercel-btn-primary px-4 py-2 text-xs cursor-pointer"
                  >
                    Close Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
