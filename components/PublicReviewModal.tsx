// components/PublicReviewModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, ImagePlus, Loader2, CheckCircle, Camera } from 'lucide-react';
import Image from 'next/image';
import { generateReviewUploadUrl, submitPublicReview } from '@/app/actions/public-reviews';

async function convertToWebpMemorySafe(file: File, maxDim = 800, quality = 0.8): Promise<File> {
  let imageSource: CanvasImageSource | null = null;
  try { imageSource = await createImageBitmap(file); } catch (err) { return file; }
  let width = imageSource.width, height = imageSource.height;
  if (width > maxDim || height > maxDim) {
    if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; } 
    else { width = Math.round((width * maxDim) / height); height = maxDim; }
  }
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(imageSource, 0, 0, width, height);
  if ('close' in imageSource && typeof (imageSource as any).close === 'function') (imageSource as any).close();
  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  canvas.width = 0; canvas.height = 0;
  if (!webpBlob) return file;
  return new File([webpBlob], 'review.webp', { type: 'image/webp' });
}

export function PublicReviewModal({ isOpen, onClose, productId, productName }: { isOpen: boolean; onClose: () => void; productId?: string; productName?: string; }) {
  const [formData, setFormData] = useState({ name: '', location: '', text: '', rating: 5 });
  
  // PREVIEW STATES
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [reviewPreviews, setReviewPreviews] = useState<string[]>([]);
  
  // BACKGROUND UPLOADED URL STATES
  const [uploadedProfileUrl, setUploadedProfileUrl] = useState<string | undefined>(undefined);
  const [uploadedReviewUrls, setUploadedReviewUrls] = useState<string[]>([]);
  
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Utility to compress and upload a single file
  const uploadSingleFile = async (file: File) => {
    try {
      const webpFile = await convertToWebpMemorySafe(file);
      const urlRes = await generateReviewUploadUrl();
      if (urlRes.success && urlRes.uploadUrl) {
        await fetch(urlRes.uploadUrl, { method: 'PUT', body: webpFile, headers: { 'Content-Type': 'image/webp' }});
        return urlRes.publicUrl;
      }
    } catch (err) { console.error("Upload failed", err); }
    return null;
  };

  // ⚡ BACKGROUND UPLOAD: Profile
  const handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProfilePreview(URL.createObjectURL(file)); // Show preview instantly
      setIsUploadingMedia(true);
      
      const url = await uploadSingleFile(file); // Upload silently
      if (url) setUploadedProfileUrl(url);
      
      setIsUploadingMedia(false);
    }
  };

  // ⚡ BACKGROUND UPLOAD: Multiple Review Images (Concurrent)
  const handleReviewImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 3); // Changed limit to 3!
      setReviewPreviews(filesArray.map(f => URL.createObjectURL(f))); // Show all previews instantly
      setIsUploadingMedia(true);
      
      // Promise.all compresses and uploads all 3 images at the exact same time
      const urls = await Promise.all(filesArray.map(f => uploadSingleFile(f)));
      
      // Filter out any failed uploads and save the clean array of URLs
      setUploadedReviewUrls(urls.filter(Boolean) as string[]);
      setIsUploadingMedia(false);
    }
  };

  // Remove Handlers
  const handleRemoveReviewImage = (idxToRemove: number) => {
    setReviewPreviews(prev => prev.filter((_, idx) => idx !== idxToRemove));
    setUploadedReviewUrls(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // INSTANT SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Because the images were uploaded while the user typed, we just pass the URLs!
    const res = await submitPublicReview({
      ...formData,
      productId,
      productName,
      profile: uploadedProfileUrl,
      reviewImage: uploadedReviewUrls.length > 0 ? uploadedReviewUrls.join(',') : undefined
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', location: '', text: '', rating: 5 });
        setProfilePreview(null); setUploadedProfileUrl(undefined);
        setReviewPreviews([]); setUploadedReviewUrls([]);
        onClose();
      }, 3000);
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-brand-card border border-white/10 shadow-2xl rounded-xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-brand-dark shrink-0">
              <h3 className="font-display text-xl uppercase tracking-widest text-white">Share Your Experience</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            {isSuccess ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-16 h-16 text-brand-primary mb-4" />
                <h4 className="text-white font-display text-2xl uppercase tracking-widest mb-2">Thank You</h4>
                <p className="text-gray-400 text-sm">Your review has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                
                {productName && (
                  <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-md p-3">
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Reviewing Product</p>
                    <p className="text-sm font-medium text-white">{productName}</p>
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  <div className="shrink-0 relative group">
                     <label className="flex items-center justify-center w-16 h-16 rounded-full border border-dashed border-white/30 hover:border-brand-primary bg-black cursor-pointer overflow-hidden transition-colors">
                        {profilePreview ? (
                          <Image src={profilePreview} alt="Profile" fill className="object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-gray-500 group-hover:text-brand-primary" />
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfileChange} />
                     </label>
                     {profilePreview && (
                        <button type="button" onClick={(e) => { e.preventDefault(); setProfilePreview(null); setUploadedProfileUrl(undefined); }} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 z-10 hover:bg-red-600 transition-colors">
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                     )}
                     <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">Profile (Opt)</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary" placeholder="Your Name *" />
                    </div>
                    <div>
                      <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary" placeholder="Your Location *" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className="focus:outline-none hover:scale-110 transition-transform">
                        <Star className={`h-8 w-8 transition-colors ${star <= formData.rating ? 'fill-brand-primary text-brand-primary' : 'text-white/10 fill-white/5'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block flex justify-between">
                    <span>Product Photos (Max 3)</span>
                  </label>
                  {reviewPreviews.length > 0 ? (
                    <div className="flex gap-2 h-24">
                      {reviewPreviews.map((preview, idx) => (
                        <div key={idx} className="relative flex-1 rounded-md overflow-hidden border border-white/20 bg-black">
                          <Image src={preview} alt={`Preview ${idx+1}`} fill className="object-cover" />
                          <button type="button" onClick={() => handleRemoveReviewImage(idx)} className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-red-500 transition-colors"><X className="w-3 h-3 text-white" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-20 bg-brand-dark border border-dashed border-white/20 hover:border-brand-primary rounded-md cursor-pointer transition-colors group">
                      <ImagePlus className="w-5 h-5 mb-1.5 text-gray-500 group-hover:text-brand-primary transition-colors" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Photos</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleReviewImagesChange} />
                    </label>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Review</label>
                  <textarea required rows={4} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary resize-none" placeholder="What did you think about our service or products?" />
                </div>

                

                <button 
                  type="submit" 
                  disabled={isSubmitting || isUploadingMedia} 
                  className={`w-full h-12 text-black font-bold uppercase tracking-widest text-xs rounded-md transition-colors mt-2 flex items-center justify-center ${isUploadingMedia || isSubmitting ? 'bg-brand-hover cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-hover'}`}
                >
                  {isUploadingMedia ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading Media...</>
                  ) : isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                  ) : 'Submit Review'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}