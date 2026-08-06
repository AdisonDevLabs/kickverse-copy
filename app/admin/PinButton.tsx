'use client';

import { Pin, Loader2 } from 'lucide-react';
import { togglePinProduct } from './actions';
import { useState } from 'react';

export default function PinButton({ id, isPinned }: { id: string; isPinned: boolean }) {
  const [pinned, setPinned] = useState(isPinned);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    const res = await togglePinProduct(id, pinned);
    if (res.success) {
      setPinned(!pinned);
    }
    setIsUpdating(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      title={pinned ? "Unpin from Best Picks" : "Add to Best Picks"}
      className={`p-2 sm:p-2.5 rounded-md transition-all border ${
        pinned
          ? 'bg-brand-primary text-black border-brand-primary shadow-md shadow-brand-primary/20'
          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent'
      }`}
    >
      {isUpdating ? (
        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-gray-400" />
      ) : (
        <Pin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${pinned ? 'fill-black' : ''}`} />
      )}
    </button>
  );
}