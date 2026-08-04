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
    <div className="flex h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md bg-brand-card p-8 rounded-md border border-white/10">
        <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-6">Admin Login</h2>
        {error && <div className="p-3 mb-4 bg-red-500/20 text-red-400 text-sm rounded-md border border-red-500/50">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Email Address</label>
            <input type="email" name="email" required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold uppercase text-gray-400">Password</label>
              <Link href="/admin/forgot-password" className="text-xs text-brand-primary hover:text-white transition-colors">Forgot?</Link>
            </div>
            <input type="password" name="password" required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary" />
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}