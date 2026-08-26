'use client';

import { Suspense } from 'react';
import ShopClient from './ShopClient';

// Dynamically import the ShopClient with SSR strictly disabled
export default function ShopWrapper({ initialProducts }: { initialProducts: any[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-dark" aria-label="Loading Collection">
        <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-brand-primary animate-spin" />
      </div>
    }>
      <ShopClient initialProducts={initialProducts} />
    </Suspense>
  );
}