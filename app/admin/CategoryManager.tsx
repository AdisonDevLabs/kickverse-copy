'use client';

import React, { useState } from 'react';
import { X, Trash2, Tag, Upload, FolderPlus, Edit, CheckCircle } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from './actions';

// ULTRA-FAST, LOW-MEMORY SINGLE-PASS WEBP CONVERTER (Ported from MediaManager)
async function convertToWebpMemorySafe(
  file: File, 
  maxDim = 1920, 
  quality = 0.82
): Promise<File> {
  const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const webpName = `${originalNameWithoutExt}.webp`;
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

  let imageSource: CanvasImageSource | null = null;

  try {
    if (isHeic) {
      // 1. Try Native Browser HEIC Decoding (Ultra-fast on Safari / iOS)
      try {
        imageSource = await createImageBitmap(file);
      } catch {
        // 2. Fallback to heic2any for Chrome/Firefox/Android
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/png' });
        const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        imageSource = await createImageBitmap(singleBlob);
      }
    } else {
      imageSource = await createImageBitmap(file);
    }
  } catch (err) {
    // If bitmap creation fails, return original file as ultimate safety fallback
    return file;
  }

  // Calculate scaled dimensions to fit within maxDim
  let width = imageSource.width;
  let height = imageSource.height;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  // Draw directly onto Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    if ('close' in imageSource && typeof (imageSource as any).close === 'function') {
      (imageSource as any).close();
    }
    return file;
  }

  ctx.drawImage(imageSource, 0, 0, width, height);

  // IMMEDIATELY RELEASE BITMAP RAM MEMORY
  if ('close' in imageSource && typeof (imageSource as any).close === 'function') {
    (imageSource as any).close();
  }

  // Export single-pass WebP Blob
  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));

  // Clear canvas reference to trigger instant Garbage Collection
  canvas.width = 0;
  canvas.height = 0;

  if (!webpBlob) return file;

  return new File([webpBlob], webpName, { type: 'image/webp' });
}

export default function CategoryManager({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(categories);

  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [labelInput, setLabelInput] = useState('');

  const handleEditClick = (cat: any) => {
    setEditSlug(cat.slug);
    setNameInput(cat.name);
    setLabelInput(cat.label || '');
  };

  const handleCancelEdit = () => {
    setEditSlug(null);
    setNameInput('');
    setLabelInput('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get('image') as File;

    // Convert and compress category image using the WebP memory safe pipeline
    if (imageFile && imageFile.size > 0) {
      try {
        const convertedFile = await convertToWebpMemorySafe(imageFile);
        // Replace the raw file in FormData with the compressed WebP file
        formData.set('image', convertedFile);
      } catch (error) {
        console.error('Image compression failed:', error);
      }
    }

    let res;

    if (editSlug) {
      res = await updateCategory(editSlug, formData);
    } else {
      res = await createCategory(formData);
    }

    if (res.success && res.category) {
      if (editSlug) {
        setList(list.map(c => c.slug === editSlug ? { ...c, name: res.category.name, label: formData.get('label') } : c));
      } else {
        setList([...list, { slug: res.category.slug, name: res.category.name, label: formData.get('label') }]);
      }
      handleCancelEdit();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (slug: string) => {
    if (confirm('Delete this category? Products in this category will lose their filter association.')) {
      await deleteCategory(slug);
      setList(list.filter(c => c.slug !== slug));
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors whitespace-nowrap bg-transparent border-none p-0 cursor-pointer h-full"
      >
        <Tag className="w-4 h-4 mr-2" /> Categories
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-brand-card w-full max-w-md rounded-lg border border-white/10 p-6 flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-display text-xl uppercase tracking-wider text-white">
                {editSlug ? 'Edit Category' : 'Manage Categories'}
              </h3>
              <button onClick={() => { setIsOpen(false); handleCancelEdit(); }} className="p-1 rounded-md hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 shrink-0 bg-black/20 p-5 rounded-lg border border-white/5 relative">
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  name="name" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required 
                  placeholder="Category Name (e.g. Men's Shoes)" 
                  className="w-full bg-brand-dark px-4 py-2.5 rounded-md border border-white/10 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm" 
                />
                
                <input 
                  type="text" 
                  name="label" 
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  required 
                  placeholder="Marketing Label (e.g. Trending Now)" 
                  className="w-full bg-brand-dark px-4 py-2.5 rounded-md border border-white/10 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm" 
                />
              </div>
              
              <input type="hidden" name="span" value="md:col-span-2" />

              <div className="border border-dashed border-white/20 p-4 rounded-md flex flex-col items-center justify-center bg-brand-dark hover:bg-white/[0.02] hover:border-brand-primary/50 transition-colors relative cursor-pointer group">
                <Upload className="w-5 h-5 mb-2 text-gray-400 group-hover:text-brand-primary transition-colors" />
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  {editSlug ? 'Click to replace image (Optional)' : 'Click to upload category image'}
                </span>
                <input 
                  type="file" 
                  name="image" 
                  accept="image/jpeg, image/png, image/webp, image/jpg, image/heic, image/heif, .heic, .heif" 
                  required={!editSlug}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-brand-primary text-black px-4 py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  {loading ? (
                    <><CheckCircle className="w-4 h-4 mr-2 animate-pulse"/> Saving...</>
                  ) : editSlug ? (
                    <><CheckCircle className="w-4 h-4 mr-2"/> Update</>
                  ) : (
                    <><FolderPlus className="w-4 h-4 mr-2"/> Add</>
                  )}
                </button>
                
                {editSlug && (
                  <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-md font-bold text-xs uppercase tracking-widest transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col flex-1 min-h-0">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Existing Categories</h4>
              <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {list.map(c => (
                  <div key={c.slug} className={`flex justify-between items-center p-3.5 rounded-lg border transition-all ${editSlug === c.slug ? 'bg-brand-primary/10 border-brand-primary shadow-inner' : 'bg-brand-dark border-white/5 hover:border-white/10'}`}>
                    <span className="text-sm font-medium text-gray-200">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditClick(c)} className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded hover:bg-blue-500/10" title="Edit">
                        <Edit className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleDelete(c.slug)} className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded hover:bg-red-500/10" title="Delete">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}