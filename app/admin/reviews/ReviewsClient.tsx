// app/admin/reviews/ReviewsClient.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, Trash2, Globe, MessageCircle, X, Search, Settings, Edit, UploadCloud, Loader2 } from 'lucide-react';
import { approveReview, deleteReview, toggleGlobalReview, addWhatsappReview, updateStoreSettings, updateReview } from '../review-actions';
import { generatePresignedUrls } from '../media-actions';
import { motion, AnimatePresence } from 'motion/react';

// Single-pass WebP converter for the avatar upload
async function convertToWebpMemorySafe(file: File, maxDim = 400, quality = 0.82): Promise<File> {
  const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const webpName = `${originalNameWithoutExt}.webp`;
  
  let imageSource: CanvasImageSource | null = null;
  try {
    imageSource = await createImageBitmap(file);
  } catch (err) {
    return file;
  }

  let width = imageSource.width;
  let height = imageSource.height;
  if (width > maxDim || height > maxDim) {
    if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; } 
    else { width = Math.round((width * maxDim) / height); height = maxDim; }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(imageSource, 0, 0, width, height);
  if ('close' in imageSource && typeof (imageSource as any).close === 'function') (imageSource as any).close();

  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  canvas.width = 0;
  canvas.height = 0;

  if (!webpBlob) return file;
  return new File([webpBlob], webpName, { type: 'image/webp' });
}

