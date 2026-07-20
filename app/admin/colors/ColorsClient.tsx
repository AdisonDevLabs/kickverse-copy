'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { saveColor, deleteColor } from '../actions';
import { useRouter } from 'next/navigation';

export default function ColorsClient({ initialColors }: { initialColors: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formName, setFormName] = useState('');
  const [formHex, setFormHex] = useState('#ffffff');
  const [loading, setLoading] = useState(false);

  const openNew = () => {
    setFormName(''); setFormHex('#ffffff'); setIsEdit(false); setIsModalOpen(true);
  };

  const openEdit = (color: any) => {
    setFormName(color.colorName); setFormHex(color.hexCode); setIsEdit(true); setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveColor(formName.trim(), formHex, isEdit);
    if (res.success) {
      setIsModalOpen(false);
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete color ${name}?`)) return;
    const res = await deleteColor(name);
    if (res.success) router.refresh();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide text-white mb-2">Color Mapping</h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest">Map string names to visual hex codes.</p>
        </div>
        <button onClick={openNew} className="bg-brand-primary text-black px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Add Color
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {initialColors.map((color) => (
          <div key={color.colorName} className="bg-brand-card border border-white/10 rounded-md p-4 flex flex-col items-center group relative overflow-hidden">
            <div className="w-16 h-16 rounded-full shadow-inner border border-white/20 mb-4" style={{ backgroundColor: color.hexCode }}></div>
            <span className="text-sm font-bold text-white tracking-wide truncate w-full text-center">{color.colorName}</span>
            <span className="text-[10px] text-gray-500 font-mono mt-1">{color.hexCode}</span>
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(color)} className="p-2 bg-white/10 hover:bg-white/30 rounded-md text-white transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(color.colorName)} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-md text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-card border border-white/10 p-6 w-full max-w-md rounded-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-white">{isEdit ? 'Edit Color' : 'New Color'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Color Name (Exact Match)</label>
                <input 
                  type="text" required disabled={isEdit} 
                  value={formName} onChange={e => setFormName(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-white disabled:opacity-50" 
                  placeholder="e.g. Mustard Yellow"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Hex Code</label>
                <div className="flex gap-4">
                  <input 
                    type="color" required 
                    value={formHex} onChange={e => setFormHex(e.target.value)}
                    className="h-12 w-24 bg-transparent rounded cursor-pointer" 
                  />
                  <input 
                    type="text" required 
                    value={formHex} onChange={e => setFormHex(e.target.value)}
                    className="flex-1 bg-brand-dark border border-white/10 rounded-md p-3 text-white uppercase font-mono" 
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-primary text-black h-12 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover mt-4 flex items-center justify-center">
                {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Color</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}