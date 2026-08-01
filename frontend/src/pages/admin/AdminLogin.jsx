import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import Background from '../../components/Background';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export default function AdminLogin() {
  const { loginEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Login via Firebase email/password
      const userProfile = await loginEmail(data.email, data.password);

      if (userProfile?.role !== 'admin') {
        toast.error('This account does not have admin access.');
        // Sign out if not admin
        await logout();
        setLoading(false);
        return;
      }

      toast.success('Signed in as admin.');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMsg = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error.message || 'Login failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <div className="flex-grow flex items-center justify-center bg-transparent px-4 py-16 min-h-screen">
        <div className="max-w-md w-full vercel-card p-8 sm:p-10 shadow-2xl border border-zinc-800 transition-colors duration-300">
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SkillMatch Admin Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-heading transition-colors duration-300">
              Admin Login
            </h2>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Only authorized staff credentials will be authenticated.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5 transition-colors duration-300">Admin Email</label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('email')}
                    className={`block w-full px-3.5 py-2.5 bg-black border ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'
                    } rounded-lg text-white placeholder-zinc-700 focus:outline-none text-sm transition-colors`}
                    placeholder="admin@skillmatch.ai"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1.5 transition-colors duration-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`block w-full px-3.5 py-2.5 pr-10 bg-black border ${
                      errors.password ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'
                    } rounded-lg text-white placeholder-zinc-700 focus:outline-none text-sm transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-650 hover:text-zinc-400 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="vercel-btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1 cursor-pointer transition-colors duration-300"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Background>
  );
}
