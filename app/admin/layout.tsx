// app/admin/layout.tsx
import { ArrowLeft, Box, Palette, Ruler, Image as ImageIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Import Database requirements to pass initial categories
import { getDb } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import CategoryManager from './CategoryManager'; 

export const metadata = {
  title: 'Admin Dashboard | Shoe World',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fetch initial categories for the modal
  const db = await getDb();
  const allCategories = await db.select().from(categories);

  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('admin_session'); 
    redirect('/'); 
  }

  return (
    <div className="h-screen w-full bg-brand-dark text-white flex flex-col overflow-hidden">
      
      {/* Top Header */}
      <header className="bg-brand-card border-b border-white/10 px-6 py-4 flex justify-between items-center h-14 shrink-0 w-full">
        <div className="font-display text-xl uppercase tracking-widest text-brand-primary">
          Admin Control
        </div>
        
        <form action={handleLogout}>
          <button 
            type="submit" 
            className="text-gray-400 hover:text-white flex items-center text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Admin
          </button>
        </form>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-brand-dark border-b border-white/10 px-6 py-3 flex gap-8 overflow-x-auto hide-scrollbar shrink-0 w-full items-center">
         <Link href="/admin" className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors whitespace-nowrap">
           <Box className="w-4 h-4 mr-2" /> Products
         </Link>
         
         {/* Render Modal with fetched props */}
         <CategoryManager categories={allCategories} />
         <Link href="/admin" className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors whitespace-nowrap">
           <ImageIcon className="w-4 h-4 mr-2" /> Media Library
         </Link>
         
         <Link href="/admin/colors" className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors whitespace-nowrap">
           <Palette className="w-4 h-4 mr-2" /> Colors
         </Link>
         <Link href="/admin/size-guides" className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors whitespace-nowrap">
           <Ruler className="w-4 h-4 mr-2" /> Size Guides
         </Link>
      </nav>
      
      {/* Admin Content Area */}
      <main className="flex-1 min-h-0 relative bg-brand-dark overflow-y-auto">
        {children}
      </main>
    </div>
  );
}