// app/admin/page.tsx
import { getDb } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit } from 'lucide-react';
import DeleteButton from './DeleteButton';
import CategoryManager from './CategoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = await getDb();
  const allProducts = await db.select().from(products);
  const allCategories = await db.select().from(categories);

  return (
    <div className="h-full w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col overflow-hidden">
      {/* Dashboard Top Row Actions - Fixed height header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <h1 className="font-display text-2xl sm:text-4xl uppercase tracking-wide truncate">
          Products Dashboard
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <CategoryManager categories={allCategories} />

          <Link 
            href="/admin/products/new" 
            className="bg-brand-primary text-black px-4 py-2 rounded-md font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center hover:bg-brand-hover transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5 sm:mr-2" /> Add Product
          </Link>
        </div>
      </div>

      {/* Table Container Wrapper - Purely self-scrollable container section */}
      <div className="flex-1 min-h-0 bg-brand-card border border-white/5 rounded-md overflow-auto shadow-inner scrollbar-hide">
        <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap table-auto">
          <thead className="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-400">Image</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-400">Name</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-400">Price</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-400">Category</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allProducts.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 sm:px-6 py-2.5">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-md overflow-hidden shrink-0">
                    <Image 
                      src={p.image.startsWith('http') ? p.image : `https://kickverse-copy.storxia.tech${p.image}`} 
                      alt={p.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-2.5 font-medium truncate max-w-[180px] sm:max-w-xs">{p.name}</td>
                <td className="px-4 sm:px-6 py-2.5 text-brand-primary font-mono font-semibold">Ksh {p.price}</td>
                <td className="px-4 sm:px-6 py-2.5 text-gray-400">{p.category}</td>
                <td className="px-4 sm:px-6 py-2.5 text-right">
                  <div className="flex justify-end gap-2 sm:gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-blue-400 hover:text-blue-300 p-1.5 sm:p-2 bg-blue-500/10 rounded-md transition-colors" aria-label="Edit">
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                    <DeleteButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}