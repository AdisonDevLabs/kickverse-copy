// app/admin/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { requestPasswordReset } from '../auth-actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null); // Clear any previous status
    
    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);
    
    // Map either the success message or the error message to the status state
    setStatus({ success: res.success, message: res.message || res.error });
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md bg-brand-card p-8 rounded-md border border-white/10 shadow-2xl">
        <Link href="/admin/login" className="text-gray-400 text-xs flex items-center mb-6 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>
        <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-2">Reset Password</h2>
        <p className="text-sm text-gray-400 mb-6">Enter your admin email address to receive a secure reset link.</p>
        
        {status?.success ? (
          <div className="p-4 bg-green-500/10 text-green-400 text-sm rounded-md border border-green-500/20 flex items-start animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
            <p>{status.message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display error message if success is false */}
            {status && status.success === false && (
              <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-md border border-red-500/20 flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <p>{status.message}</p>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full bg-brand-dark/50 border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                   <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}