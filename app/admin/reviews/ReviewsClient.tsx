// app/admin/reviews/ReviewsClient.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, XCircle, Trash2, Globe, MessageCircle, Plus, X } from 'lucide-react';
import { approveReview, deleteReview, toggleGlobalReview, addWhatsappReview } from '../review-actions';
import { motion, AnimatePresence } from 'motion/react';

export default function ReviewsClient({ initialReviews, products }: { initialReviews: any[], products: any[] }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  
  // WhatsApp Form State
  const [formData, setFormData] = useState({ name: '', location: '', rating: 5, text: '', productId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingReviews = initialReviews.filter((r) => !r.review.isApproved);
  const publishedReviews = initialReviews.filter((r) => r.review.isApproved);

  const handleApprove = async (id: number, productId: string | null) => {
    setLoadingId(id);
    await approveReview(id, productId);
    setLoadingId(null);
  };

  const handleDelete = async (id: number, productId: string | null) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setLoadingId(id);
    await deleteReview(id, productId);
    setLoadingId(null);
  };

  const handleToggleGlobal = async (id: number, currentStatus: boolean) => {
    setLoadingId(id);
    await toggleGlobalReview(id, currentStatus);
    setLoadingId(null);
  };

  const handleSubmitWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return alert("Please select a product");
    
    setIsSubmitting(true);
    const res = await addWhatsappReview(formData);
    setIsSubmitting(false);
    
    if (res.success) {
      setIsModalOpen(false);
      setFormData({ name: '', location: '', rating: 5, text: '', productId: '' });
      setActiveTab('published');
    } else {
      alert("Error saving review");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-wider text-white">Reviews Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Moderate public submissions and add WhatsApp feedback.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-md flex items-center hover:bg-brand-hover transition-colors"
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Add WhatsApp Review
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'pending' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          Pending Moderation <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{pendingReviews.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('published')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'published' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          Published <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{publishedReviews.length}</span>
        </button>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'pending' ? pendingReviews : publishedReviews).length === 0 ? (
          <div className="col-span-full py-16 text-center border border-white/5 bg-brand-card rounded-md">
            <p className="text-gray-400">No {activeTab} reviews found.</p>
          </div>
        ) : (
          (activeTab === 'pending' ? pendingReviews : publishedReviews).map(({ review, productName, productImage }) => (
            <div key={review.id} className="bg-brand-card border border-white/10 rounded-md p-5 flex flex-col relative overflow-hidden group">
              {/* Product Context */}
              {productName && (
                <div className="flex items-center gap-3 mb-4 bg-black/40 p-2 rounded-md border border-white/5">
                  <div className="w-10 h-10 relative rounded-sm overflow-hidden bg-brand-dark">
                    {productImage && <Image src={productImage} alt={productName} fill className="object-cover" />}
                  </div>
                  <p className="text-xs font-bold text-gray-300 line-clamp-1">{productName}</p>
                </div>
              )}

              {/* Review Info */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest">{review.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{review.location || 'Unknown'} • {review.date}</p>
                </div>
                <div className="flex text-brand-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-300 italic mb-6 flex-1 bg-white/5 p-3 rounded-md">"{review.text}"</p>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                {activeTab === 'pending' ? (
                  <button 
                    disabled={loadingId === review.id}
                    onClick={() => handleApprove(review.id, review.product)}
                    className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black border border-green-500/30 font-bold uppercase tracking-widest text-[10px] py-2 rounded-md transition-colors flex justify-center items-center"
                  >
                    <CheckCircle className="w-3 h-3 mr-1.5" /> Approve
                  </button>
                ) : (
                  <button 
                    disabled={loadingId === review.id}
                    onClick={() => handleToggleGlobal(review.id, review.isGlobal)}
                    className={`flex-1 border font-bold uppercase tracking-widest text-[10px] py-2 rounded-md transition-colors flex justify-center items-center ${review.isGlobal ? 'bg-brand-primary text-black border-brand-primary' : 'bg-transparent text-gray-400 border-white/20 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Globe className="w-3 h-3 mr-1.5" /> {review.isGlobal ? 'On Homepage' : 'Feature'}
                  </button>
                )}
                
                <button 
                  disabled={loadingId === review.id}
                  onClick={() => handleDelete(review.id, review.product)}
                  className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-md transition-colors flex justify-center items-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual WhatsApp Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-brand-card border border-white/10 shadow-2xl rounded-md z-10 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-brand-dark">
                <h3 className="font-display text-xl uppercase tracking-widest text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-brand-primary" /> Add WhatsApp Review
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmitWhatsapp} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Select Product</label>
                  <select required value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary">
                    <option value="" disabled>-- Select a Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Customer Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Mike W." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Location</label>
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Nairobi" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className="focus:outline-none">
                        <Star className={`h-8 w-8 transition-colors ${star <= formData.rating ? 'fill-brand-primary text-brand-primary' : 'text-white/10 fill-white/5 hover:text-white/30'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">WhatsApp Message</label>
                  <textarea required rows={4} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary resize-none" placeholder="Paste the exact WhatsApp feedback here..." />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full h-12 bg-brand-primary text-black font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors mt-2 flex items-center justify-center">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Save & Publish'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}