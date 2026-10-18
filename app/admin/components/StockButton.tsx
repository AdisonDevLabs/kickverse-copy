'use client';

import { PackageX, PackageCheck, Loader2 } from 'lucide-react';
import { toggleStockStatus } from '../actions';
import { useState } from 'react';

export default function StockButton({ id, isOutOfStock }: { id: string; isOutOfStock: boolean }) {
  const [outOfStock, setOutOfStock] = useState(isOutOfStock);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    const res = await toggleStockStatus(id, outOfStock);
    if (res.success) {
      setOutOfStock(!outOfStock);
    }
    setIsUpdating(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      title={outOfStock ? "Mark as In Stock" : "Mark as Out of Stock"}
      className={`p-2 sm:p-2.5 rounded-md transition-all border ${
        outOfStock
          ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-md'
          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent'
      }`}
    >
      {isUpdating ? (
        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-gray-400" />
      ) : outOfStock ? (
        <PackageX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      ) : (
        <PackageCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      )}
    </button>
  );
}