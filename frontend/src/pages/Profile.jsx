import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { User, Phone, MapPin, Globe, Briefcase, FileText, Loader2, Save, Edit2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  title: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  github: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

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

export default function Profile() {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      bio: '',
      phone: '',
      location: '',
      website: '',
      github: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        title: user.title || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.put(`${backendUrl}/auth/profile`, data);
      updateProfile(response.data);
      toast.success('Profile updated.');
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      if (!error.response) {
        toast.info('Local backend not running. Saving mock profiles locally...', { autoClose: 3000 });
        updateProfile(data);
        setIsEditing(false);
      } else {
        const errorMsg = error.response?.data?.detail || 'Failed to update profile details';
        toast.error(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full animate-pulse">
        {/* Profile Header Card Skeleton */}
        <div className="vercel-card p-6 sm:p-8 mb-8 relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-lg bg-zinc-200 dark:bg-slate-800 animate-pulse" />
            <div className="flex-grow space-y-2.5 text-center sm:text-left">
              <div className="h-7 w-48 bg-zinc-300 dark:bg-slate-700 rounded mx-auto sm:mx-0" />
              <div className="h-4 w-36 bg-zinc-200 dark:bg-slate-800 rounded mx-auto sm:mx-0" />
              <div className="h-3.5 w-44 bg-zinc-100 dark:bg-slate-900 rounded mx-auto sm:mx-0" />
            </div>
            <div className="h-9 w-28 bg-zinc-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-[1px] bg-zinc-200 dark:bg-slate-850 mt-6" />
          <div className="space-y-2">
            <div className="h-3 w-16 bg-zinc-200 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-full bg-zinc-100 dark:bg-slate-900 rounded" />
            <div className="h-3.5 w-2/3 bg-zinc-100 dark:bg-slate-900 rounded" />
          </div>
        </div>

        {/* Main Info Form Skeleton */}
        <div className="vercel-card p-6 sm:p-8 space-y-6">
          <div className="h-5 w-36 bg-zinc-200 dark:bg-slate-800 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-slate-800 rounded" />
                <div className="h-9 w-full bg-zinc-100 dark:bg-slate-900 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      {/* Profile Header Card */}
      <div className="vercel-card p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-gray-900 dark:text-white font-bold text-2xl">
            {user?.name ? user.name.split(' ').map((n) => n[0]).slice(0,2).join('').toUpperCase() : 'U'}
          </div>
          <div className="flex-grow text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
              {user?.name || 'Anonymous User'}
            </h1>
            <p className="text-zinc-450 dark:text-zinc-400 font-medium text-sm mt-2 flex items-center justify-center sm:justify-start gap-2">
              <Briefcase className="w-4 h-4 text-zinc-500" /> {user?.title || 'Add Professional Title'}
            </p>
            <p className="text-zinc-650 dark:text-zinc-500 text-xs mt-1">{user?.email}</p>
          </div>
          <div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="vercel-btn-secondary px-4 py-2 text-xs"
              >
                <Edit2 className="w-3.5 h-3.5 inline mr-1.5" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {user?.bio && (
          <div className="mt-6 border-t border-zinc-800/80 pt-6 relative z-10">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Biography</h3>
            <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line">{user.bio}</p>
          </div>
        )}
      </div>

      {/* Main Profile Info / Edit Form */}
      <div className="vercel-card p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" />
            General Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                {...register('name')}
                className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs transition-colors"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Professional Title</label>
              <input
                type="text"
                disabled={!isEditing}
                {...register('title')}
                className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs transition-colors"
                placeholder="Senior Frontend Developer"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-500" /> Phone Number
              </label>
              <input
                type="text"
                disabled={!isEditing}
                {...register('phone')}
                className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-500" /> Location
              </label>
              <input
                type="text"
                disabled={!isEditing}
                {...register('location')}
                className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs transition-colors"
                placeholder="San Francisco, CA"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-500" /> Personal Website
              </label>
              <input
                type="text"
                disabled={!isEditing}
                {...register('website')}
                className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs transition-colors"
                placeholder="https://johndoe.com"
              />
              {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>}
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <GithubIcon className="w-3 h-3 text-zinc-500" /> GitHub URL
              </label>
              <input
                type="text"
                disabled={!isEditing}
                {...register('github')}
                className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs transition-colors"
                placeholder="https://github.com/johndoe"
              />
              {errors.github && <p className="mt-1 text-xs text-red-500">{errors.github.message}</p>}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <LinkedinIcon className="w-3 h-3 text-zinc-500" /> LinkedIn URL
              </label>
              <input
                type="text"
                disabled={!isEditing}
                {...register('linkedin')}
                className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs transition-colors"
                placeholder="https://linkedin.com/in/johndoe"
              />
              {errors.linkedin && <p className="mt-1 text-xs text-red-500">{errors.linkedin.message}</p>}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-500" /> Short Biography
            </label>
            <textarea
              rows={4}
              disabled={!isEditing}
              {...register('bio')}
              className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white disabled:opacity-50 text-xs resize-none transition-colors"
              placeholder="Tell companies a little about yourself and your background..."
            />
            {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="flex justify-end gap-3 border-t border-zinc-800/80 pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                className="vercel-btn-secondary px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
