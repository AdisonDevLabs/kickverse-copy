// app/(storefront)/product/[id]/not-found.tsx
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-brand-dark text-white pt-[120px]">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wide mb-3">Product Not Found</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm md:text-base">
        This specific footwear model might be out of stock or relocated. Explore our top categories available for fast delivery in Nairobi:
      </p>
      {/* SEO Internal Link Silos */}
      <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-lg">
        <Link href="/shop?type=sneakers" className="px-4 py-2 bg-brand-card border border-white/10 hover:border-brand-primary/50 rounded-md text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
          Sneakers
        </Link>
        <Link href="/shop?type=soccer-cleats" className="px-4 py-2 bg-brand-card border border-white/10 hover:border-brand-primary/50 rounded-md text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
          Soccer Cleats
        </Link>
        <Link href="/shop?type=official-shoes" className="px-4 py-2 bg-brand-card border border-white/10 hover:border-brand-primary/50 rounded-md text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
          Official Shoes
        </Link>
        <Link href="/shop?type=opens-and-sandals" className="px-4 py-2 bg-brand-card border border-white/10 hover:border-brand-primary/50 rounded-md text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
          Opens & Sandals
        </Link>
      </div>
      <Link href="/shop" className="inline-flex h-14 px-8 bg-white text-black font-bold uppercase tracking-widest hover:bg-brand-primary transition-colors items-center justify-center rounded-md">
        Back to Shop
      </Link>
    </div>
  );
}