// app/admin/DeleteButton.tsx
'use client';

import { Trash2, Loader2 } from 'lucide-react';
import { deleteProduct } from './actions';
import { useState } from 'react';

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(true);
      await deleteProduct(id);
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-gray-400 hover:text-red-400 p-2 sm:p-2.5 bg-white/5 hover:bg-red-500/10 rounded-md disabled:opacity-50 transition-all border border-transparent hover:border-red-500/20"
      aria-label="Delete Product"
    >
      {isDeleting ? (
        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-red-400" />
      ) : (
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      )}
    </button>
  );
}