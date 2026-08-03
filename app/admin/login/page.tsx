'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '../auth-actions';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

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
      // Intentionally not setting loading to false here to keep the loading state active during the redirect
    } else {
      setError(res.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4 selection:bg-brand-primary selection:text-black">
      {/* Main Card with subtle shadow, border, and glow */}
      <div className="w-full max-w-md bg-brand-card p-8 sm:p-10 rounded-2xl border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
        
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-display uppercase tracking-widest text-white">Admin Access</h2>
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-2">Kickverse Control Panel</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-3.5 mb-6 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-primary transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                name="email" 
                required 
                disabled={loading}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-brand-primary focus:bg-black/40 transition-all disabled:opacity-50 placeholder:text-gray-600" 
                placeholder="admin@kickverse.co.ke"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Password
              </label>
              <Link 
                href="/admin/forgot-password" 
                className="text-[10px] text-gray-500 hover:text-brand-primary uppercase tracking-widest transition-colors font-bold"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-primary transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                name="password" 
                required 
                disabled={loading}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-brand-primary focus:bg-black/40 transition-all disabled:opacity-50 placeholder:text-gray-600" 
                placeholder="••••••••"
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