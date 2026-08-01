import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Award,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Building2,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function InterviewPrep() {
  const queryClient = useQueryClient();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // State
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Detailed view modal state
  const [activePrepSheet, setActivePrepSheet] = useState(null);
  
  // Accordion active indexes for technical and behavioral questions in modal
  const [expandedTechIdx, setExpandedTechIdx] = useState(null);
  const [expandedBehIdx, setExpandedBehIdx] = useState(null);

  // 1. Fetch Resumes for Selection
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

  // Automatically select first resume if none selected
  React.useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Body scroll lock when modal is open
  React.useEffect(() => {
    if (activePrepSheet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePrepSheet]);

  // 2. Fetch Saved Prep Sheets List
  const { data: preps = [], isLoading: prepsLoading } = useQuery({
    queryKey: ['interview-preps'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/resumes/interview-prep`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  // 3. Create Prep Sheet Mutation
  const createMutation = useMutation({
    mutationFn: async ({ resumeId, target_role, company_name }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/resumes/${resumeId}/interview-prep`,
        { target_role, company_name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Interview Prep Sheet generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['interview-preps'] });
      setTargetRole('');
      setCompanyName('');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to generate interview prep sheet. Fell back to offline templates.');
      queryClient.invalidateQueries({ queryKey: ['interview-preps'] });
    }
  });

  // 4. Delete Prep Sheet Mutation
  const deleteMutation = useMutation({
    mutationFn: async (prepId) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/resumes/interview-prep/${prepId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Prep sheet deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['interview-preps'] });
      if (activePrepSheet && activePrepSheet.id) {
        setActivePrepSheet(null);
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error('Could not delete prep sheet');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedResumeId || !targetRole.trim()) return;
    createMutation.mutate({
      resumeId: selectedResumeId,
      target_role: targetRole.trim(),
      company_name: companyName.trim()
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-6 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interview Preparation
          </h1>
          <p className="text-zinc-500 mt-1.5 text-xs max-w-2xl leading-relaxed">
            Generate custom behavioral and technical interview questions based on your resume, matched skills, and targets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Generator Form */}
        <div className="vercel-card p-6 border border-zinc-800 bg-zinc-950/40 rounded-xl h-fit">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-zinc-400" /> Generate Prep Guide
          </h3>

          {resumes.length === 0 ? (
            <div className="text-center py-4 bg-zinc-950 border border-zinc-900 rounded-lg p-4">
              <p className="text-xs text-zinc-500">You need to create a resume first before you can prepare for interviews.</p>
              <Link to="/resumes" className="mt-3 inline-flex px-3 py-1.5 bg-white text-black text-xs font-bold rounded">
                Create Resume
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Target Resume</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-zinc-500 rounded-lg text-white text-xs text-left focus:outline-none cursor-pointer hover:border-zinc-700 transition-colors"
                  >
                    <span className="truncate">
                      {resumes.find((r) => r.id === selectedResumeId)?.title || "Select a resume"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 mt-1.5 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-20 py-1.5 max-h-48 overflow-y-auto">
                        {resumes.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedResumeId(r.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs transition-colors block ${
                              r.id === selectedResumeId
                                ? 'bg-zinc-900 text-white font-bold'
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                            }`}
                          >
                            {r.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Target Role *</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white placeholder-zinc-700 text-xs focus:outline-none"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Target Company (Optional)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white placeholder-zinc-700 text-xs focus:outline-none"
                  placeholder="e.g. Stripe"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-900">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="vercel-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Guide...
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" /> Generate Guide
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: List of saved guides */}
        <div className="lg:col-span-2 space-y-6">
          <div className="vercel-card p-6 sm:p-8 border border-zinc-800 bg-zinc-950/40 rounded-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b border-zinc-900">
              Your Preparation Guides
            </h3>

            {prepsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Loading interview guides...</p>
              </div>
            ) : preps.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950/10 border border-dashed border-zinc-850 rounded-xl p-8 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-5 text-zinc-500">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white">No prep guides yet</h4>
                <p className="text-zinc-500 mt-1.5 text-xs leading-relaxed">
                  Fill in the details on the left side panel to generate a customized tech & behavioral interview package.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preps.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 bg-black border border-zinc-800 hover:border-zinc-700 rounded-lg flex flex-col justify-between h-48 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <span className="text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider truncate max-w-[120px]">
                          {p.company_name}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-medium">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{p.target_role}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Resume: {p.resume_title}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-3 line-clamp-2">
                        Contains {p.technical_questions?.length || 0} tech challenges and {p.behavioral_questions?.length || 0} behavioral questions.
                      </p>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 mt-4 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setActivePrepSheet(p);
                          setExpandedTechIdx(null);
                          setExpandedBehIdx(null);
                        }}
                        className="text-[10px] font-bold text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 px-2.5 py-1 rounded cursor-pointer transition-colors"
                      >
                        View Prep Sheet
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this prep guide?')) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                        className="text-zinc-650 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title="Delete Guide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Prep Sheet View Drawer Modal */}
      {activePrepSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl vercel-card p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 shrink-0">
              <div>
                <span className="text-[9px] font-bold text-zinc-550 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded uppercase tracking-widest">
                  {activePrepSheet.company_name}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  Interview Guide: {activePrepSheet.target_role}
                </h3>
              </div>
              <button
                onClick={() => setActivePrepSheet(null)}
                className="text-zinc-500 hover:text-gray-900 dark:hover:text-white p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-grow overflow-y-auto pr-3 mb-2 scrollbar-thin">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Pro Tips & Interview Loop Process */}
                <div className="space-y-4">
                  {/* Interview Process Breakdown */}
                  {activePrepSheet.company_process && activePrepSheet.company_process.length > 0 && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-4">
                        <Building2 className="w-4.5 h-4.5 text-cyan-500" /> Company Interview Loop
                      </h4>
                      <div className="space-y-3.5">
                        {activePrepSheet.company_process.map((step, idx) => (
                          <div key={idx} className="border-l border-zinc-200 dark:border-zinc-800 pl-3.5 py-0.5 relative">
                            <div className="absolute -left-[5px] top-[5px] w-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                              <span className="w-1 h-1 rounded-full bg-cyan-555" />
                            </div>
                            <h5 className="text-[10px] font-bold text-gray-950 dark:text-white uppercase tracking-wide">{step.round_name}</h5>
                            <p className="text-[10px] text-zinc-550 dark:text-zinc-500 leading-relaxed mt-1">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Info className="w-4 h-4 text-cyan-500" /> Interview Strategy & Tips
                    </h4>
                    <ul className="space-y-2.5">
                      {activePrepSheet.role_tips?.map((tip, idx) => (
                        <li key={idx} className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed list-disc list-inside">
                          {tip}
                        </li>
                      ))}
                      {(!activePrepSheet.role_tips || activePrepSheet.role_tips.length === 0) && (
                        <p className="text-xs text-zinc-550">No tips generated for this role.</p>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Middle & Right Columns: Technical & Behavioral Questions */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Tech Section */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3.5 pb-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-zinc-500" /> Technical & Coding Challenges
                    </h4>
                    <div className="space-y-2">
                      {activePrepSheet.technical_questions?.map((q, idx) => {
                        const isExpanded = expandedTechIdx === idx;
                        return (
                          <div key={idx} className="border border-zinc-200 dark:border-zinc-900 rounded-lg overflow-hidden bg-slate-50 dark:bg-black">
                            <button
                              onClick={() => setExpandedTechIdx(isExpanded ? null : idx)}
                              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-gray-900 dark:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-900/40 cursor-pointer"
                            >
                              <span>Q{idx+1}: {q.question}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            </button>
                            {isExpanded && (
                              <div className="p-3.5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900">
                                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">Detailed Answer / Solution</p>
                                <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed font-sans whitespace-pre-line">
                                  {q.solution}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Behavioral STAR Section */}
                  <div className="pt-4">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3.5 pb-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center gap-2">
                      <Award className="w-4.5 h-4.5 text-zinc-500" /> STAR Behavioral Questions
                    </h4>
                    <div className="space-y-2">
                      {activePrepSheet.behavioral_questions?.map((q, idx) => {
                        const isExpanded = expandedBehIdx === idx;
                        return (
                          <div key={idx} className="border border-zinc-200 dark:border-zinc-900 rounded-lg overflow-hidden bg-slate-50 dark:bg-black">
                            <button
                              onClick={() => setExpandedBehIdx(isExpanded ? null : idx)}
                              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-gray-900 dark:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-900/40 cursor-pointer"
                            >
                              <span>Q{idx+1}: {q.question}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            </button>
                            {isExpanded && (
                              <div className="p-3.5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900">
                                <p className="text-[10px] font-bold text-zinc-550 dark:text-zinc-650 uppercase tracking-widest mb-2 font-mono">STAR Formulation Guidance</p>
                                <p className="text-xs text-zinc-700 dark:text-zinc-450 leading-relaxed font-sans whitespace-pre-line">
                                  {q.guidance}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-900 mt-2 shrink-0">
              <button
                onClick={() => setActivePrepSheet(null)}
                className="vercel-btn-primary px-5 py-2.5 text-xs cursor-pointer"
              >
                Close Prep Sheet
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
