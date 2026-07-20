// app/admin/size-guides/SizeGuidesClient.tsx

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, ArrowRight, ArrowDown } from 'lucide-react';
import { saveSizeGuide, deleteSizeGuide } from '../actions';
import { useRouter } from 'next/navigation';

export default function SizeGuidesClient({ initialGuides }: { initialGuides: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [headers, setHeaders] = useState<string[]>(['Size', 'Length']);
  const [rows, setRows] = useState<string[][]>([['S', '28'], ['M', '29']]);

  const openNew = () => {
    setFormId(''); setFormName(''); setHeaders(['Col 1', 'Col 2']); setRows([['', '']]);
    setIsEdit(false); setIsModalOpen(true);
  };

  const openEdit = (guide: any) => {
    setFormId(guide.id); setFormName(guide.name); setHeaders(guide.headers); setRows(guide.rows);
    setIsEdit(true); setIsModalOpen(true);
  };

  // Spreadsheet Logic
  const addColumn = () => {
    setHeaders([...headers, `New Col`]);
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (idx: number) => {
    if (headers.length <= 1) return alert("Must have at least one column.");
    setHeaders(headers.filter((_, i) => i !== idx));
    setRows(rows.map(row => row.filter((_, i) => i !== idx)));
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill('')]);
  };

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const updateHeader = (idx: number, val: string) => {
    const newH = [...headers]; newH[idx] = val; setHeaders(newH);
  };

  const updateCell = (rIdx: number, cIdx: number, val: string) => {
    const newR = [...rows]; newR[rIdx][cIdx] = val; setRows(newR);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveSizeGuide(formId.trim(), formName.trim(), headers, rows, isEdit);
    if (res.success) {
      setIsModalOpen(false);
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete size guide ${id}?`)) return;
    const res = await deleteSizeGuide(id);
    if (res.success) router.refresh();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide text-white mb-2">Size Guides</h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest">Build dynamic sizing charts.</p>
        </div>
        <button onClick={openNew} className="bg-brand-primary text-black px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Create Guide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialGuides.map((guide) => (
          <div key={guide.id} className="bg-brand-card border border-white/10 rounded-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-white uppercase tracking-widest text-lg">{guide.name}</h3>
                <span className="text-[10px] text-brand-primary uppercase tracking-widest font-mono">ID: {guide.id}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(guide)} className="p-2 bg-white/5 hover:bg-white/20 rounded-md text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(guide.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-md text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto border border-white/10 rounded-md">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    {guide.headers.map((h: string, i: number) => (
                      <th key={i} className="px-4 py-2 font-bold text-gray-400 uppercase tracking-widest text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {guide.rows.slice(0, 3).map((row: string[], ri: number) => (
                    <tr key={ri} className="text-gray-300 text-xs">
                      {row.map((cell: string, ci: number) => (
                        <td key={ci} className="px-4 py-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                  {guide.rows.length > 3 && (
                    <tr><td colSpan={guide.headers.length} className="px-4 py-2 text-[10px] text-gray-500 italic text-center">+ {guide.rows.length - 3} more rows</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-card border border-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-white">{isEdit ? 'Edit Size Guide' : 'Build Size Guide'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Guide ID (No spaces)</label>
                  <input type="text" required disabled={isEdit} value={formId} onChange={e => setFormId(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-white disabled:opacity-50 text-sm" placeholder="e.g. apparel" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Display Name</label>
                  <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-white text-sm" placeholder="e.g. Tops & T-Shirts" />
                </div>
              </div>

              {/* Dynamic Table Builder */}
              <div className="border border-white/10 rounded-md overflow-hidden bg-brand-dark">
                <div className="flex justify-between items-center bg-white/5 p-4 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-white">Table Editor</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={addColumn} className="flex items-center text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded hover:bg-brand-primary/20"><Plus className="w-3 h-3 mr-1" /> Column</button>
                    <button type="button" onClick={addRow} className="flex items-center text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded hover:bg-brand-primary/20"><Plus className="w-3 h-3 mr-1" /> Row</button>
                  </div>
                </div>
                
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left border-spacing-2 border-separate">
                    <thead>
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="min-w-[120px]">
                            <div className="flex items-center bg-white/5 border border-white/10 rounded p-1">
                              <input type="text" value={h} onChange={e => updateHeader(i, e.target.value)} className="w-full bg-transparent text-xs font-bold uppercase tracking-widest text-white outline-none px-2 py-1" />
                              <button type="button" onClick={() => removeColumn(i)} className="text-gray-500 hover:text-red-500 px-1"><X className="w-3 h-3" /></button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci}>
                              <input type="text" value={cell} onChange={e => updateCell(ri, ci, e.target.value)} className="w-full bg-brand-card border border-white/5 hover:border-white/20 focus:border-brand-primary rounded p-2 text-sm text-gray-300 outline-none transition-colors" placeholder="..." />
                            </td>
                          ))}
                          <td className="w-10">
                            <button type="button" onClick={() => removeRow(ri)} className="text-gray-500 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-brand-primary text-black h-14 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover mt-4 flex items-center justify-center">
                {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Size Guide</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}