export default function ReviewsClient({ initialReviews, products, initialConfig }: { initialReviews: any[], products: any[], initialConfig: any }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'settings'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  
  // Review Form State (handles both Add and Edit)
  const [formData, setFormData] = useState({ name: '', location: '', rating: 5, text: '', productId: '', profile: initialConfig.defaultAvatar });
  const [editId, setEditId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [isProductListOpen, setIsProductListOpen] = useState(false);

  const [configData, setConfigData] = useState(initialConfig);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const pendingReviews = initialReviews.filter((r) => !r.review.isApproved);
  const publishedReviews = initialReviews.filter((r) => r.review.isApproved);

  const selectedProduct = products.find(p => p.id === formData.productId);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  // --- ACTIONS ---

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

  const openEditModal = (reviewItem: any, productName: string) => {
    setEditId(reviewItem.id);
    setFormData({
      name: reviewItem.name,
      location: reviewItem.location || '',
      rating: reviewItem.rating,
      text: reviewItem.text,
      productId: reviewItem.product || '',
      profile: reviewItem.profile || initialConfig.defaultAvatar
    });
    setProductSearch(productName || '');
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: '', location: '', rating: 5, text: '', productId: '', profile: initialConfig.defaultAvatar });
    setProductSearch('');
    setIsModalOpen(true);
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // 1. Compress to WebP
      const webpFile = await convertToWebpMemorySafe(file);
      
      // 2. Generate Cloudflare R2 presigned URL
      const urlResponse = await generatePresignedUrls([webpFile.name]);
      if (!urlResponse.success || !urlResponse.urls) throw new Error("Failed to get upload link");
      
      const { uploadUrl, publicUrl } = urlResponse.urls[0];

      // 3. Upload directly to Cloudflare
      await fetch(uploadUrl, {
        method: 'PUT',
        body: webpFile,
        headers: { 'Content-Type': webpFile.type }
      });

      // 4. Update form data with new image URL
      setFormData(prev => ({ ...prev, profile: publicUrl }));
    } catch (error) {
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --- SUBMIT REVIEW ---
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return alert("Please search and select a product.");
    
    setIsSubmitting(true);
    let res;
    if (editId) {
      res = await updateReview(editId, formData);
    } else {
      res = await addWhatsappReview(formData);
    }
    setIsSubmitting(false);
    
    if (res.success) {
      setIsModalOpen(false);
      setFormData({ name: '', location: '', rating: 5, text: '', productId: '', profile: initialConfig.defaultAvatar });
      setProductSearch('');
      setActiveTab('published');
    } else {
      alert("Error saving review");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    const res = await updateStoreSettings(configData);
    setIsSavingConfig(false);
    if (res.success) alert("Settings updated successfully! The homepage is now live with the new data.");
    else alert("Error saving settings.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-wider text-white">Reviews Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Moderate public submissions and configure storefront display.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-brand-primary text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-md flex items-center hover:bg-brand-hover transition-colors"
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Add WhatsApp Review
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 mb-6 overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'pending' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-white'}`}>
          Pending Moderation <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{pendingReviews.length}</span>
        </button>
        <button onClick={() => setActiveTab('published')} className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'published' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-white'}`}>
          Published <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{publishedReviews.length}</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 flex items-center ${activeTab === 'settings' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-white'}`}>
          <Settings className="w-4 h-4 mr-2" /> Global Settings
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-brand-card border border-white/10 rounded-md p-6">
          <h2 className="text-xl font-display uppercase tracking-widest text-white mb-6 flex items-center"><Settings className="w-5 h-5 mr-2 text-brand-primary" /> Storefront Marketing Data</h2>
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Happy Customers Text</label>
              <input required type="text" value={configData.happyCustomersText} onChange={e => setConfigData({...configData, happyCustomersText: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" />
              <p className="text-[10px] text-gray-500 mt-1">Appears next to the star ratings (e.g., "500+ Happy Customers")</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Fallback Rating</label>
              <input required type="text" value={configData.fallbackRating} onChange={e => setConfigData({...configData, fallbackRating: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Default Avatar URL</label>
              <input required type="text" value={configData.defaultAvatar} onChange={e => setConfigData({...configData, defaultAvatar: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" />
            </div>
            <button type="submit" disabled={isSavingConfig} className="w-full h-12 bg-brand-primary text-black font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors mt-4 flex items-center justify-center">
              {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings to Homepage'}
            </button>
          </form>
        </div>
      )}

      {/* Review Cards Grid */}
      {activeTab !== 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'pending' ? pendingReviews : publishedReviews).length === 0 ? (
            <div className="col-span-full py-16 text-center border border-white/5 bg-brand-card rounded-md"><p className="text-gray-400">No {activeTab} reviews found.</p></div>
          ) : (
            (activeTab === 'pending' ? pendingReviews : publishedReviews).map(({ review, productName, productImage }) => (
              <div key={review.id} className="bg-brand-card border border-white/10 rounded-md p-5 flex flex-col relative overflow-hidden group">
                {productName && (
                  <div className="flex items-center gap-3 mb-4 bg-black/40 p-2 rounded-md border border-white/5">
                    <div className="w-10 h-10 relative rounded-sm overflow-hidden bg-brand-dark">
                      {productImage && <Image src={productImage} alt={productName} fill className="object-cover" />}
                    </div>
                    <p className="text-xs font-bold text-gray-300 line-clamp-1">{productName}</p>
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative rounded-full overflow-hidden bg-brand-dark border border-white/10 shrink-0">
                      <Image src={review.profile || initialConfig.defaultAvatar} alt={review.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-widest">{review.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{review.location || 'Unknown'} • {review.date}</p>
                    </div>
                  </div>
                  <div className="flex text-brand-primary">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />)}
                  </div>
                </div>
                <p className="text-sm text-gray-300 italic mb-6 flex-1 bg-white/5 p-3 rounded-md mt-2">"{review.text}"</p>
                <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                  {activeTab === 'pending' ? (
                    <button disabled={loadingId === review.id} onClick={() => handleApprove(review.id, review.product)} className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black border border-green-500/30 font-bold uppercase tracking-widest text-[10px] py-2 rounded-md transition-colors flex justify-center items-center">
                      <CheckCircle className="w-3 h-3 mr-1.5" /> Approve
                    </button>
                  ) : (
                    <button disabled={loadingId === review.id} onClick={() => handleToggleGlobal(review.id, review.isGlobal)} className={`flex-1 border font-bold uppercase tracking-widest text-[10px] py-2 rounded-md transition-colors flex justify-center items-center ${review.isGlobal ? 'bg-brand-primary text-black border-brand-primary' : 'bg-transparent text-gray-400 border-white/20 hover:bg-white/10 hover:text-white'}`}>
                      <Globe className="w-3 h-3 mr-1.5" /> {review.isGlobal ? 'On Homepage' : 'Feature'}
                    </button>
                  )}
                  <button onClick={() => openEditModal(review, productName)} className="px-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-md transition-colors flex justify-center items-center">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button disabled={loadingId === review.id} onClick={() => handleDelete(review.id, review.product)} className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-md transition-colors flex justify-center items-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Manual / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-brand-card border border-white/10 shadow-2xl rounded-md z-10 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-brand-dark">
                <h3 className="font-display text-xl uppercase tracking-widest text-white flex items-center">
                  {editId ? <Edit className="w-5 h-5 mr-2 text-brand-primary" /> : <MessageCircle className="w-5 h-5 mr-2 text-brand-primary" />}
                  {editId ? 'Edit Review' : 'Add WhatsApp Review'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                
                {/* Profile Image Upload */}
                <div className="flex items-center gap-4 bg-brand-dark p-3 rounded-md border border-white/10">
                  <div className="w-14 h-14 relative rounded-full overflow-hidden bg-black border border-white/20 shrink-0">
                    {isUploadingImage ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Loader2 className="w-5 h-5 animate-spin text-brand-primary" /></div>
                    ) : (
                      <Image src={formData.profile} alt="Avatar" fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Customer Avatar</label>
                    <label className="flex items-center justify-center w-full bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded py-2 cursor-pointer transition-colors">
                      <UploadCloud className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-xs text-gray-300">Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingImage} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Searchable Product Input */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Search Product</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type="text" placeholder="Type shoe name to search..." value={isProductListOpen ? productSearch : (selectedProduct ? selectedProduct.name : productSearch)} onChange={(e) => { setProductSearch(e.target.value); setIsProductListOpen(true); if (formData.productId) setFormData({...formData, productId: ''}); }} onFocus={() => setIsProductListOpen(true)} className="w-full bg-brand-dark border border-white/10 rounded-md pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:border-brand-primary" />
                  </div>
                  {isProductListOpen && (
                    <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-brand-dark border border-white/20 rounded-md shadow-2xl z-50 divide-y divide-white/5">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-xs text-gray-400 text-center uppercase tracking-widest">No matching products found</div>
                      ) : (
                        filteredProducts.map(p => (
                          <div key={p.id} onClick={() => { setFormData({...formData, productId: p.id}); setProductSearch(p.name); setIsProductListOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-brand-primary/20 cursor-pointer transition-colors">
                            {p.image && <div className="w-9 h-9 relative rounded overflow-hidden bg-black shrink-0 border border-white/10"><Image src={p.image} alt={p.name} fill className="object-cover" /></div>}
                            <div className="truncate"><p className="text-xs font-bold text-white truncate">{p.name}</p><p className="text-[9px] text-gray-500 uppercase tracking-widest">{p.id}</p></div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Customer Name</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Mike W." /></div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Location</label><input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Nairobi" /></div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Rating</label>
                  <div className="flex gap-2">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className="focus:outline-none"><Star className={`h-8 w-8 transition-colors ${star <= formData.rating ? 'fill-brand-primary text-brand-primary' : 'text-white/10 fill-white/5 hover:text-white/30'}`} /></button>)}</div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Review Text</label>
                  <textarea required rows={4} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary resize-none" placeholder="Customer feedback here..." />
                </div>

                <button type="submit" disabled={isSubmitting || isUploadingImage} className="w-full h-12 bg-brand-primary text-black font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors mt-2 flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? 'Save Changes' : 'Save & Publish')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}