// app/admin/components/MediaManager.tsx
'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { generatePresignedUrls, saveMediaAssetsToDb } from '../media-actions';

type FileStatus = {
  name: string;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'failed';
};

export default function MediaManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    const fileArray = Array.from(files);
    
    // Initialize individual tracking statuses
    setFileStatuses(fileArray.map(f => ({
      name: f.name,
      progress: 0,
      status: 'pending'
    })));
    
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
          setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'compressing' } : fs));
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

      // 3. Upload directly to Cloudflare R2 with progress tracking
      setStatusText('Uploading to Cloudflare R2...');
      let uploadedCount = 0;
      
      const uploadPromises = compressedFiles.map((file, index) => {
        const targetUrlData = urlResponse.urls![index];
        
        // Wrap XMLHttpRequest in a Promise to maintain existing flow
        return new Promise<void>((resolve, reject) => {
          setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'uploading' } : fs));
          
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', targetUrlData.uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          
          // Track specific file upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, progress: percentComplete } : fs));
            }
          };
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'completed', progress: 100 } : fs));
              uploadedCount++;
              setProgress(20 + Math.round((uploadedCount / compressedFiles.length) * 70)); // Up to 90%
              resolve();
            } else {
              setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'failed' } : fs));
              reject(new Error(`Upload failed for ${file.name}`));
            }
          };
          
          xhr.onerror = () => {
            setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'failed' } : fs));
            reject(new Error(`Network error for ${file.name}`));
          };
          
          xhr.send(file);
        });
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
        setFileStatuses([]); 
      }, 3000);

    } catch (error: any) {
      // We don't wipe the fileStatuses here so failed items remain visible
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
    
    // Reset file input
    e.target.value = '';
  };

  const hasFailures = fileStatuses.some(f => f.status === 'failed');
  const visibleFiles = fileStatuses.filter(f => f.status !== 'completed');

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
        
        {!isUploading && !hasFailures ? (
          <>
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-1">Bulk Upload Media</h3>
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Drag & drop up to 200 images here. They will be compressed and uploaded instantly.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center w-full max-w-md">
            {progress === 100 && !hasFailures ? (
              <CheckCircle className="w-10 h-10 text-brand-primary mb-3" />
            ) : hasFailures && !isUploading ? (
              <XCircle className="w-10 h-10 text-red-500 mb-3" />
            ) : (
              <Loader2 className="w-10 h-10 text-brand-primary mb-3 animate-spin" />
            )}
            
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-3">
              {statusText || (hasFailures ? 'Some uploads failed' : '')}
            </h3>
            
            {/* Overall Progress Bar */}
            {isUploading && (
              <div className="w-full mb-4">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{progress}% Overall</p>
              </div>
            )}

            {/* Individual Files List (Hides completed automatically) */}
            {visibleFiles.length > 0 && (
              <div className="w-full space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide mt-2">
                {visibleFiles.map((file, idx) => (
                  <div key={idx} className="w-full bg-black/40 p-3 rounded-md border border-white/5 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-white truncate max-w-[200px]" title={file.name}>
                        {file.name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${file.status === 'failed' ? 'text-red-400' : 'text-gray-400'}`}>
                        {file.status === 'failed' ? 'Failed' : file.status === 'compressing' ? 'Compressing...' : `${file.progress}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${file.status === 'failed' ? 'bg-red-500' : 'bg-brand-primary'}`} 
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {hasFailures && !isUploading && (
               <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-widest">Click area to try again</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}