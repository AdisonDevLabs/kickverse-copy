import { getDb } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import { ilike, and, eq, sql, desc } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import DeleteButton from './DeleteButton';
import CategoryManager from './CategoryManager';
import MediaManager from './components/MediaManager';
import ProductToolbar from './components/ProductToolbar';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminDashboard(props: { searchParams: SearchParams }) {
  const db = await getDb();
  
  // 1. Await the searchParams Promise (Required for Next.js 15+)
  const searchParams = await props.searchParams;

  // 2. Extract Search Params safely
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const categoryFilter = typeof searchParams.category === 'string' ? searchParams.category : '';
  const currentPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const itemsPerPage = 20;

  // 3. Build Dynamic Where Clause
  const conditions = [];
  if (query) {
    conditions.push(ilike(products.name, `%${query}%`));
  }
  if (categoryFilter) {
    conditions.push(eq(products.category, categoryFilter));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 4. Execute Optimized Queries concurrently
  const [allCategories, fetchedProducts, totalCountResult] = await Promise.all([
    db.select().from(categories),
    db.select().from(products)
      .where(whereClause)
      .limit(itemsPerPage)
      .offset((currentPage - 1) * itemsPerPage)
      .orderBy(desc(products.id)),
    db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause)
  ]);

  const totalProducts = Number(totalCountResult[0]?.count || 0);
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Helper function to build clean pagination URLs
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (categoryFilter) params.set('category', categoryFilter);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="h-full w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
      
      {/* Dashboard Top Row Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wide text-white">
            Inventory
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mt-1">
            {totalProducts} Total Items
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 shrink-0 bg-brand-card p-2 rounded-lg border border-white/5 shadow-md">
          {/* Integrated the Toolbar Component */}
          <ProductToolbar categories={allCategories} />

          <div className="hidden lg:flex px-3 border-l border-white/10 items-center h-full">
            <CategoryManager categories={allCategories} />
          </div>

          <div className="hidden sm:block">
            <MediaManager />
          </div>

          <Link 
            href="/admin/products/new" 
            className="bg-brand-primary text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-md font-bold uppercase tracking-widest text-xs flex items-center justify-center hover:bg-brand-hover transition-colors shrink-0 shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </div>
      </div>

      {/* Table Container Wrapper - Optimized for Mobile Scrolling */}
      <div className="flex-1 min-h-0 bg-brand-card border border-white/5 rounded-lg overflow-x-auto overflow-y-auto shadow-2xl custom-scrollbar relative">
        <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap table-auto min-w-[700px]">
          <thead className="bg-brand-card/95 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px] w-16">Image</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px]">Product Details</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px]">Price</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px] hidden md:table-cell">Type</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px] hidden sm:table-cell">Category</th>
              <th className="px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-gray-500 text-[10px] text-right sticky right-0 bg-brand-card/95 backdrop-blur-md">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {fetchedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p className="uppercase tracking-widest text-xs font-bold mb-2">No products found</p>
                    <p className="text-xs opacity-70">Adjust your search filters or add a new product.</p>
                  </div>
                </td>
              </tr>
            ) : (
              fetchedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-md overflow-hidden shrink-0 border border-white/5 group-hover:border-white/20 transition-colors">
                      <Image 
                        src={p.image.startsWith('http') ? p.image : `https://kickverse.co.ke${p.image}`} 
                        alt={p.name} 
                        fill 
                        className="object-cover" 
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <p className="font-medium text-gray-200 truncate max-w-[150px] sm:max-w-xs md:max-w-md" title={p.name}>
                      {p.name}
                    </p>
                    <div className="flex sm:hidden items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest">{p.category}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-brand-primary font-mono font-semibold">
                    Ksh {p.price.toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-gray-400 hidden md:table-cell">
                    <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-1 rounded text-[10px] uppercase tracking-wider font-medium">
                      {p.productType}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-gray-400 hidden sm:table-cell">
                    <span className="bg-white/5 px-2 py-1 rounded text-xs">{p.category}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right sticky right-0 bg-brand-card group-hover:bg-[#1a1a1a] transition-colors shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-end gap-2 sm:gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-gray-400 hover:text-blue-400 p-2 bg-white/5 hover:bg-blue-500/10 rounded-md transition-all border border-transparent hover:border-blue-500/20" aria-label="Edit">
                        <Edit className="w-4 h-4" />
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 bg-brand-card p-3 rounded-lg border border-white/5 shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest hidden sm:block">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts}
          </p>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Link
              href={createPageUrl(Math.max(1, currentPage - 1))}
              className={`p-2 rounded-md border border-white/10 flex items-center text-xs font-bold uppercase tracking-widest transition-colors ${currentPage === 1 ? 'opacity-50 pointer-events-none text-gray-600' : 'text-white hover:bg-white/5 hover:border-white/20'}`}
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Prev</span>
            </Link>
            
            <span className="text-xs text-gray-400 font-mono sm:hidden">
              {currentPage} / {totalPages}
            </span>

            <Link
              href={createPageUrl(Math.min(totalPages, currentPage + 1))}
              className={`p-2 rounded-md border border-white/10 flex items-center text-xs font-bold uppercase tracking-widest transition-colors ${currentPage === totalPages ? 'opacity-50 pointer-events-none text-gray-600' : 'text-white hover:bg-white/5 hover:border-white/20'}`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 sm:ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}