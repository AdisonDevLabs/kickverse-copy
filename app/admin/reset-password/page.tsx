'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '../auth-actions';
import { Lock, AlertCircle, Loader2, CheckCircle, KeyRound, ShieldAlert } from 'lucide-react';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Elegant Error State for missing/invalid tokens
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 py-4">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-2">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-red-400 font-medium">Invalid or missing reset token.</p>
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">Please request a new link.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('token', token);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const res = await resetPassword(formData);
    
    if (res.success) {
      setSuccess(true);
      // Wait 3 seconds to show success animation before redirecting
      setTimeout(() => router.push('/admin/login'), 3000);
    } else {
      setError(res.error || 'Failed to reset password');
      setLoading(false);
    }
  };

  // Animated Success State
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500 py-6">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-2 shadow-inner shadow-green-500/20">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <div className="text-green-400 font-bold uppercase tracking-widest text-lg">Password Updated!</div>
        <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-500">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 mb-2 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      {/* New Password Input */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
          New Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-primary transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input 
            type="password" 
            name="password" 
            minLength={8}
            required 
            disabled={loading}
            className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-brand-primary focus:bg-black/40 transition-all disabled:opacity-50 placeholder:text-gray-600" 
            placeholder="Minimum 8 characters"
          />
        </div>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
          Confirm New Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-primary transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input 
            type="password" 
            name="confirmPassword" 
            minLength={8}
            required 
            disabled={loading}
            className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-brand-primary focus:bg-black/40 transition-all disabled:opacity-50 placeholder:text-gray-600" 
            placeholder="Repeat password"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading} 
        className="relative w-full h-12 mt-8 bg-brand-primary text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-hover hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center overflow-hidden shadow-lg shadow-brand-primary/20"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </span>
        ) : (
          'Update Password'
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4 selection:bg-brand-primary selection:text-black">
      {/* Main Card with matching shadow, border, and glow */}
      <div className="w-full max-w-md bg-brand-card p-8 sm:p-10 rounded-2xl border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
        
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <KeyRound className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-display uppercase tracking-widest text-white">New Password</h2>
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-2">
            Secure your Admin account
          </p>
        </div>

        {/* Suspense Boundary matching the aesthetic */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">Verifying secure token...</p>
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}