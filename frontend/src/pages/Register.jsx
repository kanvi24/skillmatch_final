import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Register() {
  const { registerEmail, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerEmail(data.email, data.password, data.name);
      toast.success('Registered successfully.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.code === 'auth/email-already-in-use'
        ? 'Email address is already in use'
        : error.message || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (socialMethod) => {
    setLoading(true);
    try {
      await socialMethod();
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Social login error:', error);
      toast.error(error.message || 'Social login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-black px-4 py-16">
      <div className="max-w-md w-full vercel-card p-8 sm:p-10 shadow-2xl">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading">
            Create your account
          </h2>
          <p className="mt-2 text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className={`block w-full px-3.5 py-2.5 bg-black border ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'
                } rounded-lg text-white placeholder-zinc-700 focus:outline-none text-sm transition-colors`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className={`block w-full px-3.5 py-2.5 bg-black border ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'
                } rounded-lg text-white placeholder-zinc-700 focus:outline-none text-sm transition-colors`}
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`block w-full pl-3.5 pr-10 py-2.5 bg-black border ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'
                  } rounded-lg text-white placeholder-zinc-700 focus:outline-none text-sm transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-600 hover:text-zinc-400 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`block w-full px-3.5 py-2.5 bg-black border ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'
                } rounded-lg text-white placeholder-zinc-700 focus:outline-none text-sm transition-colors`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="vercel-btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1 mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign Up <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-900"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-black px-3 text-zinc-500">Or continue with</span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google */}
          <button
            onClick={() => handleSocialLogin(loginWithGoogle)}
            disabled={loading}
            className="flex items-center justify-center py-2.5 border border-zinc-850 hover:border-zinc-700 bg-zinc-950/40 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
            type="button"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>

          {/* GitHub */}
          <button
            onClick={() => handleSocialLogin(loginWithGithub)}
            disabled={loading}
            className="flex items-center justify-center py-2.5 border border-zinc-850 hover:border-zinc-700 bg-zinc-950/40 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
            type="button"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
