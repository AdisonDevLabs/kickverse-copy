// app/admin/products/[id]/edit/EditFormClient.tsx
'use client';

import React, { useState } from 'react';
import { updateProduct, createQuickCategory } from '../../../actions';
import { CheckCircle, ArrowLeft, Plus, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function EditFormClient({ product, initialCategories, initialMedia }: { product: any, initialCategories: any[], initialMedia: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Category State
  const [activeCategories, setActiveCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(product.category || initialCategories[0]?.name || '');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Media Library Mapping State - Hydrated from existing data
  const [mainImageUrl, setMainImageUrl] = useState<string>(product.image || '');
  
  // Gallery removes the first element since index 0 is always the Main Image
  const initialGallery = (product.images || []).filter((url: string) => url !== product.image);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialGallery);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'main' | 'gallery'>('main');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    const res = await createQuickCategory(newCategoryName);
    
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-brand-dark p-6 rounded-md border border-white/5 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">Update Main Image</label>
              {mainImageUrl ? (
                <div className="relative w-32 h-32 rounded-md overflow-hidden border border-white/10 group">
                  <img src={mainImageUrl} alt="Main" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setMainImageUrl('')} className="absolute top-2 right-2 p-1 bg-red-500/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <button type="button" onClick={() => { setMediaTarget('main'); setIsMediaModalOpen(true); }} className="w-fit px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-md text-xs font-bold uppercase tracking-widest transition-colors flex items-center shrink-0">
                    <ImageIcon className="w-4 h-4 mr-2" /> Browse Library
                  </button>
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">OR</span>
                  <input type="file" name="mainImage" accept="image/*" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors cursor-pointer" />
                </div>
              )}
              <input type="hidden" name="mediaMainImage" value={mainImageUrl} />
            </div>

            <div className="bg-brand-dark p-6 rounded-md border border-white/5 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">Update Gallery Images</label>
              {galleryUrls.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {galleryUrls.map(url => (
                    <div key={url} className="relative w-16 h-16 rounded-md overflow-hidden border border-white/10 group">
                      <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setGalleryUrls(prev => prev.filter(u => u !== url))} className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-4">
                <button type="button" onClick={() => { setMediaTarget('gallery'); setIsMediaModalOpen(true); }} className="w-fit px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-md text-xs font-bold uppercase tracking-widest transition-colors flex items-center shrink-0">
                  <ImageIcon className="w-4 h-4 mr-2" /> Browse Library
                </button>
                <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">OR</span>
                <input type="file" name="galleryImages" accept="image/*" multiple className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors cursor-pointer" />
              </div>
              <input type="hidden" name="mediaGalleryImages" value={JSON.stringify(galleryUrls)} />
            </div>

          </div>

          <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md disabled:opacity-50 hover:bg-brand-hover transition-colors flex items-center justify-center">
            {isSubmitting ? 'Saving...' : 'Update Product'}
          </button>
        </form>
      </div>

      {/* Embedded Media Library Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-brand-card w-full max-w-5xl h-[85vh] rounded-md border border-white/10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h3 className="font-display text-xl uppercase tracking-widest text-white">
                {mediaTarget === 'main' ? 'Select Main Image' : 'Select Gallery Images'}
              </h3>
              <button type="button" onClick={() => setIsMediaModalOpen(false)} className="p-2 hover:bg-white/10 rounded-md transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {initialMedia.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm uppercase tracking-widest font-bold">
                  No media found. Upload some from the Admin Dashboard first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {initialMedia.map((m: any) => {
                    const isSelected = mediaTarget === 'main' 
                      ? mainImageUrl === m.url 
                      : galleryUrls.includes(m.url);
                    return (
                      <div 
                        key={m.id} 
                        onClick={() => {
                          if (mediaTarget === 'main') {
                            setMainImageUrl(m.url);
                            setIsMediaModalOpen(false);
                          } else {
                            setGalleryUrls(prev => 
                              prev.includes(m.url) ? prev.filter(url => url !== m.url) : [...prev, m.url]
                            );
                          }
                        }}
                        className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-brand-primary' : 'border-transparent hover:border-white/30'}`}
                      >
                        <img src={m.url} alt={m.fileName} loading="lazy" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                            <CheckCircle className="w-8 h-8 text-brand-primary drop-shadow-md" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {mediaTarget === 'gallery' && (
              <div className="p-4 border-t border-white/10 shrink-0 flex justify-between items-center bg-brand-dark rounded-b-md">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{galleryUrls.length} selected</span>
                <button type="button" onClick={() => setIsMediaModalOpen(false)} className="bg-brand-primary text-black px-6 py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-colors">
                  Confirm Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}