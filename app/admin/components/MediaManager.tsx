// app/admin/components/MediaManager.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, Loader2, XCircle, ImagePlus, RefreshCw, X, Trash2, ImageIcon, UploadCloud } from 'lucide-react';
import { generatePresignedUrls, saveMediaAssetsToDb, deleteMediaAsset, deleteAllMediaAssets } from '../media-actions';

type FileStatus = {
  file: File;
  name: string;
  progress: number;
  status: 'pending' | 'decoding' | 'compressing' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
};

const MAX_AUTO_RETRIES = 2;
const UPLOAD_BATCH_SIZE = 5; // Network batch size for Cloudflare Free Tier

// ULTRA-FAST, LOW-MEMORY SINGLE-PASS WEBP CONVERTER
async function convertToWebpMemorySafe(
  file: File, 
  maxDim = 1920, 
  quality = 0.82
): Promise<File> {
  const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const webpName = `${originalNameWithoutExt}.webp`;
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

  let imageSource: CanvasImageSource | null = null;

  try {
    if (isHeic) {
      // 1. Try Native Browser HEIC Decoding (Ultra-fast on Safari / iOS)
      try {
        imageSource = await createImageBitmap(file);
      } catch {
        // 2. Fallback to heic2any for Chrome/Firefox/Android
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/png' });
        const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        imageSource = await createImageBitmap(singleBlob);
      }
    } else {
      imageSource = await createImageBitmap(file);
    }
  } catch (err) {
    // If bitmap creation fails, return original file as ultimate safety fallback
    return file;
  }

  // Calculate scaled dimensions to fit within maxDim
  let width = imageSource.width;
  let height = imageSource.height;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  // Draw directly onto Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    if ('close' in imageSource && typeof (imageSource as any).close === 'function') {
      (imageSource as any).close();
    }
    return file;
  }

  ctx.drawImage(imageSource, 0, 0, width, height);

  // IMMEDIATELY RELEASE BITMAP RAM MEMORY
  if ('close' in imageSource && typeof (imageSource as any).close === 'function') {
    (imageSource as any).close();
  }

  // Export single-pass WebP Blob
  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));

  // Clear canvas reference to trigger instant Garbage Collection
  canvas.width = 0;
  canvas.height = 0;

  if (!webpBlob) return file;

  return new File([webpBlob], webpName, { type: 'image/webp' });
}

