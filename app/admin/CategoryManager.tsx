// app/admin/CategoryManager.tsx
'use client';

import React, { useState } from 'react';
import { X, Trash2, Tag, Upload, FolderPlus, Edit, CheckCircle } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from './actions';

export default function CategoryManager({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(categories);

  // Edit Mode State
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
    let res;

    if (editSlug) {
      res = await updateCategory(editSlug, formData);
    } else {
      res = await createCategory(formData);
    }
    
    if (res.success && res.category) {
      if (editSlug) {
        // Update existing item in the list
        setList(list.map(c => c.slug === editSlug ? { ...c, name: res.category.name, label: formData.get('label') } : c));
      } else {
        // Add new item to the list
        setList([...list, { slug: res.category.slug, name: res.category.name, label: formData.get('label') }]);
      }
      handleCancelEdit(); // Reset form state
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
        className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors whitespace-nowrap bg-transparent border-none p-0 cursor-pointer"
      >
        <Tag className="w-4 h-4 mr-2" /> Categories
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-card w-full max-w-md rounded-md border border-white/10 p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-display text-xl uppercase">
                {editSlug ? 'Edit Category' : 'Manage Categories'}
              </h3>
              <button onClick={() => { setIsOpen(false); handleCancelEdit(); }}><X className="w-5 h-5 hover:text-brand-primary transition-colors" /></button>
            </div>
            
            {/* Full Form for Category Creation / Updating */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 shrink-0 bg-brand-dark p-4 rounded-md border border-white/5 relative">
              
              <input 
                type="text" 
                name="name" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required 
                placeholder="Category Name (e.g. Men's Shoes)" 
                className="w-full bg-brand-dark px-3 py-2 rounded-md border border-white/10 outline-none focus:border-brand-primary text-sm" 
              />
              
              <input 
                type="text" 
                name="label" 
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                required 
                placeholder="Marketing Label (e.g. Trending Now)" 
                className="w-full bg-brand-dark px-3 py-2 rounded-md border border-white/10 outline-none focus:border-brand-primary text-sm" 
              />
              
              {/* Span is now hidden from the UI to keep it clean */}
              <input type="hidden" name="span" value="md:col-span-2" />

              <div className="border border-white/10 p-3 rounded-md flex items-center">
                <Upload className="w-4 h-4 mr-2 text-gray-400" />
                <input 
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  required={!editSlug} // Only required when creating a NEW category
                  className="text-xs text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer w-full" 
                />
              </div>
              {editSlug && <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Leave image blank to keep current image</p>}
              
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-brand-primary text-black px-4 py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center">
                  {loading ? 'Saving...' : editSlug ? <><CheckCircle className="w-4 h-4 mr-2"/> Update</> : <><FolderPlus className="w-4 h-4 mr-2"/> Add Category</>}
                </button>
                
                {editSlug && (
                  <button type="button" onClick={handleCancelEdit} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-md font-bold text-xs uppercase tracking-widest transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* List of Existing Categories */}
            <div className="space-y-2 overflow-auto scrollbar-hide flex-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Existing Categories</h4>
              {list.map(c => (
                <div key={c.slug} className={`flex justify-between items-center p-3 rounded-md border transition-colors ${editSlug === c.slug ? 'bg-white/10 border-brand-primary' : 'bg-brand-dark border-white/5'}`}>
                  <span className="text-sm font-medium">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditClick(c)} className="text-blue-400 hover:text-blue-300 transition-colors p-1" title="Edit">
                      <Edit className="w-4 h-4"/>
                    </button>
                    <button onClick={() => handleDelete(c.slug)} className="text-red-400 hover:text-red-300 transition-colors p-1" title="Delete">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}