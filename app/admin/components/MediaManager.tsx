// app/admin/components/MediaManager.tsx
'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { generatePresignedUrls, saveMediaAssetsToDb } from '../media-actions';

export default function MediaManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    const fileArray = Array.from(files);
    
    try {
      // 1. Compress Images Client-Side
      setStatusText(`Compressing ${fileArray.length} images...`);
      const compressionOptions = {
        maxSizeMB: 0.3, // Target ~300KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFiles = await Promise.all(
        fileArray.map(async (file, index) => {
          const compressed = await imageCompression(file, compressionOptions);
          setProgress(Math.round(((index + 1) / fileArray.length) * 20)); // First 20% of progress
          return compressed;
        })
      );

      // 2. Get Presigned URLs
      setStatusText('Requesting secure upload links...');
      const fileNames = compressedFiles.map(f => f.name);
      const urlResponse = await generatePresignedUrls(fileNames);
      
      if (!urlResponse.success || !urlResponse.urls) {
        throw new Error(urlResponse.error || 'Failed to generate upload URLs');
      }

      // 3. Upload directly to Cloudflare R2
      setStatusText('Uploading to Cloudflare R2...');
      let uploadedCount = 0;
      
      const uploadPromises = compressedFiles.map(async (file, index) => {
        const targetUrlData = urlResponse.urls![index];
        
        await fetch(targetUrlData.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        uploadedCount++;
        setProgress(20 + Math.round((uploadedCount / compressedFiles.length) * 70)); // Up to 90%
      });

      await Promise.all(uploadPromises);

      // 4. Save Public URLs to D1 Database
      setStatusText('Saving to database...');
      const assetsToSave = urlResponse.urls.map(u => ({
        id: u.id,
        url: u.publicUrl,
        fileName: u.fileName
      }));

      await saveMediaAssetsToDb(assetsToSave);
      
      setProgress(100);
      setStatusText('Upload Complete!');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsUploading(false);
        setStatusText('');
        setProgress(0);
      }, 3000);

    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
    
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="bg-brand-dark border border-white/10 rounded-md p-6">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-md p-8 bg-black/20 hover:border-brand-primary hover:bg-black/40 transition-all cursor-pointer relative">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleBulkUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {!isUploading ? (
          <>
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-1">Bulk Upload Media</h3>
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Drag & drop up to 200 images here. They will be compressed and uploaded instantly.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center w-full max-w-sm">
            {progress === 100 ? (
              <CheckCircle className="w-10 h-10 text-brand-primary mb-3" />
            ) : (
              <Loader2 className="w-10 h-10 text-brand-primary mb-3 animate-spin" />
            )}
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-3">{statusText}</h3>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}