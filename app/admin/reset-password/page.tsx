// app/admin/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '../auth-actions';
import Link from 'next/link';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return <div className="text-red-400">Invalid or missing reset token. Please request a new link.</div>;
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
      setTimeout(() => router.push('/admin/login'), 3000);
    } else {
      setError(res.error || 'Failed to reset password');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-400 font-bold uppercase tracking-widest">Password Reset Successful!</div>
        <p className="text-gray-400 text-sm">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-500/20 text-red-400 text-sm rounded-md border border-red-500/50">{error}</div>}
      <div>
        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">New Password</label>
        <input type="password" name="password" minLength={8} required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Confirm New Password</label>
        <input type="password" name="confirmPassword" minLength={8} required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary" />
      </div>
      <button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md hover:bg-brand-hover disabled:opacity-50">
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md bg-brand-card p-8 rounded-md border border-white/10">
        <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-6">Create New Password</h2>
        <Suspense fallback={<div className="text-gray-400">Loading secure token...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}