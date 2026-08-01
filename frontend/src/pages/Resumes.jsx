import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FileText, Plus, Trash2, Calendar, Loader2, ArrowRight, Briefcase, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

export default function Resumes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Job Matching states
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchResumeId, setMatchResumeId] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResults, setMatchResults] = useState(null);

  // Lock body scroll when job match modal is open
  useEffect(() => {
    if (showMatchModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMatchModal]);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleMatchJob = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim() || !matchResumeId) return;
    setMatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/resumes/${matchResumeId}/match`,
        { job_description: jobDescription.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatchResults(response.data);
      toast.success('Job description analyzed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to calculate match score.');
    } finally {
      setMatchLoading(false);
    }
  };

  // Fetch resumes
  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/resumes/`);
      return response.data;
    },
    retry: 1,
  });

  // Create resume mutation
  const createMutation = useMutation({
    mutationFn: async (title) => {
      const response = await axios.post(`${backendUrl}/resumes/`, { title });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Resume created.');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setShowModal(false);
      setNewTitle('');
      navigate(`/resumes/wizard/${data.id}`);
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to create resume.');
    }
  });

  // Delete resume mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${backendUrl}/resumes/${id}`);
    },
    onSuccess: () => {
      toast.success('Resume deleted.');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to delete resume.');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMutation.mutate(newTitle.trim());
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this resume?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="h-8 w-44 bg-zinc-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-80 bg-zinc-100 dark:bg-slate-900 rounded" />
          </div>
          <div className="h-10 w-36 bg-zinc-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Resumes Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vercel-card p-6 flex flex-col justify-between h-44 relative">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-slate-800" />
                  <div className="h-4 w-32 bg-zinc-300 dark:bg-slate-700 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-48 bg-zinc-100 dark:bg-slate-900 rounded" />
                  <div className="h-3 w-40 bg-zinc-100 dark:bg-slate-900 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-150 dark:border-slate-800 pt-3 mt-4">
                <div className="h-3 w-24 bg-zinc-100 dark:bg-slate-900 rounded" />
                <div className="h-3 w-12 bg-zinc-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-heading">
            My Resumes
          </h1>
          <p className="text-zinc-500 mt-1 text-xs">Create and tailor documents optimized to bypass automated screenings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="vercel-btn-primary px-4 py-2.5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-xl p-8 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-5 text-zinc-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No resumes created yet</h3>
          <p className="text-zinc-500 mt-1.5 text-xs max-w-md mx-auto leading-relaxed">
            Kickstart your application process. Build an AI-ready resume tailored to bypass ATS screenings in minutes.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 vercel-btn-primary px-4 py-2 text-xs"
          >
            Create Your First Resume
          </button>
        </div>
      ) : (
        /* Resume List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              onClick={() => navigate(`/resumes/wizard/${resume.id}`)}
              className="group cursor-pointer vercel-card p-6 flex flex-col justify-between h-44 relative"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:bg-white group-hover:text-black transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm leading-none">
                      {resume.title}
                    </h3>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMatchResumeId(resume.id);
                        setShowMatchModal(true);
                        setJobDescription('');
                        setMatchResults(null);
                      }}
                      className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Match with Job Description"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(resume.id, e)}
                      className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-1 pl-1">
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <strong>Education:</strong> {resume.education?.length || 0} entries
                  </p>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <strong>Experience:</strong> {resume.experience?.length || 0} entries
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-3 mt-3 flex items-center justify-between text-[10px] text-zinc-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Updated recently
                </span>
                <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform font-bold">
                  Open Editor <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1.5">Create New Resume</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">Name your document to identify it (e.g. "Stripe Backend Dev Resume").</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Resume Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white placeholder-zinc-700 text-xs"
                  placeholder="e.g. Senior Software Architect"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="vercel-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Create Resume'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl vercel-card p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden no-print">
            <button
              onClick={() => setShowMatchModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-gray-900 dark:hover:text-white p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {!matchResults ? (
              /* Input state */
              <form onSubmit={handleMatchJob} className="flex flex-col h-full overflow-hidden">
                <div className="shrink-0 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1.5">
                    <Briefcase className="w-5 h-5 text-zinc-550 dark:text-zinc-400" /> Match with Job Description
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-500 mb-6 leading-relaxed">
                    Paste the targeted job posting description text. The AI parser will scan required skills and measure alignment.
                  </p>
                </div>

                <div className="flex-grow overflow-y-auto pr-3 scrollbar-thin">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Job Description Text</label>
                    <textarea
                      rows={8}
                      required
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-blue-800 dark:focus:border-white rounded-lg text-gray-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 text-xs resize-none focus:outline-none"
                      placeholder="We are looking for a backend engineer experienced with Python, Django, PostgreSQL, and AWS..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-900 mt-6 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowMatchModal(false)}
                    className="vercel-btn-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={matchLoading || !jobDescription.trim()}
                    className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {matchLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Analyze Match Score
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Results state */
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full overflow-hidden">
                <div className="shrink-0 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-zinc-550 dark:text-zinc-300" /> Scan Analysis Report
                  </h3>
                  <p className="text-xs text-zinc-550 font-semibold uppercase tracking-widest">Alignment percentage against requirements</p>
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
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-505" /> Matched Skills ({matchResults.matched_skills.length})
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
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <AlertCircle className="w-4 h-4 text-red-505" /> Missing Skills ({matchResults.missing_skills.length})
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
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg">
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
                    Scan Another Job
                  </button>
                  <button
                    onClick={() => setShowMatchModal(false)}
                    className="vercel-btn-primary px-4 py-2 text-xs cursor-pointer"
                  >
                    Done
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