export default function MediaManager({ initialMedia = [] }: { initialMedia?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);

  // Library State
  const [localMedia, setLocalMedia] = useState(initialMedia);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    setLocalMedia(initialMedia);
  }, [initialMedia]);

  const overallProgress = useMemo(() => {
    if (fileStatuses.length === 0) return 0;
    const totalProgressSum = fileStatuses.reduce((acc, file) => {
      if (file.status === 'completed' || file.status === 'failed') return acc + 100;
      if (file.status === 'decoding') return acc + 10; 
      if (file.status === 'compressing') return acc + 25;
      return acc + (25 + (file.progress * 0.75));
    }, 0);
    return Math.round(totalProgressSum / fileStatuses.length);
  }, [fileStatuses]);

  const uploadSingleFile = async (file: File, index: number, uploadUrl: string): Promise<boolean> => {
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
            } else reject(new Error(`HTTP ${xhr.status}`));
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
    let totalFailed = 0;

    try {
      const processedFiles: { compressed: File; index: number; originalName: string }[] = [];

      // STEP 1: SEQUENTIAL CONVERSION (1 BY 1 TO PREVENT BROWSER MEMORY SPIKES)
      for (let i = 0; i < filesToProcess.length; i++) {
        const { file, index } = filesToProcess[i];
        setStatusText(`Converting image ${i + 1} of ${filesToProcess.length} to WebP...`);
        
        setFileStatuses(prev => prev.map((fs, j) => j === index ? { ...fs, status: 'compressing' } : fs));

        // Convert file using ultra-fast RAM safe converter
        const convertedFile = await convertToWebpMemorySafe(file);
        processedFiles.push({
          compressed: convertedFile,
          index,
          originalName: convertedFile.name,
        });

        // Yield execution to microtask queue so UI updates smoothly at 60 FPS
        await new Promise(r => setTimeout(r, 10));
      }

      // STEP 2: CLOUDFLARE R2 UPLOAD IN SMALL BATCHES (NETWORK SAFE)
      const totalUploadBatches = Math.ceil(processedFiles.length / UPLOAD_BATCH_SIZE);

      for (let i = 0; i < processedFiles.length; i += UPLOAD_BATCH_SIZE) {
        const chunk = processedFiles.slice(i, i + UPLOAD_BATCH_SIZE);
        const batchNum = Math.floor(i / UPLOAD_BATCH_SIZE) + 1;

        setStatusText(`Requesting Cloudflare links for batch ${batchNum} of ${totalUploadBatches}...`);
        const fileNames = chunk.map(item => item.originalName);
        const urlResponse = await generatePresignedUrls(fileNames);

        if (!urlResponse.success || !urlResponse.urls) {
          setFileStatuses(prev => prev.map((fs, j) => chunk.some(c => c.index === j) ? { ...fs, status: 'failed' } : fs));
          totalFailed += chunk.length;
          continue; 
        }

        setStatusText(`Uploading batch ${batchNum} of ${totalUploadBatches}...`);
        const uploadPromises = chunk.map((item, urlIdx) => {
          const urlData = urlResponse.urls![urlIdx];
          return uploadSingleFile(item.compressed, item.index, urlData.uploadUrl).then(success => ({ success, urlData }));
        });

        const results = await Promise.all(uploadPromises);

        setStatusText(`Saving batch ${batchNum} to database...`);
        const successfulAssets = results
          .filter(r => r.success)
          .map(r => ({ id: r.urlData.id, url: r.urlData.publicUrl, fileName: r.urlData.fileName }));

        if (successfulAssets.length > 0) {
          await saveMediaAssetsToDb(successfulAssets);
        }

        const failedInBatch = results.filter(r => !r.success).length;
        totalFailed += failedInBatch;
      }

      if (totalFailed > 0) {
        setStatusText(`${totalFailed} upload(s) failed. Click retry.`);
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
      if (totalFailed > 0) setIsUploading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const initialStatuses: FileStatus[] = fileArray.map(f => ({ file: f, name: f.name, progress: 0, status: 'pending', retryCount: 0 }));
    setFileStatuses(initialStatuses);
    await processAndUpload(fileArray.map((file, index) => ({ file, index })));
    e.target.value = '';
  };

  const handleRetryFailed = async () => {
    const failedItems = fileStatuses.map((fs, index) => ({ file: fs.file, index, status: fs.status })).filter(item => item.status === 'failed');
    if (failedItems.length === 0) return;
    setFileStatuses(prev => prev.map(fs => fs.status === 'failed' ? { ...fs, status: 'pending', progress: 0 } : fs));
    await processAndUpload(failedItems);
  };

  const handleDeleteMedia = async (id: string, url: string) => {
    if (!window.confirm("WARNING: Permanently delete this image from your database and Cloudflare cloud?")) return;
    setIsDeletingId(id);
    const res = await deleteMediaAsset(id, url);
    if (res.success) {
      setLocalMedia(prev => prev.filter(m => m.id !== id));
    } else {
      alert(`Failed to delete image: ${res.error}`);
    }
    setIsDeletingId(null);
  };

  const handleDeleteAllMedia = async () => {
    if (!window.confirm("WARNING: Permanently delete ALL unused images from database and cloud? Proceed?")) return;
    setIsDeletingAll(true);
    const res = await deleteAllMediaAssets();
    if (res.success) {
      setLocalMedia([]);
    } else {
      alert(`Failed to delete images: ${res.error}`);
    }
    setIsDeletingAll(false);
  };

  const handleCloseModal = () => {
    if (isUploading && !window.confirm('An upload is currently in progress. Close window?')) return;
    setIsOpen(false);
    if (!isUploading) { setFileStatuses([]); setStatusText(''); }
  };

  const hasFailures = fileStatuses.some(f => f.status === 'failed');
  const visibleFiles = fileStatuses.filter(f => f.status !== 'completed');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors whitespace-nowrap bg-transparent border-none p-0 cursor-pointer h-full"
      >
        <ImagePlus className="w-4 h-4 mr-2" /> Media Manager
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div 
            className="relative w-full max-w-4xl bg-brand-card border border-white/10 rounded-xl shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tabbed Header */}
            <div className="flex justify-between items-center p-0 border-b border-white/5 bg-black/20 shrink-0">
              <div className="flex">
                 <button onClick={() => setActiveTab('upload')} className={`px-5 sm:px-8 py-4 font-display text-sm uppercase tracking-widest flex items-center transition-colors border-b-2 ${activeTab === 'upload' ? 'border-brand-primary text-brand-primary bg-white/5' : 'border-transparent text-gray-500 hover:text-white'}`}>
                   <UploadCloud className="w-4 h-4 mr-2" /> Upload
                 </button>
                 <button onClick={() => setActiveTab('library')} className={`px-5 sm:px-8 py-4 font-display text-sm uppercase tracking-widest flex items-center transition-colors border-b-2 ${activeTab === 'library' ? 'border-brand-primary text-brand-primary bg-white/5' : 'border-transparent text-gray-500 hover:text-white'}`}>
                   <ImageIcon className="w-4 h-4 mr-2" /> Library ({localMedia.length})
                 </button>
              </div>
              <button onClick={handleCloseModal} className="p-2 mr-4 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'upload' ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-8 bg-brand-dark hover:border-brand-primary/50 hover:bg-white/[0.02] transition-all relative group overflow-hidden">
                  <input 
                    type="file" multiple accept="image/jpeg, image/png, image/webp, image/jpg, image/heic, image/heif, .heic, .heif"
                    onChange={handleBulkUpload} disabled={isUploading || fileStatuses.length > 0}
                    className={`absolute inset-0 w-full h-full opacity-0 ${isUploading || fileStatuses.length > 0 ? 'pointer-events-none' : 'cursor-pointer z-10'}`}
                  />
                  {fileStatuses.length === 0 ? (
                    <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-300">
                      <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 text-brand-primary">
                        <ImagePlus className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-2">Bulk Upload Media</h3>
                      <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">
                        Drag & drop images here. Batch conversion runs on a single-pass worker pipeline to preserve device RAM.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col w-full max-w-xl z-20 pointer-events-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {overallProgress === 100 && !hasFailures ? <CheckCircle className="w-6 h-6 text-brand-primary mr-3" /> : hasFailures && !isUploading ? <XCircle className="w-6 h-6 text-red-500 mr-3" /> : <Loader2 className="w-6 h-6 text-brand-primary mr-3 animate-spin" />}
                          <h3 className="font-bold text-sm uppercase tracking-widest text-white">
                            {statusText || (hasFailures ? 'Some uploads failed' : '')}
                          </h3>
                        </div>
                        <span className="text-xl font-display text-brand-primary">{overallProgress}%</span>
                      </div>
                      
                      {isUploading && (
                        <div className="w-full mb-6 bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden shadow-inner">
                          <div className="h-full bg-brand-primary relative transition-all duration-200 ease-out" style={{ width: `${overallProgress}%` }}>
                            <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      )}

                      {visibleFiles.length > 0 && (
                        <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar border border-white/5 rounded-md p-2 bg-black/20 pointer-events-auto">
                          {visibleFiles.map((file, idx) => (
                            <div key={idx} className="w-full bg-brand-dark p-3 rounded border border-white/5 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-300 truncate max-w-[50%]" title={file.name}>{file.name}</span>
                              <div className="flex items-center gap-3 w-1/2 justify-end">
                                <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                                  <div className={`h-full transition-all duration-300 ${file.status === 'failed' ? 'bg-red-500' : file.status === 'decoding' ? 'bg-blue-500' : 'bg-brand-primary'}`} style={{ width: `${file.status === 'compressing' ? 25 : file.progress}%` }}></div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest min-w-[70px] text-right ${file.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                                  {file.status === 'failed' ? 'Failed' : file.status === 'compressing' ? 'WebP Zipping' : file.retryCount > 0 ? `Retry ${file.retryCount}` : `${file.progress}%`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {hasFailures && !isUploading && (
                        <div className="flex items-center justify-between mt-4 pointer-events-auto">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Auto-retries exhausted.</p>
                          <button type="button" onClick={handleRetryFailed} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest flex items-center transition-colors cursor-pointer">
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Failed
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      {localMedia.length > 0 ? "Unused Library Assets" : ""}
                    </p>
                    {localMedia.length > 0 && (
                      <button
                        onClick={handleDeleteAllMedia}
                        disabled={isDeletingAll || isDeletingId !== null}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center transition-colors disabled:opacity-50"
                      >
                        {isDeletingAll ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
                        {isDeletingAll ? 'Deleting All...' : 'Empty Library'}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {localMedia.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-gray-400 text-sm uppercase tracking-widest font-bold">
                        No unused media found in the library.
                      </div>
                    ) : (
                      localMedia.map((m: any) => (
                        <div key={m.id} className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-white/30 transition-all group bg-brand-dark">
                          <img src={m.url} alt={m.fileName} loading="lazy" className="w-full h-full object-cover" />
                          
                          {/* Exact Filename Label Component Added Here */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1.5 backdrop-blur-sm">
                            <p className="text-[10px] text-gray-300 truncate" title={m.fileName}>
                              {m.fileName}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteMedia(m.id, m.url)}
                            disabled={isDeletingId === m.id || isDeletingAll}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-all z-20 disabled:opacity-100"
                            title="Delete Image Permanently"
                          >
                            {isDeletingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}