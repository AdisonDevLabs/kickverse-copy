// app/admin/products/new/NewFormClient.tsx
'use client';

import React, { useState } from 'react';
import { createProduct, createQuickCategory } from '../../actions';
import { CheckCircle, ArrowLeft, Plus, X, Image as ImageIcon, GripHorizontal } from 'lucide-react';
import Link from 'next/link';

type ProductImage = {
  id: string; // Unique local ID for dragging
  url: string; // Display URL
  source: 'library' | 'file';
  file?: File;
  mediaId?: string; // ID to delete from mediaAssets once published
};

export default function NewFormClient({ initialCategories, initialMedia, productTypes }: { initialCategories: any[], initialMedia: any[], productTypes: readonly string[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Category State
  const [activeCategories, setActiveCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(initialCategories[0]?.name || '');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Unified Image State
  const [selectedImages, setSelectedImages] = useState<ProductImage[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Media Library State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [tempLibrarySelection, setTempLibrarySelection] = useState<any[]>([]);

  // Category Handlers
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

  // Image Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      source: 'file' as const,
      file
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
    e.target.value = ''; // reset input
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Drag and Drop Logic
  const onDragStart = (idx: number) => setDraggedIdx(idx);
  
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const items = [...selectedImages];
    const draggedItem = items[draggedIdx];
    items.splice(draggedIdx, 1);
    items.splice(idx, 0, draggedItem);
    setDraggedIdx(idx);
    setSelectedImages(items);
  };

  const onDragEnd = () => setDraggedIdx(null);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      alert("Please add at least one product image.");
      return;
    }
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    formData.set('category', selectedCategory); 
    
    // Build layout array to dictate order and identify files vs library urls
    const imageLayout: any[] = [];
    let fileIndex = 0;

    selectedImages.forEach((img) => {
      if (img.source === 'library') {
        imageLayout.push({ type: 'library', url: img.url, mediaId: img.mediaId });
      } else if (img.source === 'file' && img.file) {
        imageLayout.push({ type: 'file', fileIndex });
        formData.append('imageFiles', img.file);
        fileIndex++;
      }
    });

    formData.set('imageLayout', JSON.stringify(imageLayout));
    
    const response = await createProduct(formData);
    
    setStatus({
      success: response.success,
      message: response.success ? response.message : response.error
    });
    
    if (response.success) {
      (e.target as HTMLFormElement).reset();
      setSelectedImages([]);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="h-full w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col overflow-hidden">
      <div className="shrink-0 mb-6">
        <Link href="/admin" className="text-brand-primary text-sm flex items-center mb-4 w-fit hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl sm:text-4xl uppercase tracking-wide text-white">Add New Product</h1>
      </div>

      {status && (
        <div className={`shrink-0 p-4 rounded-md mb-6 ${status.success ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
          {status.success && <CheckCircle className="w-5 h-5 inline mr-2" />}
          {status.message}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto scrollbar-hide bg-brand-card rounded-md border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Product Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Product Name</label>
              <input type="text" name="name" required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors" />
            </div>

            {/* 2. NEW: Product Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Product Type</label>
              <select 
                name="productType" 
                className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors appearance-none cursor-pointer"
              >
                {productTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 3. Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Collection / Brand</label>
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)} 
                    placeholder="e.g. Air Max" 
                    className="flex-1 bg-brand-dark border border-brand-primary rounded-md px-4 py-3 text-white focus:outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={handleAddCategory} disabled={isSavingCategory} className="px-4 bg-brand-primary text-black font-bold text-[10px] uppercase tracking-widest rounded-md hover:bg-brand-hover transition-colors">
                    {isSavingCategory ? '...' : 'Save'}
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
                  <button type="button" onClick={() => setIsAddingCategory(true)} className="px-3 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-md transition-colors flex items-center shrink-0 border border-white/10">
                    <Plus className="w-3 h-3 mr-1" /> New
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Selling Price (Ksh)</label>
              <input type="number" name="price" defaultValue="3500" required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Original Price (Optional)</label>
              <input type="number" name="originalPrice" className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Sizes (Comma separated)</label>
              <input type="text" name="sizes" defaultValue="39, 40, 41, 42, 43, 44" placeholder="e.g. 39, 40, 41, 42" required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Colors (Comma separated)</label>
              <input type="text" name="colors" placeholder="e.g. Black, White/Gum" required className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-white/5">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isNewArrival" className="w-5 h-5 accent-brand-primary bg-brand-dark border-white/10 transition-colors" />
              <span className="text-sm font-bold uppercase tracking-widest text-white">New Arrival</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isBestSeller" className="w-5 h-5 accent-brand-primary bg-brand-dark border-white/10 transition-colors" />
              <span className="text-sm font-bold uppercase tracking-widest text-white">Best Seller</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isFlashDeal" className="w-5 h-5 accent-brand-primary bg-brand-dark border-white/10 transition-colors" />
              <span className="text-sm font-bold uppercase tracking-widest text-white">Flash Deal</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description (Optional)</label>
            <textarea name="description" rows={4} className="w-full bg-brand-dark border border-white/10 rounded-md px-4 py-3 text-white focus:border-brand-primary outline-none transition-colors"></textarea>
          </div>

          {/* Unified Product Images Uploader */}
          <div className="bg-brand-dark p-6 rounded-md border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Images</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setTempLibrarySelection([]);
                    setIsMediaModalOpen(true);
                  }} 
                  className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center"
                >
                  <ImageIcon className="w-4 h-4 mr-2" /> Browse Library
                </button>
                <label className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" /> Upload Files
                  <input type="file" multiple accept="image/jpeg, image/png, image/webp, image/jpg" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
            </div>

            {selectedImages.length === 0 ? (
              <div className="border-2 border-dashed border-white/10 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:border-brand-primary/50 transition-colors">
                <ImageIcon className="w-12 h-12 text-gray-500 mb-3" />
                <p className="text-sm font-bold text-gray-300 mb-1">Add Product Images</p>
                <p className="text-xs text-gray-500 max-w-sm">Upload multiple images at once. The first image will be used as the main product image.</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                  <GripHorizontal className="w-3 h-3 mr-1" /> Drag to reorder. The first image is your main product image.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {selectedImages.map((img, idx) => (
                    <div 
                      key={img.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={onDragEnd}
                      className={`relative aspect-square rounded-md overflow-hidden cursor-move border-2 transition-all ${idx === 0 ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-[0_0_15px_rgba(var(--brand-primary),0.3)]' : 'border-white/10 hover:border-white/30'} ${draggedIdx === idx ? 'opacity-50 scale-95' : 'opacity-100'}`}
                    >
                      <img src={img.url} alt="Product" className="w-full h-full object-cover pointer-events-none" />
                      
                      {/* Main Image Badge */}
                      {idx === 0 && (
                        <div className="absolute bottom-0 inset-x-0 bg-brand-primary text-black text-[10px] font-bold text-center py-1.5 uppercase tracking-widest">
                          ★ Main Image
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)} 
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-md shadow-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-brand-primary text-black font-bold uppercase tracking-widest rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center mt-6">
            {isSubmitting ? 'Uploading & Publishing...' : 'Publish Product'}
          </button>
        </form>
      </div>

      {/* Embedded Media Library Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-brand-card w-full max-w-5xl h-[85vh] rounded-md border border-white/10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h3 className="font-display text-xl uppercase tracking-widest text-white">
                Select Images from Library
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
                    const isSelected = tempLibrarySelection.some(selected => selected.id === m.id);
                    return (
                      <div 
                        key={m.id} 
                        onClick={() => {
                          setTempLibrarySelection(prev => 
                            isSelected ? prev.filter(item => item.id !== m.id) : [...prev, m]
                          );
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

            <div className="p-4 border-t border-white/10 shrink-0 flex justify-between items-center bg-brand-dark rounded-b-md">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{tempLibrarySelection.length} selected</span>
              <button 
                type="button" 
                onClick={() => {
                  const mapped = tempLibrarySelection.map(m => ({
                    id: Math.random().toString(36).substring(2, 9),
                    url: m.url,
                    source: 'library' as const,
                    mediaId: m.id
                  }));
                  setSelectedImages(prev => [...prev, ...mapped]);
                  setIsMediaModalOpen(false);
                }} 
                className="bg-brand-primary text-black px-6 py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-colors"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}