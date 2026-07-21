// app/admin/components/MediaManager.tsx
'use client';

import React, { useState, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import { CheckCircle, Loader2, XCircle, ImagePlus, RefreshCw } from 'lucide-react';
import { generatePresignedUrls, saveMediaAssetsToDb } from '../media-actions';

type FileStatus = {
  file: File;
  name: string;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
};

const MAX_AUTO_RETRIES = 2;

export default function MediaManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);

  // Calculate smooth overall progress based on individual file states
  const overallProgress = useMemo(() => {
    if (fileStatuses.length === 0) return 0;
    const totalProgressSum = fileStatuses.reduce((acc, file) => {
      if (file.status === 'completed' || file.status === 'failed') return acc + 100;
      if (file.status === 'compressing') return acc + 10;
      return acc + (10 + (file.progress * 0.9));
    }, 0);
    return Math.round(totalProgressSum / fileStatuses.length);
  }, [fileStatuses]);

  // Upload single file with automatic retry logic
  const uploadSingleFile = async (
    file: File, 
    index: number, 
    uploadUrl: string
  ): Promise<boolean> => {
    let attempts = 0;
    
    while (attempts <= MAX_AUTO_RETRIES) {
      try {
        setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'uploading', retryCount: attempts } : fs));
        
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl);
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
              reject(new Error(`HTTP ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(file);
        });

        return true; // Success!
      } catch (err) {
        attempts++;
        if (attempts <= MAX_AUTO_RETRIES) {
          // Reset file progress and wait 1s before retrying
          setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, progress: 0, status: 'uploading', retryCount: attempts } : fs));
          await new Promise(r => setTimeout(r, 1000));
        } else {
          setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'failed' } : fs));
          return false;
        }
      }
    }
    return false;
  };

  const processAndUpload = async (filesToProcess: { file: File; index: number }[]) => {
    setIsUploading(true);

    try {
      // 1. Compression
      setStatusText(`Compressing ${filesToProcess.length} image(s)...`);
      const compressionOptions = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedItems = await Promise.all(
        filesToProcess.map(async ({ file, index }) => {
          setFileStatuses(prev => prev.map((fs, i) => i === index ? { ...fs, status: 'compressing' } : fs));
          const compressed = await imageCompression(file, compressionOptions);
          return { compressed, index, originalName: file.name };
        })
      );

      // 2. Request Presigned URLs
      setStatusText('Requesting secure links...');
      const fileNames = compressedItems.map(item => item.originalName);
      const urlResponse = await generatePresignedUrls(fileNames);

      if (!urlResponse.success || !urlResponse.urls) {
        throw new Error(urlResponse.error || 'Failed to generate upload URLs');
      }

      // 3. Upload to Cloudflare R2 with Auto-Retry
      setStatusText('Uploading to Cloudflare...');
      
      const uploadPromises = compressedItems.map((item, urlIdx) => {
        const urlData = urlResponse.urls![urlIdx];
        return uploadSingleFile(item.compressed, item.index, urlData.uploadUrl).then(success => ({
          success,
          urlData
        }));
      });

      const results = await Promise.all(uploadPromises);

      // 4. Save successful uploads to DB
      setStatusText('Saving to database...');
      const successfulAssets = results
        .filter(r => r.success)
        .map(r => ({
          id: r.urlData.id,
          url: r.urlData.publicUrl,
          fileName: r.urlData.fileName,
        }));

      if (successfulAssets.length > 0) {
        await saveMediaAssetsToDb(successfulAssets);
      }

      const failedCount = results.filter(r => !r.success).length;
      if (failedCount > 0) {
        setStatusText(`${failedCount} upload(s) failed after retries`);
      } else {
        setStatusText('Upload Complete!');
        setTimeout(() => {
          setIsUploading(false);
          setStatusText('');
          setFileStatuses([]);
        }, 3000);
      }

    } catch (error: any) {
      alert(`Upload error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Initialize file status queue with file references
    const initialStatuses: FileStatus[] = fileArray.map(f => ({
      file: f,
      name: f.name,
      progress: 0,
      status: 'pending',
      retryCount: 0,
    }));

    setFileStatuses(initialStatuses);

    const filesToProcess = fileArray.map((file, index) => ({ file, index }));
    await processAndUpload(filesToProcess);

    e.target.value = '';
  };

  // Manual trigger to retry only remaining failed files
  const handleRetryFailed = async () => {
    const failedItems = fileStatuses
      .map((fs, index) => ({ file: fs.file, index, status: fs.status }))
      .filter(item => item.status === 'failed');

    if (failedItems.length === 0) return;

    await processAndUpload(failedItems);
  };

  const hasFailures = fileStatuses.some(f => f.status === 'failed');
  const visibleFiles = fileStatuses.filter(f => f.status !== 'completed');

  return (
    <div className="bg-brand-card border border-white/5 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-8 bg-brand-dark hover:border-brand-primary/50 hover:bg-white/[0.02] transition-all relative group overflow-hidden">
        
        {/* File input layer is disabled/pointer-events-none when queue is active so it won't block scrolling */}
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleBulkUpload}
          disabled={isUploading || fileStatuses.length > 0}
          className={`absolute inset-0 w-full h-full opacity-0 ${isUploading || fileStatuses.length > 0 ? 'pointer-events-none' : 'cursor-pointer z-10'}`}
        />
        
        {fileStatuses.length === 0 ? (
          <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 text-brand-primary">
              <ImagePlus className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-2">Bulk Upload Media</h3>
            <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">
              Drag & drop images here. Automated retries are enabled for network interruptions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-xl z-20 pointer-events-auto">
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
            
            {/* Master Progress Bar */}
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

            {/* Scrollable File List Queue - Pointer events enabled */}
            {visibleFiles.length > 0 && (
              <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar border border-white/5 rounded-md p-2 bg-black/20 pointer-events-auto">
                {visibleFiles.map((file, idx) => (
                  <div key={idx} className="w-full bg-brand-dark p-3 rounded border border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-300 truncate max-w-[50%]" title={file.name}>
                      {file.name}
                    </span>
                    
                    <div className="flex items-center gap-3 w-1/2 justify-end">
                      <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${file.status === 'failed' ? 'bg-red-500' : 'bg-brand-primary'}`} 
                          style={{ width: `${file.status === 'compressing' ? 10 : file.progress}%` }}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest min-w-[70px] text-right ${file.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                        {file.status === 'failed' 
                          ? 'Failed' 
                          : file.status === 'compressing' 
                          ? 'Zipping' 
                          : file.retryCount > 0 
                          ? `Retry ${file.retryCount}` 
                          : `${file.progress}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Retry Button for Persistent Failures */}
            {hasFailures && !isUploading && (
              <div className="flex items-center justify-between mt-4 pointer-events-auto">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Auto-retries exhausted for failed items.
                </p>
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest flex items-center transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Failed
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}