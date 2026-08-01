import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ChevronLeft, ChevronRight, Plus, Trash2, Edit2,
  User, GraduationCap, Briefcase, Code, Award, CheckCircle2,
  FileCheck, Shield, ExternalLink, Calendar, MapPin, Phone, Globe
} from 'lucide-react';

// Custom inline SVG icons for social media
const GithubIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Form Schemas
const personalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  github: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

const educationSchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree is required'),
  field_of_study: z.string().min(2, 'Field of study is required'),
  start_date: z.string().min(2, 'Start date is required (e.g. Sep 2020)'),
  end_date: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

const experienceSchema = z.object({
  company: z.string().min(2, 'Company is required'),
  position: z.string().min(2, 'Position is required'),
  start_date: z.string().min(2, 'Start date is required (e.g. Jan 2022)'),
  end_date: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  role: z.string().min(2, 'Your role is required'),
  description: z.string().optional().or(z.literal('')),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  skills: z.string().optional().or(z.literal('')),
});

const certificateSchema = z.object({
  name: z.string().min(2, 'Certificate name is required'),
  issuer: z.string().min(2, 'Issuer is required'),
  date: z.string().min(2, 'Date earned is required'),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(2, 'Description is required'),
});

const steps = [
  { num: 1, name: 'Personal Details', icon: User },
  { num: 2, name: 'Education', icon: GraduationCap },
  { num: 3, name: 'Experience', icon: Briefcase },
  { num: 4, name: 'Projects', icon: Code },
  { num: 5, name: 'Skills', icon: Award },
  { num: 6, name: 'Achievements', icon: Shield },
  { num: 7, name: 'Certificates', icon: FileCheck },
  { num: 8, name: 'Preview & Export', icon: CheckCircle2 }
];

const pdfLoadingStates = [
  { text: "Initializing PDF rendering engine..." },
  { text: "Fetching selected template layout styles..." },
  { text: "Parsing personal credentials & details..." },
  { text: "Formatting experiences & qualifications..." },
  { text: "Compiling vector PDF sheet via Playwright..." },
  { text: "Generating print-optimized style layers..." },
  { text: "Validating single-page height margins..." },
  { text: "Finalizing pixel-perfect print document..." }
];

const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CheckFilled = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const LoaderCore = ({ loadingStates, value = 0 }) => (
  <div className="flex flex-col justify-start max-w-md mx-auto relative h-36">
    {loadingStates.map((loadingState, index) => {
      const distance = Math.abs(index - value);
      const opacity = Math.max(1 - distance * 0.25, 0.15);
      const isCurrent = value === index;
      const isCompleted = index < value;

      return (
        <motion.div
          key={index}
          className="text-left flex items-center gap-3 mb-4 select-none h-5"
          initial={{ opacity: 0, y: -(value * 36) }}
          animate={{ opacity: opacity, y: -(value * 36) }}
          transition={{ duration: 0.4 }}
        >
          <div>
            {index > value ? (
              <CheckIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
            ) : (
              <CheckFilled className={`w-5 h-5 ${isCurrent ? 'text-blue-800 dark:text-lime-500' : 'text-zinc-650 dark:text-zinc-400'}`} />
            )}
          </div>
          <span className={`text-xs ${isCurrent ? 'text-blue-800 dark:text-lime-500 font-bold' : isCompleted ? 'text-zinc-700 dark:text-zinc-300 font-medium' : 'text-zinc-400 dark:text-zinc-600'}`}>
            {loadingState.text}
          </span>
        </motion.div>
      );
    })}
  </div>
);

