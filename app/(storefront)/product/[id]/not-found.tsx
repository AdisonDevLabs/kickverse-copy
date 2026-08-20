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
        This product might be out of stock or the link might be broken.
      </p>
      <Link href="/shop" className="inline-flex h-14 px-8 bg-white text-black font-bold uppercase tracking-widest hover:bg-brand-primary transition-colors items-center justify-center rounded-md">
        Back to Shop
      </Link>
    </div>
  );
}