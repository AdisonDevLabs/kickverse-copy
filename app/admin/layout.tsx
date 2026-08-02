// app/admin/layout.tsx
import { ArrowLeft, Box, Palette, Ruler, Image as ImageIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Import Database requirements to pass initial categories
import { getDb } from '@/lib/db';
import { categories, mediaAssets } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import CategoryManager from './CategoryManager'; 
import MediaManager from './components/MediaManager';

export const metadata = {
  title: 'Admin Dashboard | Kickverse KE',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fetch initial categories for the modal
  const db = await getDb();
  const allCategories = await db.select().from(categories);
  const allMedia = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.id));

  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('admin_session'); 
    redirect('/'); 
  }

  return (
    <div className="h-screen w-full bg-brand-dark text-white flex flex-col overflow-hidden selection:bg-brand-primary selection:text-black">
      
      {/* Top Header */}
      <header className="bg-brand-card border-b border-white/5 px-6 py-4 flex justify-between items-center h-16 shrink-0 w-full shadow-sm">
        <div className="font-display text-2xl uppercase tracking-widest text-brand-primary">
          Admin Control
        </div>
        
        <form action={handleLogout}>
          <button 
            type="submit" 
            className="group flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Exit Admin
          </button>
        </form>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-black/20 border-b border-white/5 px-6 flex gap-8 overflow-x-auto hide-scrollbar shrink-0 w-full items-center h-12 shadow-inner">
         <Link href="/admin" className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors whitespace-nowrap h-full border-b-2 border-transparent hover:border-brand-primary">
           <Box className="w-4 h-4 mr-2" /> Products
         </Link>
         
         {/* Render Modal with fetched props */}
         <div className="flex items-center h-full border-b-2 border-transparent hover:border-brand-primary transition-colors">
            <CategoryManager categories={allCategories} />
         </div>

         {/* 2. Replaced static link with MediaManager Trigger */}
         <div className="flex items-center h-full border-b-2 border-transparent hover:border-brand-primary transition-colors">
            <MediaManager initialMedia={allMedia} />
         </div>
         
         <Link href="/admin/colors" className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors whitespace-nowrap h-full border-b-2 border-transparent hover:border-brand-primary">
           <Palette className="w-4 h-4 mr-2" /> Colors
         </Link>
         
         <Link href="/admin/size-guides" className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors whitespace-nowrap h-full border-b-2 border-transparent hover:border-brand-primary">
           <Ruler className="w-4 h-4 mr-2" /> Size Guides
         </Link>
      </nav>
      
      {/* Admin Content Area */}
      <main className="flex-1 min-h-0 relative bg-brand-dark overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}