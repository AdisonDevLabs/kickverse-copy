// app/admin/products/[id]/edit/EditFormClient.tsx
'use client';

import React, { useState } from 'react';
import { updateProduct, createQuickCategory } from '../../../actions';
import { Upload, CheckCircle, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function EditFormClient({ product, initialCategories }: { product: any, initialCategories: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Category State
  const [activeCategories, setActiveCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(product.category || initialCategories[0]?.name || '');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    const res = await createQuickCategory(newCategoryName);
    
    // Add && res.category here to satisfy TypeScript strict mode
    if (res.success && res.category) {
      setActiveCategories([...activeCategories, res.category]);
      setSelectedCategory(res.category.name);
      setIsAddingCategory(false);
      setNewCategoryName('');
    } else {
      alert(`Failed to add category: ${res.error}`);
    }
    setIsSavingCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    formData.set('category', selectedCategory);
    const response = await updateProduct(product.id, formData);
    
    setStatus({ success: response.success, message: response.success ? response.message : response.error });
    setIsSubmitting(false);
  };

  return (
    <div className="h-full w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col overflow-hidden">
      <div className="shrink-0 mb-6">
        <Link href="/admin" className="text-brand-primary text-sm flex items-center mb-4 w-fit hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl sm:text-4xl uppercase tracking-wide text-white">Edit Product</h1>
      </div>

      {status && (
        <div className={`shrink-0 p-4 rounded-md mb-6 ${status.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {status.message}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto scrollbar-hide bg-brand-card rounded-md border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Product Name</label>
              <input type="text" name="name" defaultValue={product.name} required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors" />
            </div>
            
            {/* Dynamic Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)} 
                    placeholder="Category Name" 
                    className="flex-1 bg-brand-dark border border-brand-primary rounded-md px-4 py-3 text-white focus:outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={handleAddCategory} disabled={isSavingCategory} className="px-4 bg-brand-primary text-black font-bold text-xs uppercase tracking-widest rounded-md hover:bg-brand-hover transition-colors">
                    {isSavingCategory ? 'Saving' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    className="flex-1 bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors"
                  >
                    {activeCategories.map((cat: any) => (
                      <option key={cat.slug} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setIsAddingCategory(true)} className="px-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-md transition-colors flex items-center shrink-0 border border-white/10">
                    <Plus className="w-4 h-4 mr-1" /> New
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Price (Ksh)</label>
              <input type="number" name="price" defaultValue={product.price} required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Original Price</label>
              <input type="number" name="originalPrice" defaultValue={product.originalPrice || ''} className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Sizes (Comma separated)</label>
              <input type="text" name="sizes" defaultValue={product.sizes?.join(', ')} required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Colors (Comma separated)</label>
              <input type="text" name="colors" defaultValue={product.colors?.join(', ')} required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-white/5">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isNewArrival" defaultChecked={product.isNewArrival} className="w-5 h-5 accent-brand-primary bg-brand-dark border-white/10 transition-colors" />
              <span className="text-sm font-bold uppercase tracking-widest text-white">New Arrival</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isBestSeller" defaultChecked={product.isBestSeller} className="w-5 h-5 accent-brand-primary bg-brand-dark border-white/10 transition-colors" />
              <span className="text-sm font-bold uppercase tracking-widest text-white">Best Seller</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isFlashDeal" defaultChecked={product.isFlashDeal} className="w-5 h-5 accent-brand-primary bg-brand-dark border-white/10 transition-colors" />
              <span className="text-sm font-bold uppercase tracking-widest text-white">Flash Deal</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description (Optional)</label>
            <textarea name="description" rows={4} defaultValue={product.description} className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors"></textarea>
          </div>

          <div className="bg-brand-dark p-6 rounded-md border border-white/5">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center">
               <Upload className="w-4 h-4 mr-2" /> Update Main Image (Leave blank to keep existing)
            </label>
            <input type="file" name="mainImage" accept="image/*" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors cursor-pointer" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md disabled:opacity-50 hover:bg-brand-hover transition-colors flex items-center justify-center">
            {isSubmitting ? 'Saving...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
}