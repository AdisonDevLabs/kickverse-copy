// app/admin/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '../auth-actions';
import { CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded-md border border-red-500/20 flex items-start animate-in fade-in">
        <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
        <p>Invalid or missing reset token. Please request a new link.</p>
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
      // Wait 3 seconds then redirect to login
      setTimeout(() => router.push('/admin/login'), 3000);
    } else {
      setError(res.error || 'Failed to reset password');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="text-green-400 font-bold uppercase tracking-widest text-lg">Password Updated!</div>
        <p className="text-gray-400 text-sm">Redirecting you to the login portal...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-md border border-red-500/20 flex items-start animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      <div>
        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">New Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <KeyRound className="h-4 w-4 text-gray-500" />
          </div>
          <input 
            type="password" 
            name="password" 
            minLength={8} 
            required 
            placeholder="Min 8 characters"
            className="block w-full bg-brand-dark/50 border border-white/10 rounded-md pl-10 pr-4 py-3 text-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Confirm New Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <KeyRound className="h-4 w-4 text-gray-500" />
          </div>
          <input 
            type="password" 
            name="confirmPassword" 
            minLength={8} 
            required 
            placeholder="Re-enter password"
            className="block w-full bg-brand-dark/50 border border-white/10 rounded-md pl-10 pr-4 py-3 text-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" 
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full h-12 mt-2 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </span>
        ) : 'Update Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md bg-brand-card p-8 rounded-xl shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-5 blur-[64px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-6 relative z-10">Create New Password</h2>
        
        <div className="relative z-10">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8 text-brand-primary">
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          }>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}