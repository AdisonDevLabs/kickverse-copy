// app/admin/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { requestPasswordReset } from '../auth-actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);
    setStatus({ success: res.success, message: res.message || res.error });
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md bg-brand-card p-8 rounded-md border border-white/10">
        <Link href="/admin/login" className="text-gray-400 text-xs flex items-center mb-6 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>
        <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-2">Reset Password</h2>
        <p className="text-sm text-gray-400 mb-6">Enter your admin email address to receive a secure reset link.</p>
        
        {status ? (
          <div className="p-4 bg-green-500/20 text-green-400 text-sm rounded-md border border-green-500/50 flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
            <p>{status.message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Email Address</label>
              <input type="email" name="email" required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md hover:bg-brand-hover disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}