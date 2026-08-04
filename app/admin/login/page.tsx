// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '../auth-actions';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);
    
    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-dark px-4 sm:px-6 lg:px-8">
      {/* Subtle ambient background glow for premium feel */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[30rem] h-[30rem] bg-brand-primary opacity-[0.03] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-brand-card/90 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/5">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display uppercase tracking-widest text-white mb-2">Admin Portal</h2>
          <p className="text-sm text-gray-400">Secure access to your dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-gray-400">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                id="email" 
                type="email" 
                name="email" 
                required 
                placeholder="admin@example.com"
                className="block w-full bg-brand-dark/50 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 transition-all focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-gray-400">
                Password
              </label>
              <Link href="/admin/forgot-password" className="text-xs font-medium text-brand-primary hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                id="password" 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                className="block w-full bg-brand-dark/50 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 transition-all focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-xl text-black bg-brand-primary hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}