const MultiStepLoader = ({ loadingStates, loading, duration = 1200 }) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        prevState === loadingStates.length - 1 ? prevState : prevState + 1
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loadingStates.length, duration]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md bg-white/70 dark:bg-zinc-950/80 rounded-lg p-6"
        >
          <div className="h-44 relative flex items-center justify-center overflow-hidden w-full max-w-sm">
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>
          <div className="mt-8 text-center shrink-0">
            <p className="text-[10px] text-zinc-550 dark:text-zinc-450 uppercase tracking-widest animate-pulse font-bold">
              Compiling PDF layout via Playwright...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ResumeWizard() {
  const { id: resumeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(1);
  const [subFormOpen, setSubFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState([]);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // 1. Fetch Resume Data
  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/resumes/${resumeId}`);
      return response.data;
    },
    enabled: !!resumeId,
  });

  // Sync state for skills when resume loaded
  useEffect(() => {
    if (resume?.skills) {
      setSkillsList(resume.skills);
    }
  }, [resume]);

  // 2. Personal Details Form Hook
  const {
    register: regPersonal,
    handleSubmit: handlePersonalSubmit,
    reset: resetPersonal,
    setValue: setPersonalValue,
    formState: { errors: personalErrors }
  } = useForm({
    resolver: zodResolver(personalSchema)
  });

  // Load personal details default values
  useEffect(() => {
    if (resume?.personal_details) {
      resetPersonal(resume.personal_details);
    }
  }, [resume, resetPersonal]);

  // 3. Sub-Forms Hook (Dynamic for nested sections)
  const getSubResolverSchema = () => {
    switch (activeStep) {
      case 2: return educationSchema;
      case 3: return experienceSchema;
      case 4: return projectSchema;
      case 6: return achievementSchema;
      case 7: return certificateSchema;
      default: return personalSchema;
    }
  };

  const {
    register: regSub,
    handleSubmit: handleSubSubmit,
    reset: resetSub,
    setValue: setSubValue,
    getValues: getSubValues,
    formState: { errors: subErrors }
  } = useForm({
    resolver: zodResolver(getSubResolverSchema()),
    mode: 'onSubmit'
  });

  // AI Integration States & Methods
  const [aiLoading, setAiLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const [targetRole, setTargetRole] = useState('');

  // Resume Templates & PDF Rendering States
  const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
  const [renderLoading, setRenderLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const fetchPdfPreview = async (templateId) => {
    setRenderLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/resumes/${resumeId}/render`,
        { template_id: templateId },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Failed to render PDF:", err);
      toast.error("Failed to compile PDF template preview.");
    } finally {
      setRenderLoading(false);
    }
  };

  useEffect(() => {
    if (activeStep === 8 && resumeId) {
      fetchPdfPreview(selectedTemplate);
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [activeStep, selectedTemplate, resumeId]);

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${resume?.personal_details?.name || 'resume'}_${selectedTemplate}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateBio = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/resumes/ai/summary`, {
        resume_id: resumeId,
        target_role: targetRole || resume?.title || '',
      });
      const summary = response.data.summary;
      setPersonalValue('bio', summary);
      if (response.data.warning) {
        toast.info("AI key fallback applied.");
      } else {
        toast.success('Bio generated by AI!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate bio.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImproveDescription = async () => {
    const currentText = getSubValues('description');
    if (!currentText || !currentText.trim()) {
      toast.info('Please enter some description text first.');
      return;
    }
    setImproveLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/resumes/ai/improve`, {
        text: currentText,
        context: resume?.title || '',
      });
      const improvedText = response.data.improved_text;
      setSubValue('description', improvedText);
      if (response.data.warning) {
        toast.info("AI key fallback applied.");
      } else {
        toast.success('Description improved with AI!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to improve description.');
    } finally {
      setImproveLoading(false);
    }
  };

  // Set subform fields when editing
  useEffect(() => {
    if (editingItem) {
      resetSub(editingItem);
    } else {
      resetSub({});
    }
  }, [editingItem, resetSub, activeStep]);

  // 4. CRUD Mutations

  // Mutation: Save Personal Details
  const savePersonalMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(`${backendUrl}/resumes/${resumeId}`, {
        title: resume.title,
        personal_details: data
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Personal details saved!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      setActiveStep(2);
    },
    onError: () => toast.error('Failed to save details')
  });

  // Mutation: Add Section Item
  const addItemMutation = useMutation({
    mutationFn: async ({ section, data }) => {
      const response = await axios.post(`${backendUrl}/resumes/${resumeId}/${section}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Entry added successfully!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      setSubFormOpen(false);
      resetSub({});
    },
    onError: () => toast.error('Failed to add entry')
  });

  // Mutation: Edit Section Item
  const editItemMutation = useMutation({
    mutationFn: async ({ section, itemId, data }) => {
      const response = await axios.put(`${backendUrl}/resumes/${resumeId}/${section}/${itemId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Entry updated!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      setSubFormOpen(false);
      setEditingItem(null);
      resetSub({});
    },
    onError: () => toast.error('Failed to update entry')
  });

  // Mutation: Delete Section Item
  const deleteItemMutation = useMutation({
    mutationFn: async ({ section, itemId }) => {
      await axios.delete(`${backendUrl}/resumes/${resumeId}/${section}/${itemId}`);
    },
    onSuccess: () => {
      toast.success('Entry removed');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    },
    onError: () => toast.error('Failed to remove entry')
  });

  // Mutation: Save Skills Array
  const saveSkillsMutation = useMutation({
    mutationFn: async (skills) => {
      const response = await axios.put(`${backendUrl}/resumes/${resumeId}/skills`, skills);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Skills updated!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      setActiveStep(6);
    },
    onError: () => toast.error('Failed to update skills')
  });

  // Actions

  // 1. Submit Personal Details Step
  const onPersonalSubmit = (data) => {
    savePersonalMutation.mutate(data);
  };

  // 2. Submit Sub-resource Item (Add or Edit)
  const onSubSubmit = (data) => {
    const sectionMap = { 2: 'education', 3: 'experience', 4: 'projects', 6: 'achievements', 7: 'certificates' };
    const section = sectionMap[activeStep];
    
    if (editingItem) {
      editItemMutation.mutate({ section, itemId: editingItem.id, data });
    } else {
      addItemMutation.mutate({ section, data });
    }
  };

  // 3. Delete Nested Item
  const handleItemDelete = (section, itemId) => {
    if (confirm('Delete this entry?')) {
      deleteItemMutation.mutate({ section, itemId });
    }
  };

  // 4. Skills updates
  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (!cleanSkill) return;
    if (skillsList.includes(cleanSkill)) {
      toast.info('Skill already added');
      return;
    }
    setSkillsList([...skillsList, cleanSkill]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleSaveSkills = () => {
    saveSkillsMutation.mutate(skillsList);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full flex flex-col animate-pulse">
        {/* Wizard Header Skeleton */}
        <div className="mb-8 border-b border-zinc-200 dark:border-slate-800 pb-6 flex items-center justify-between no-print">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-zinc-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-32 bg-zinc-100 dark:bg-slate-900 rounded" />
          </div>
          <div className="h-4 w-28 bg-zinc-200 dark:bg-slate-800 rounded" />
        </div>

        {/* Stepper Bar Skeleton */}
        <div className="hidden lg:flex items-center justify-between gap-2 mb-12 bg-white dark:bg-slate-900 p-2 border border-gray-200 dark:border-slate-700 rounded-xl">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-8 flex-grow bg-zinc-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
          {/* Form Side Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="vercel-card p-6 sm:p-8 space-y-6">
              <div className="h-5 w-40 bg-zinc-200 dark:bg-slate-800 rounded" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3.5 w-24 bg-zinc-200 dark:bg-slate-800 rounded" />
                    <div className="h-9 w-full bg-zinc-100 dark:bg-slate-900 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Side Skeleton */}
          <div className="lg:col-span-5">
            <div className="vercel-card p-6 sm:p-8 h-[600px] flex flex-col justify-between">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-150 dark:border-slate-800">
                <div className="h-4 w-28 bg-zinc-200 dark:bg-slate-800 rounded" />
                <div className="h-7 w-20 bg-zinc-100 dark:bg-slate-900 rounded" />
              </div>
              <div className="flex-grow bg-zinc-50 dark:bg-slate-950/20 rounded-xl my-4 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-t-zinc-400 border-zinc-200 dark:border-slate-800 animate-spin" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 flex-grow bg-zinc-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-10 flex-grow bg-zinc-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    toast.error('Could not load resume builder.');
    navigate('/resumes');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full flex flex-col">
      {/* Wizard Header */}
      <div className="mb-8 border-b border-zinc-200 dark:border-slate-900 pb-6 flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{resume.title}</h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400">Step {activeStep} of 8: {steps[activeStep - 1].name}</p>
        </div>
        <button
          onClick={() => navigate('/resumes')}
          className="vercel-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Resumes</span>
        </button>
      </div>

      {/* Progress Stepper Bar */}
      <div className="hidden lg:flex items-center justify-between gap-1 mb-12 bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-850 rounded-xl no-print">
        {steps.map((s, idx) => {
          const StepIcon = s.icon;
          const isCompleted = idx + 1 < activeStep;
          const isActive = idx + 1 === activeStep;
          return (
            <button
              key={s.name}
              disabled={idx + 1 > activeStep && !resume.personal_details?.name} // Lock future steps until base details filled
              onClick={() => {
                setActiveStep(s.num);
                setSubFormOpen(false);
                setEditingItem(null);
              }}
              className={`flex-grow cursor-pointer flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-blue-800 border-blue-900 dark:border-blue-700 !text-white shadow-sm shadow-blue-500/10'
                  : isCompleted
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300'
                  : 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-900/60 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200/80 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-zinc-300'
              }`}
            >
              <StepIcon className="w-4 h-4 flex-shrink-0" />
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Working Area */}
      <div className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between print:bg-transparent print:border-none print:p-0">
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: Personal Details */}
              {activeStep === 1 && (
                <form onSubmit={handlePersonalSubmit(onPersonalSubmit)} className="space-y-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-purple-400" /> Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        {...regPersonal('name')}
                        className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                        placeholder="John Doe"
                      />
                      {personalErrors.name && <p className="mt-1 text-xs text-rose-400">{personalErrors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Email</label>
                      <input
                        type="email"
                        {...regPersonal('email')}
                        className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                        placeholder="john@example.com"
                      />
                      {personalErrors.email && <p className="mt-1 text-xs text-rose-400">{personalErrors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-500" /> Phone Number
                      </label>
                      <input
                        type="text"
                        {...regPersonal('phone')}
                        className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500" /> Location
                      </label>
                      <input
                        type="text"
                        {...regPersonal('location')}
                        className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                        placeholder="New York, NY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-slate-500" /> Website
                      </label>
                      <input
                        type="text"
                        {...regPersonal('website')}
                        className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                        placeholder="https://johndoe.com"
                      />
                      {personalErrors.website && <p className="mt-1 text-xs text-rose-400">{personalErrors.website.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <GithubIcon className="w-4 h-4 text-slate-500" /> GitHub URL
                      </label>
                      <input
                        type="text"
                        {...regPersonal('github')}
                        className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                        placeholder="https://github.com/johndoe"
                      />
                      {personalErrors.github && <p className="mt-1 text-xs text-rose-400">{personalErrors.github.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <LinkedinIcon className="w-4 h-4 text-slate-500" /> LinkedIn URL
                      </label>
                      <input
                        type="text"
                        {...regPersonal('linkedin')}
                        className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm"
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                      {personalErrors.linkedin && <p className="mt-1 text-xs text-rose-400">{personalErrors.linkedin.message}</p>}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <label className="block text-sm font-medium text-zinc-300">Professional Bio</label>
                      <div className="flex items-center gap-1.5 no-print">
                        <input
                          type="text"
                          placeholder="Target role (e.g. Stripe Backend)..."
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="px-2 py-0.5 bg-black border border-zinc-800 rounded text-[10px] text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 w-36"
                        />
                        <button
                          type="button"
                          disabled={aiLoading}
                          onClick={handleGenerateBio}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                        >
                          {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨ Auto-Write Bio'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      {...regPersonal('bio')}
                      className="block w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm resize-none"
                      placeholder="Brief summary of your professional journey..."
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-900">
                    <button
                      type="submit"
                      disabled={savePersonalMutation.isPending}
                      className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {savePersonalMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          Save & Continue <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* LIST / DYNAMIC ENTRY SECTIONS (Steps 2, 3, 4, 6, 7) */}
              {[2, 3, 4, 6, 7].includes(activeStep) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      {activeStep === 2 && <GraduationCap className="w-4 h-4 text-zinc-400" />}
                      {activeStep === 3 && <Briefcase className="w-4 h-4 text-zinc-400" />}
                      {activeStep === 4 && <Code className="w-4 h-4 text-zinc-400" />}
                      {activeStep === 6 && <Shield className="w-4 h-4 text-zinc-400" />}
                      {activeStep === 7 && <FileCheck className="w-4 h-4 text-zinc-400" />}
                      {steps[activeStep - 1].name}
                    </h2>
                    {!subFormOpen && (
                      <button
                        onClick={() => {
                          setSubFormOpen(true);
                          setEditingItem(null);
                        }}
                        className="vercel-btn-secondary px-3 py-1.5 text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Entry
                      </button>
                    )}
                  </div>

                  {subFormOpen ? (
                    /* Entry Input Form */
                    <form onSubmit={handleSubSubmit(onSubSubmit)} className="space-y-6 bg-zinc-950 p-6 sm:p-8 rounded-xl border border-zinc-900 w-full max-w-3xl mx-auto shadow-2xl">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">{editingItem ? 'Edit Entry' : 'New Entry'}</h3>

                      {activeStep === 2 && (
                        /* Education fields */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Institution</label>
                              <input type="text" {...regSub('institution')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Stanford University" />
                              {subErrors.institution && <p className="mt-1 text-xs text-rose-400">{subErrors.institution.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Degree</label>
                              <input type="text" {...regSub('degree')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Bachelor of Science" />
                              {subErrors.degree && <p className="mt-1 text-xs text-rose-400">{subErrors.degree.message}</p>}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-1">
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Field of Study</label>
                              <input type="text" {...regSub('field_of_study')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Computer Science" />
                              {subErrors.field_of_study && <p className="mt-1 text-xs text-rose-400">{subErrors.field_of_study.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Start Date</label>
                              <input type="text" {...regSub('start_date')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Sep 2018" />
                              {subErrors.start_date && <p className="mt-1 text-xs text-rose-400">{subErrors.start_date.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">End Date (or Expected)</label>
                              <input type="text" {...regSub('end_date')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Jun 2022" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1.5 no-print">
                              <label className="block text-xs font-semibold text-zinc-400 uppercase">Description (Optional)</label>
                              <button
                                type="button"
                                disabled={improveLoading}
                                onClick={handleImproveDescription}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                              >
                                {improveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨ Improve with AI'}
                              </button>
                            </div>
                            <textarea rows={3} {...regSub('description')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white text-sm resize-none" placeholder="Honors, activities, GPA..." />
                          </div>
                        </div>
                      )}

                      {activeStep === 3 && (
                        /* Experience fields */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Company</label>
                              <input type="text" {...regSub('company')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Stripe" />
                              {subErrors.company && <p className="mt-1 text-xs text-rose-400">{subErrors.company.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Position</label>
                              <input type="text" {...regSub('position')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Software Engineer" />
                              {subErrors.position && <p className="mt-1 text-xs text-rose-400">{subErrors.position.message}</p>}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Start Date</label>
                              <input type="text" {...regSub('start_date')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Jan 2022" />
                              {subErrors.start_date && <p className="mt-1 text-xs text-rose-400">{subErrors.start_date.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">End Date (or Present)</label>
                              <input type="text" {...regSub('end_date')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Present" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1.5 no-print">
                              <label className="block text-xs font-semibold text-zinc-400 uppercase">Description (Optional)</label>
                              <button
                                type="button"
                                disabled={improveLoading}
                                onClick={handleImproveDescription}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                              >
                                {improveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨ Improve with AI'}
                              </button>
                            </div>
                            <textarea rows={4} {...regSub('description')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white text-sm resize-none" placeholder="Describe key accomplishments, technologies used..." />
                          </div>
                        </div>
                      )}

                      {activeStep === 4 && (
                        /* Projects fields */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Project Title</label>
                              <input type="text" {...regSub('title')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. SkillMatch AI Platform" />
                              {subErrors.title && <p className="mt-1 text-xs text-rose-400">{subErrors.title.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Your Role</label>
                              <input type="text" {...regSub('role')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Sole Architect / Lead Dev" />
                              {subErrors.role && <p className="mt-1 text-xs text-rose-400">{subErrors.role.message}</p>}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Project Link URL (Optional)</label>
                              <input type="text" {...regSub('url')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="https://github.com/myproject" />
                              {subErrors.url && <p className="mt-1 text-xs text-rose-400">{subErrors.url.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Skills Used (Optional)</label>
                              <input type="text" {...regSub('skills')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. React.js, Node.js, Express.js" />
                              {subErrors.skills && <p className="mt-1 text-xs text-rose-400">{subErrors.skills.message}</p>}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1.5 no-print">
                              <label className="block text-xs font-semibold text-zinc-400 uppercase">Description (Optional)</label>
                              <button
                                type="button"
                                disabled={improveLoading}
                                onClick={handleImproveDescription}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                              >
                                {improveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨ Improve with AI'}
                              </button>
                            </div>
                            <textarea rows={3} {...regSub('description')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white text-sm resize-none" placeholder="Describe project details, stack used..." />
                          </div>
                        </div>
                      )}

                      {activeStep === 6 && (
                        /* Achievements fields */
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Title</label>
                            <input type="text" {...regSub('title')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Hackathon 1st Place Winner" />
                            {subErrors.title && <p className="mt-1 text-xs text-rose-400">{subErrors.title.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Description</label>
                            <textarea rows={3} {...regSub('description')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm resize-none" placeholder="Details of the award or milestone..." />
                            {subErrors.description && <p className="mt-1 text-xs text-rose-400">{subErrors.description.message}</p>}
                          </div>
                        </div>
                      )}

                      {activeStep === 7 && (
                        /* Certificates fields */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Certificate Name</label>
                              <input type="text" {...regSub('name')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. AWS Certified Solutions Architect" />
                              {subErrors.name && <p className="mt-1 text-xs text-rose-400">{subErrors.name.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Issuing Organization</label>
                              <input type="text" {...regSub('issuer')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Amazon Web Services" />
                              {subErrors.issuer && <p className="mt-1 text-xs text-rose-400">{subErrors.issuer.message}</p>}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Date Earned</label>
                              <input type="text" {...regSub('date')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="e.g. Aug 2025" />
                              {subErrors.date && <p className="mt-1 text-xs text-rose-400">{subErrors.date.message}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Certificate Link URL (Optional)</label>
                              <input type="text" {...regSub('url')} className="block w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-sm" placeholder="https://credly.com/cert" />
                              {subErrors.url && <p className="mt-1 text-xs text-rose-400">{subErrors.url.message}</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end pt-4 border-t border-zinc-900 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSubFormOpen(false);
                            setEditingItem(null);
                          }}
                          className="vercel-btn-secondary px-4 py-2 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="vercel-btn-primary px-4 py-2 text-xs cursor-pointer"
                        >
                          {editingItem ? 'Save Changes' : 'Add Entry'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Display entries list */
                    <div className="space-y-4">
                      {/* Active step listing logic */}
                      {activeStep === 2 && (resume.education || []).map((edu) => (
                        <div key={edu.id} className="p-4 bg-black border border-zinc-800 rounded-lg flex items-start justify-between hover:border-zinc-700 transition-colors">
                          <div>
                            <h4 className="font-bold text-white text-sm">{edu.degree} in {edu.field_of_study}</h4>
                            <p className="text-xs text-zinc-400 font-semibold mt-1">{edu.institution}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Calendar className="w-3.5 h-3.5" /> {edu.start_date} - {edu.end_date || 'Present'}</p>
                            {edu.description && <p className="text-xs text-zinc-400 mt-2 whitespace-pre-line">{edu.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(edu); setSubFormOpen(true); }} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-white cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleItemDelete('education', edu.id)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-red-500 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}

                      {activeStep === 3 && (resume.experience || []).map((exp) => (
                        <div key={exp.id} className="p-4 bg-black border border-zinc-800 rounded-lg flex items-start justify-between hover:border-zinc-700 transition-colors">
                          <div>
                            <h4 className="font-bold text-white text-sm">{exp.position}</h4>
                            <p className="text-xs text-zinc-400 font-semibold mt-1">{exp.company}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Calendar className="w-3.5 h-3.5" /> {exp.start_date} - {exp.end_date || 'Present'}</p>
                            {exp.description && <p className="text-xs text-zinc-400 mt-2 whitespace-pre-line">{exp.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(exp); setSubFormOpen(true); }} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-white cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleItemDelete('experience', exp.id)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}

                      {activeStep === 4 && (resume.projects || []).map((proj) => (
                        <div key={proj.id} className="p-4 bg-black border border-zinc-800 rounded-lg flex items-start justify-between hover:border-zinc-700 transition-colors">
                          <div>
                            <h4 className="font-bold text-white text-sm">{proj.title} <span className="text-xs text-zinc-500 font-normal">({proj.role})</span></h4>
                            {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-zinc-300 mt-1 hover:underline">View Project <ExternalLink className="w-3 h-3" /></a>}
                            {proj.description && <p className="text-xs text-zinc-400 mt-2 whitespace-pre-line">{proj.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(proj); setSubFormOpen(true); }} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-white cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleItemDelete('projects', proj.id)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}

                      {activeStep === 6 && (resume.achievements || []).map((ach) => (
                        <div key={ach.id} className="p-4 bg-black border border-zinc-800 rounded-lg flex items-start justify-between hover:border-zinc-700 transition-colors">
                          <div>
                            <h4 className="font-bold text-white text-sm">{ach.title}</h4>
                            <p className="text-xs text-zinc-400 mt-2 whitespace-pre-line">{ach.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(ach); setSubFormOpen(true); }} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-white cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleItemDelete('achievements', ach.id)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}

                      {activeStep === 7 && (resume.certificates || []).map((cert) => (
                        <div key={cert.id} className="p-4 bg-black border border-zinc-800 rounded-lg flex items-start justify-between hover:border-zinc-700 transition-colors">
                          <div>
                            <h4 className="font-bold text-white text-sm">{cert.name}</h4>
                            <p className="text-xs text-zinc-400 font-semibold mt-1">{cert.issuer}</p>
                            <p className="text-xs text-zinc-500 mt-1">{cert.date}</p>
                            {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-zinc-300 mt-2 hover:underline">View Certificate <ExternalLink className="w-3 h-3" /></a>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(cert); setSubFormOpen(true); }} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-white cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleItemDelete('certificates', cert.id)} className="p-1.5 hover:bg-zinc-900 rounded text-zinc-450 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}

                      {/* Display empty text if no items added */}
                      {((activeStep === 2 && !resume.education?.length) ||
                        (activeStep === 3 && !resume.experience?.length) ||
                        (activeStep === 4 && !resume.projects?.length) ||
                        (activeStep === 6 && !resume.achievements?.length) ||
                        (activeStep === 7 && !resume.certificates?.length)) && (
                        <div className="py-12 text-center bg-black border border-dashed border-zinc-800 rounded-lg">
                          <p className="text-xs text-zinc-500">No items added yet. Click "Add Entry" to begin adding details.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Continuing navigation button */}
                  {!subFormOpen && (
                    <div className="flex justify-end pt-8 border-t border-zinc-900 mt-8">
                      <button
                        onClick={() => {
                          const nextMap = { 2: 3, 3: 4, 4: 5, 6: 7, 7: 8 };
                          setActiveStep(nextMap[activeStep]);
                        }}
                        className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        Continue <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Skills Tag Editor */}
              {activeStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                    <Code className="w-4 h-4 text-zinc-400" /> Core Skills
                  </h2>
                  <p className="text-xs text-zinc-400 mb-6">Add technical frameworks, languages, methodologies, or soft skills.</p>

                  <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="block-grow flex-grow px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-xs"
                      placeholder="e.g. Python, Docker, Next.js"
                    />
                    <button
                      type="submit"
                      className="vercel-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </form>

                  {/* Skills Tags Container */}
                  <div className="flex flex-wrap gap-2 py-4 min-h-16 bg-black border border-zinc-800 rounded-lg p-4">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-xs transition-colors hover:border-zinc-700"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:bg-zinc-800 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                          title="Remove Skill"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {skillsList.length === 0 && (
                      <span className="text-xs text-zinc-650 flex items-center justify-center w-full">Type a skill above and click Add.</span>
                    )}
                  </div>

                  <div className="flex justify-end pt-8 border-t border-zinc-900">
                    <button
                      onClick={handleSaveSkills}
                      disabled={saveSkillsMutation.isPending}
                      className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {saveSkillsMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          Save & Continue <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 8: PREVIEW & TEMPLATE SELECTION */}
              {activeStep === 8 && (
                <div className="space-y-8">
                  {/* Template Gallery */}
                  <div className="space-y-4 no-print">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Select Resume Template</h3>
                      <p className="text-xs text-zinc-500">Pick a professional layout structure for your PDF export.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'minimalist', name: 'Minimalist (Default)', desc: 'Clean, ATS-friendly single-column layout.' },
                        { id: 'modern', name: 'Modern Column', desc: 'Sleek two-column layout with a left sidebar.' },
                        { id: 'classic', name: 'Classic Executive', desc: 'Traditional centered layout with serif headers.' }
                      ].map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTemplate(t.id)}
                          className={`p-4 bg-black border rounded-lg cursor-pointer transition-all flex flex-col justify-between ${
                            selectedTemplate === t.id
                              ? 'border-white bg-zinc-900/40'
                              : 'border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            <h4 className="font-bold text-white text-xs">{t.name}</h4>
                            <p className="text-[10px] text-zinc-400 mt-1">{t.desc}</p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              selectedTemplate === t.id ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'
                            }`}>
                              {selectedTemplate === t.id ? 'Active' : 'Select'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PDF Actions & Embed Header */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4 no-print">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-zinc-400" /> Compiled PDF Sheet
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadPdf}
                        disabled={renderLoading || !pdfUrl}
                        className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>

                  {/* PDF Viewer / Loader */}
                  <div className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-4 flex flex-col items-center justify-center min-h-[600px] shadow-2xl relative overflow-hidden">
                    <MultiStepLoader loadingStates={pdfLoadingStates} loading={renderLoading} duration={1200} />
                    {!renderLoading && (
                      pdfUrl ? (
                        <iframe
                          src={pdfUrl}
                          title="Resume PDF Preview"
                          className="w-full h-[700px] bg-white border border-zinc-800 rounded"
                        />
                      ) : (
                        <p className="text-xs text-zinc-500">Failed to render PDF preview. Try selecting a different template or reloading.</p>
                      )
                    )}
                  </div>

                  <div className="flex justify-end pt-8 border-t border-zinc-900 max-w-4xl mx-auto no-print">
                    <button
                      onClick={() => {
                        toast.success('Wizard completed!');
                        navigate('/resumes');
                      }}
                      className="vercel-btn-primary px-5 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Save & Exit Wizard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Universal Back & Continue Navigation Footer (Only when forms are not open) */}
        {!subFormOpen && activeStep !== 5 && activeStep !== 8 && activeStep !== 1 && (
          <div className="flex items-center justify-between border-t border-zinc-900 pt-6 mt-8 no-print">
            <button
              onClick={() => {
                setActiveStep(activeStep - 1);
              }}
              className="vercel-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => {
                setActiveStep(activeStep + 1);
              }}
              className="vercel-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
            >
              Skip Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Back navigation only for step 5 & 8 */}
        {(activeStep === 5 || activeStep === 8) && (
          <div className="flex items-center justify-between border-t border-zinc-900 pt-6 mt-8 no-print">
            <button
              onClick={() => {
                setActiveStep(activeStep - 1);
              }}
              className="vercel-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
