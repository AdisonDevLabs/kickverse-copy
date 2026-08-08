// components/PublicReviewModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, ImagePlus, Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { generateReviewUploadUrl, submitPublicReview } from '@/app/actions/public-reviews';

// Ultra-fast memory-safe client-side WebP compressor
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

export function PublicReviewModal({ 
  isOpen, 
  onClose, 
  productId, 
  productName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  productId?: string; 
  productName?: string; 
}) {
  const [formData, setFormData] = useState({ name: '', text: '', rating: 5 });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalImageUrl = undefined;

    // 1. Handle Image Compression & Upload if a photo is attached
    if (reviewImage) {
      try {
        const webpFile = await convertToWebpMemorySafe(reviewImage);
        const urlRes = await generateReviewUploadUrl();
        
        if (urlRes.success && urlRes.uploadUrl) {
          await fetch(urlRes.uploadUrl, { 
            method: 'PUT', 
            body: webpFile, 
            headers: { 'Content-Type': 'image/webp' }
          });
          finalImageUrl = urlRes.publicUrl;
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    // 2. Save Review to Database
    const res = await submitPublicReview({
      ...formData,
      productId,
      productName,
      reviewImage: finalImageUrl
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', text: '', rating: 5 });
        setReviewImage(null);
        setImagePreview(null);
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
                <h4 className="text-white font-display text-2xl uppercase tracking-widest mb-2">Thank You!</h4>
                <p className="text-gray-400 text-sm">Your review has been submitted successfully and is pending moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                
                {productName && (
                  <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-md p-3">
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Reviewing Product</p>
                    <p className="text-sm font-medium text-white">{productName}</p>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Your Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Brian K." />
                </div>

                <div>
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Review</label>
                  <textarea required rows={4} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full bg-brand-dark border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-brand-primary resize-none" placeholder="What did you think about our service or products?" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block flex justify-between">
                    <span>Add a Photo (Optional)</span>
                  </label>
                  {imagePreview ? (
                    <div className="relative w-full h-32 rounded-md overflow-hidden border border-white/20 group bg-black">
                      <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                      <button type="button" onClick={() => { setReviewImage(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 rounded-full p-1.5 transition-colors"><X className="w-4 h-4 text-white" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 bg-brand-dark border border-dashed border-white/20 hover:border-brand-primary rounded-md cursor-pointer transition-colors group">
                      <ImagePlus className="w-6 h-6 mb-2 text-gray-500 group-hover:text-brand-primary transition-colors" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Photo</span>
                      <input 
                        type="file" accept="image/*" className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setReviewImage(file); setImagePreview(URL.createObjectURL(file)); }
                        }} 
                      />
                    </label>
                  )}
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full h-12 bg-brand-primary text-black font-bold uppercase tracking-widest text-xs rounded-md hover:bg-brand-hover transition-colors mt-2 flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}