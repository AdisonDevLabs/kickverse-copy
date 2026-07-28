// app/admin/page.tsx
import { getDb } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit } from 'lucide-react';
import DeleteButton from './DeleteButton';
import CategoryManager from './CategoryManager';
import MediaManager from './components/MediaManager';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = await getDb();
  const allProducts = await db.select().from(products);
  const allCategories = await db.select().from(categories);

  return (
    <div className="h-full w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col overflow-hidden">
      
      {/* Dashboard Top Row Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-white">
            Products Dashboard
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
            Manage your inventory and catalog
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0 bg-brand-card p-2 rounded-lg border border-white/5">
          <div className="px-3 border-r border-white/10 hidden sm:flex items-center h-full">
            <CategoryManager categories={allCategories} />
          </div>

          {/* Media Manager integrated into the top action bar */}
          <MediaManager />

          <Link 
            href="/admin/products/new" 
            className="bg-brand-primary text-black px-5 py-2.5 rounded-md font-bold uppercase tracking-widest text-xs flex items-center hover:bg-brand-hover transition-colors shrink-0 shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </div>
      </div>

      {/* Table Container Wrapper */}
      <div className="flex-1 min-h-0 bg-brand-card border border-white/5 rounded-lg overflow-auto shadow-2xl custom-scrollbar">
        <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap table-auto">
          <thead className="bg-black/40 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px]">Image</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px]">Name</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px]">Price</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px]">Category</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 uppercase tracking-widest text-xs">
                  No products found. Start by adding one.
                </td>
              </tr>
            ) : (
              allProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="relative w-12 h-12 bg-black rounded-md overflow-hidden shrink-0 border border-white/5 group-hover:border-white/10 transition-colors">
                      <Image 
                        src={p.image.startsWith('http') ? p.image : `https://kickverse-copy.storxia.tech${p.image}`} 
                        alt={p.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 font-medium text-gray-200 truncate max-w-[180px] sm:max-w-xs">{p.name}</td>
                  <td className="px-4 sm:px-6 py-3 text-brand-primary font-mono font-semibold">Ksh {p.price.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-3 text-gray-400">
                    <span className="bg-white/5 px-2 py-1 rounded text-xs">{p.category}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex justify-end gap-2 sm:gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-gray-400 hover:text-blue-400 p-2 sm:p-2.5 bg-white/5 hover:bg-blue-500/10 rounded-md transition-all border border-transparent hover:border-blue-500/20" aria-label="Edit">
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                      <DeleteButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}