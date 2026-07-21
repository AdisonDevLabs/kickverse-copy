// app/admin/components/MediaManager.tsx
'use client';

import React, { useState, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, CheckCircle, Loader2, XCircle, ImagePlus } from 'lucide-react';
import { generatePresignedUrls, saveMediaAssetsToDb } from '../media-actions';

type FileStatus = {
  name: string;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'failed';
};

export default function MediaManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);

  // Calculate a smooth, accurate overall progress based on exact individual file progresses
  const overallProgress = useMemo(() => {
    if (fileStatuses.length === 0) return 0;
    const totalProgressSum = fileStatuses.reduce((acc, file) => {
      if (file.status === 'completed') return acc + 100;
      if (file.status === 'failed') return acc + 100; // Count failed as "done" for progress bar purposes
      if (file.status === 'compressing') return acc + 10; // Compression represents 10% of the work
      return acc + (10 + (file.progress * 0.9)); // Upload represents 90% of the work
    }, 0);
    return Math.round(totalProgressSum / fileStatuses.length);
  }, [fileStatuses]);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileArray = Array.from(files);
    
    setFileStatuses(fileArray.map(f => ({
      name: f.name,
      progress: 0,
      status: 'pending'
    })));
    
    try {
      setStatusText('Compressing images...');
      const compressionOptions = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFiles = await Promise.all(
        fileArray.map(async (file, index) => {
          setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'compressing' } : fs));
          const compressed = await imageCompression(file, compressionOptions);
          return compressed;
        })
      );

      setStatusText('Requesting secure links...');
      const fileNames = compressedFiles.map(f => f.name);
      const urlResponse = await generatePresignedUrls(fileNames);
      
      if (!urlResponse.success || !urlResponse.urls) {
        throw new Error(urlResponse.error || 'Failed to generate upload URLs');
      }

      setStatusText('Uploading to Cloudflare...');
      
      const uploadPromises = compressedFiles.map((file, index) => {
        const targetUrlData = urlResponse.urls![index];
        
        return new Promise<void>((resolve, reject) => {
          setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'uploading' } : fs));
          
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', targetUrlData.uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, progress: percentComplete } : fs));
            }
          };
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'completed', progress: 100 } : fs));
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

      // We use Promise.allSettled so one failed upload doesn't stop the rest
      await Promise.allSettled(uploadPromises);

      setStatusText('Saving to database...');
      const successfulUploads = fileStatuses.map((fs, index) => ({
        fs, urlData: urlResponse.urls![index]
      })).filter(({ fs }) => fs.status !== 'failed');

      if (successfulUploads.length > 0) {
        const assetsToSave = successfulUploads.map(({ urlData }) => ({
          id: urlData.id,
          url: urlData.publicUrl,
          fileName: urlData.fileName
        }));
        await saveMediaAssetsToDb(assetsToSave);
      }
      
      setStatusText(successfulUploads.length === fileArray.length ? 'Upload Complete!' : 'Finished with some errors');
      
      setTimeout(() => {
        setIsUploading(false);
        setStatusText('');
        setFileStatuses([]); 
      }, 4000);

    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
    
    e.target.value = '';
  };

  const hasFailures = fileStatuses.some(f => f.status === 'failed');
  const visibleFiles = fileStatuses.filter(f => f.status !== 'completed');

  return (
    <div className="bg-brand-card border border-white/5 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-8 bg-brand-dark hover:border-brand-primary/50 hover:bg-white/[0.02] transition-all cursor-pointer relative group overflow-hidden">
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleBulkUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        
        {!isUploading && !hasFailures ? (
          <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 text-brand-primary">
              <ImagePlus className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-2">Bulk Upload Media</h3>
            <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">
              Drag & drop up to 200 images here. They will be automatically compressed, optimized, and uploaded to Cloudflare.
            </p>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-xl z-20 pointer-events-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {overallProgress === 100 && !hasFailures ? (
                  <CheckCircle className="w-6 h-6 text-brand-primary mr-3" />
                ) : hasFailures && !isUploading ? (
                  <XCircle className="w-6 h-6 text-red-500 mr-3" />
                ) : (
                  <Loader2 className="w-6 h-6 text-brand-primary mr-3 animate-spin" />
                )}
                <h3 className="font-bold text-sm uppercase tracking-widest text-white">
                  {statusText || (hasFailures ? 'Some uploads failed' : '')}
                </h3>
              </div>
              <span className="text-xl font-display text-brand-primary">{overallProgress}%</span>
            </div>
            
            {/* Cloudflare-style Master Progress Bar */}
            {isUploading && (
              <div className="w-full mb-6 bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-brand-primary relative transition-all duration-200 ease-out" 
                  style={{ width: `${overallProgress}%` }}
                >
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Individual Files Queue */}
            {visibleFiles.length > 0 && (
              <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar border border-white/5 rounded-md p-2 bg-black/20">
                {visibleFiles.map((file, idx) => (
                  <div key={idx} className="w-full bg-brand-dark p-3 rounded border border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-300 truncate max-w-[60%]" title={file.name}>
                      {file.name}
                    </span>
                    
                    <div className="flex items-center gap-3 w-1/3 justify-end">
                      <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${file.status === 'failed' ? 'bg-red-500' : 'bg-brand-primary'}`} 
                          style={{ width: `${file.status === 'compressing' ? 10 : file.progress}%` }}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest w-16 text-right ${file.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                        {file.status === 'failed' ? 'Error' : file.status === 'compressing' ? 'Zipping' : `${file.progress}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {hasFailures && !isUploading && (
               <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-widest text-center">Click anywhere in the dashed area to try again</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}