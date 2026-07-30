'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';

export default function ProductToolbar({ categories }: { categories: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const currentCategory = searchParams.get('category') || '';

  // Debounced search to prevent spamming the server on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (search) {
        params.set('q', search);
      } else {
        params.delete('q');
      }
      
      // Reset to page 1 on new search
      params.delete('page');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [search, pathname, router, searchParams]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (val) {
      params.set('category', val);
    } else {
      params.delete('category');
    }
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = search || currentCategory;

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto bg-black/20 p-2 rounded-lg border border-white/5">
      {/* Search Input */}
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-brand-dark border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
          aria-label="Search products"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Category Filter */}
      <div className="relative flex-1 sm:w-48">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <select
          value={currentCategory}
          onChange={handleCategoryChange}
          className="w-full bg-brand-dark border border-white/10 rounded-md py-2 pl-9 pr-8 text-sm text-white appearance-none focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 cursor-pointer"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center justify-center px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-md transition-colors"
          aria-label="Clear filters"
        >
          <X className="w-4 h-4 mr-1 sm:mr-0" />
          <span className="sm:hidden">Clear</span>
        </button>
      )}
    </div>
  );
}