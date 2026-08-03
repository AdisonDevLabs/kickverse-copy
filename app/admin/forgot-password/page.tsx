'use client';

import { useState } from 'react';
import { requestPasswordReset } from '../auth-actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail, Loader2, KeyRound, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null); // Clear previous status
    
    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);
    
    setStatus({ success: res.success, message: res.message || res.error });
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4 selection:bg-brand-primary selection:text-black">
      {/* Main Card with matching shadow, border, and glow */}
      <div className="w-full max-w-md bg-brand-card p-8 sm:p-10 rounded-2xl border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
        
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>

        {/* Back Link with hover animation */}
        <Link 
          href="/admin/login" 
          className="inline-flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Login
        </Link>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <KeyRound className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-display uppercase tracking-widest text-white">Reset Password</h2>
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">
            Enter your admin email address to receive a secure reset link.
          </p>
        </div>
        
        {/* Dynamic Status Banner */}
        {status ? (
          <div className={`flex items-start gap-3 p-4 mb-2 text-sm rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
            status.success 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {status.success ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="font-medium leading-relaxed">{status.message}</p>
          </div>
        ) : (
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

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="relative w-full h-12 mt-8 bg-brand-primary text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-hover hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center overflow-hidden shadow-lg shadow-brand-primary/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}