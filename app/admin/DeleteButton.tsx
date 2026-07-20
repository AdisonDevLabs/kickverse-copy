// app/admin/DeleteButton.tsx
'use client';

import { Trash2 } from 'lucide-react';
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
      className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-md disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}