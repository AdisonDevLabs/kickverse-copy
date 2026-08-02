// app/admin/components/MediaManager.tsx
'use client';

import React, { useState, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import { CheckCircle, Loader2, XCircle, ImagePlus, RefreshCw, X } from 'lucide-react';
import { generatePresignedUrls, saveMediaAssetsToDb } from '../media-actions';

type FileStatus = {
  file: File;
  name: string;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
};

const MAX_AUTO_RETRIES = 2;
const BATCH_SIZE = 4; // Safely process 4 images at a time to prevent browser crashes & CF limits

export default function MediaManager() {
  const [isOpen, setIsOpen] = useState(false);
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

        return true; 
      } catch (err) {
        attempts++;
        if (attempts <= MAX_AUTO_RETRIES) {
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
    const totalBatches = Math.ceil(filesToProcess.length / BATCH_SIZE);

    try {
      // Process files in sequential chunks to avoid memory spikes and API limits
      for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
        const currentBatchNum = Math.floor(i / BATCH_SIZE) + 1;
        const batch = filesToProcess.slice(i, i + BATCH_SIZE);
        
        setStatusText(`Batch ${currentBatchNum}/${totalBatches}: Compressing to WebP...`);

        const compressionOptions = {
          maxSizeMB: 0.3, // Maximum 300KB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp', // Force standard formats to highly optimized WebP
          initialQuality: 0.85
        };

        const compressedItems = await Promise.all(
          batch.map(async ({ file, index }) => {
            setFileStatuses(prev => prev.map((fs, idx) => idx === index ? { ...fs, status: 'compressing' } : fs));
            
            // Compress and transcode
            const compressedBlob = await imageCompression(file, compressionOptions as any);
            
            // Reconstruct as a WebP File object
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const webpFileName = `${baseName}.webp`;
            
            const compressedFile = new File([compressedBlob], webpFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            return { compressed: compressedFile, index, originalName: webpFileName };
          })
        );

        setStatusText(`Batch ${currentBatchNum}/${totalBatches}: Securing upload links...`);
        const fileNames = compressedItems.map(item => item.originalName);
        const urlResponse = await generatePresignedUrls(fileNames);

        if (!urlResponse.success || !urlResponse.urls) {
          // If URL generation fails, mark this specific batch as failed and continue to next
          setFileStatuses(prev => prev.map((fs, idx) => batch.some(b => b.index === idx) ? { ...fs, status: 'failed' } : fs));
          continue;
        }

        setStatusText(`Batch ${currentBatchNum}/${totalBatches}: Uploading to Edge...`);
        const uploadPromises = compressedItems.map((item, urlIdx) => {
          const urlData = urlResponse.urls![urlIdx];
          return uploadSingleFile(item.compressed, item.index, urlData.uploadUrl).then(success => ({
            success,
            urlData
          }));
        });

        const results = await Promise.all(uploadPromises);

        setStatusText(`Batch ${currentBatchNum}/${totalBatches}: Saving records...`);
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
      } // End of batch loop

      // Final status check after all batches complete
      setFileStatuses(prev => {
        const failedCount = prev.filter(f => f.status === 'failed').length;
        if (failedCount > 0) {
          setStatusText(`${failedCount} upload(s) failed after retries`);
          setIsUploading(false); // Let user retry failed ones
        } else {
          setStatusText('All Batches Uploaded Successfully!');
          setTimeout(() => {
            setIsUploading(false);
            setStatusText('');
            setFileStatuses([]);
          }, 3000);
        }
        return prev;
      });

    } catch (error: any) {
      alert(`Upload error: ${error.message}`);
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
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

    e.target.value = ''; // Reset input so same files can be selected again if needed
  };

  const handleRetryFailed = async () => {
    const failedItems = fileStatuses
      .map((fs, index) => ({ file: fs.file, index, status: fs.status }))
      .filter(item => item.status === 'failed');

    if (failedItems.length === 0) return;
    
    // Reset failed statuses back to pending before processing
    setFileStatuses(prev => prev.map(fs => fs.status === 'failed' ? { ...fs, status: 'pending', progress: 0, retryCount: 0 } : fs));
    
    await processAndUpload(failedItems);
  };

  const handleCloseModal = () => {
    if (isUploading) {
      if (!window.confirm('An upload is currently in progress. Are you sure you want to close the window?')) {
        return;
      }
    }
    setIsOpen(false);
    if (!isUploading) {
      setFileStatuses([]);
      setStatusText('');
    }
  };

  const hasFailures = fileStatuses.some(f => f.status === 'failed');
  const visibleFiles = fileStatuses.filter(f => f.status !== 'completed');

  return (
    <>
      {/* Sleek Modal Trigger Button - Now styled as a Nav Link */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors whitespace-nowrap bg-transparent border-none p-0 cursor-pointer h-full"
      >
        <ImagePlus className="w-4 h-4 mr-2" /> Bulk Upload
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl bg-brand-card border border-white/10 rounded-xl shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-black/20">
              <h2 className="font-display text-lg uppercase tracking-widest text-brand-primary flex items-center">
                <ImagePlus className="w-5 h-5 mr-3" />
                Media Upload Manager
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-8 bg-brand-dark hover:border-brand-primary/50 hover:bg-white/[0.02] transition-all relative group overflow-hidden">
                
                {/* Note: Deliberately omitting .heic here so iPhones automatically transcode it to JPEG on upload, which we then convert to WebP */}
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg, image/png, image/webp, image/jpg"
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
                      Select images to upload. Files are automatically compressed and converted to highly optimized WebP format.
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
                    {(isUploading || hasFailures) && (
                      <div className="w-full mb-6 bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-brand-primary relative transition-all duration-200 ease-out" 
                          style={{ width: `${overallProgress}%` }}
                        >
                          {isUploading && <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse"></div>}
                        </div>
                      </div>
                    )}

                    {/* Scrollable File List Queue */}
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
                                  : file.status === 'pending'
                                  ? 'Queued'
                                  : file.retryCount > 0 
                                  ? `Retry ${file.retryCount}` 
                                  : `${file.progress}%`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Retry Button */}
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
          </div>
        </div>
      )}
    </>
  );
}