'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  Star,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface UploadedImageItem {
  url: string;
  isPrimary?: boolean;
  altText?: string;
}

interface ImageUploadDropzoneProps {
  label?: string;
  helperText?: string;
  // For single image (e.g. Category, single photo)
  value?: string;
  onChange?: (url: string) => void;
  // For multiple images (e.g. Product Gallery)
  multiple?: boolean;
  images?: UploadedImageItem[];
  onImagesChange?: (images: UploadedImageItem[]) => void;
  className?: string;
}

export function ImageUploadDropzone({
  label = 'Product Saree Imagery',
  helperText = 'Upload high-resolution photography via drag-and-drop, device file, or direct URL.',
  value,
  onChange,
  multiple = false,
  images = [],
  onImagesChange,
  className,
}: ImageUploadDropzoneProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize single vs multiple values
  const currentImages: UploadedImageItem[] = multiple
    ? images
    : value
    ? [{ url: value, isPrimary: true }]
    : [];

  // Helper to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Process uploaded files
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const validFiles = Array.from(files).filter((file) => {
      const isImg = file.type.startsWith('image/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      return isImg && isUnder10MB;
    });

    if (validFiles.length === 0) {
      setUploadError('Please select valid image files under 10MB (JPG, PNG, WEBP, GIF).');
      setUploading(false);
      return;
    }

    try {
      const newUploadedItems: UploadedImageItem[] = [];

      for (const file of validFiles) {
        const base64 = await fileToBase64(file);
        
        // Upload to backend API
        let finalUrl = base64; // Fallback to base64 data URL
        try {
          const res = await api.uploadImage(base64, file.name, file.type);
          if (res.success && res.data?.url) {
            finalUrl = res.data.url;
          }
        } catch (apiErr) {
          console.warn('API upload failed, preserving local base64 preview:', apiErr);
        }

        newUploadedItems.push({
          url: finalUrl,
          isPrimary: currentImages.length === 0 && newUploadedItems.length === 0,
        });

        // If single image mode, we only take the first one
        if (!multiple) break;
      }

      if (multiple && onImagesChange) {
        onImagesChange([...currentImages, ...newUploadedItems]);
      } else if (onChange && newUploadedItems.length > 0) {
        onChange(newUploadedItems[0].url);
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError(err.message || 'Failed to process image upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Manual URL input submission
  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    if (multiple && onImagesChange) {
      onImagesChange([
        ...currentImages,
        { url: cleanUrl, isPrimary: currentImages.length === 0 },
      ]);
    } else if (onChange) {
      onChange(cleanUrl);
    }
    setUrlInput('');
  };

  // Remove an image
  const handleRemoveImage = (indexToRemove: number) => {
    if (multiple && onImagesChange) {
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      // Ensure at least one primary image if items remain
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      onImagesChange(updated);
    } else if (onChange) {
      onChange('');
    }
  };

  // Set an image as primary
  const handleSetPrimary = (indexToPrimary: number) => {
    if (!multiple || !onImagesChange) return;
    const updated = currentImages.map((img, idx) => ({
      ...img,
      isPrimary: idx === indexToPrimary,
    }));
    onImagesChange(updated);
  };

  return (
    <div className={cn('space-y-3 font-sans', className)}>
      {/* Label and Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-stone-800 tracking-wide flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#540924]" />
            <span>{label}</span>
          </label>
          {helperText && <p className="text-[11px] text-stone-500 mt-0.5">{helperText}</p>}
        </div>

        {/* Tab switcher: File Upload / Drag vs Direct URL */}
        <div className="inline-flex rounded-lg p-0.5 bg-stone-100 border border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer',
              activeTab === 'upload'
                ? 'bg-white text-[#540924] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            )}
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>File &amp; Drag</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer',
              activeTab === 'url'
                ? 'bg-white text-[#540924] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            )}
          >
            <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
            <span>Direct URL</span>
          </button>
        </div>
      </div>

      {/* Main Upload / Dropzone Tab */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 select-none group',
            isDragging
              ? 'border-[#d4af37] bg-[#540924]/5 scale-[1.01] shadow-md'
              : 'border-stone-300 hover:border-[#540924] hover:bg-stone-50/70 bg-stone-50/40'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 shadow-xs',
                isDragging
                  ? 'bg-[#540924] text-[#d4af37]'
                  : 'bg-white text-[#540924] border border-stone-200'
              )}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
              ) : (
                <UploadCloud className="w-6 h-6 stroke-[2]" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-stone-800">
                {uploading ? (
                  <span>Processing &amp; uploading image...</span>
                ) : isDragging ? (
                  <span className="text-[#540924] font-bold">Release to drop saree photo here</span>
                ) : (
                  <>
                    <span className="text-[#540924] underline underline-offset-2">
                      Click to browse
                    </span>{' '}
                    or drag &amp; drop saree photo here
                  </>
                )}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Supports JPG, PNG, WEBP, GIF up to 10MB {multiple && '• Multi-photo selection enabled'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Direct URL Input Tab */
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <label className="block text-[11px] font-semibold text-stone-700">
            Paste Public Web Image URL (Pexels, Unsplash, CDN)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              placeholder="https://images.pexels.com/photos/1488312/..."
              className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#540924]/20 focus:border-[#540924]"
            />
            <button
              type="button"
              onClick={() => handleAddUrl()}
              disabled={!urlInput.trim()}
              className="px-4 py-2 rounded-lg bg-[#540924] hover:bg-[#3d0517] disabled:bg-stone-300 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{multiple ? 'Add Photo' : 'Apply URL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error message display */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Image Previews / Gallery */}
      {currentImages.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
            <span>
              {multiple
                ? `Uploaded Saree Images (${currentImages.length})`
                : 'Current Selected Image'}
            </span>
            {multiple && (
              <span className="text-[10px] text-amber-700 font-medium">
                ★ Star icon indicates primary catalog photo
              </span>
            )}
          </div>

          <div
            className={cn(
              'grid gap-3',
              multiple
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-1 max-w-xs'
            )}
          >
            {currentImages.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                className={cn(
                  'group relative rounded-xl overflow-hidden border bg-white shadow-xs transition-all duration-200',
                  img.isPrimary
                    ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 shadow-sm'
                    : 'border-stone-200 hover:border-stone-400'
                )}
              >
                {/* Image Aspect Box */}
                <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={img.url}
                    alt={`Uploaded Saree Photo ${idx + 1}`}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />

                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 z-10 rounded-full bg-[#d4af37] text-stone-950 font-bold px-2 py-0.5 text-[9px] shadow-sm flex items-center gap-1 uppercase tracking-wider">
                      <Star className="w-2.5 h-2.5 fill-stone-950 text-stone-950" />
                      <span>Primary</span>
                    </div>
                  )}

                  {/* Hover Overlay with Action Buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {multiple && !img.isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(idx);
                        }}
                        title="Set as Primary Saree Photo"
                        className="p-1.5 rounded-full bg-white/90 hover:bg-[#d4af37] text-stone-800 hover:text-stone-950 text-xs transition-colors shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open full image in new tab"
                      className="p-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-xs transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      title="Remove image"
                      className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer bar with position or label */}
                <div className="px-2 py-1 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                  <span className="truncate max-w-[120px] font-mono">
                    {img.url.startsWith('data:')
                      ? 'local_upload.jpg'
                      : img.url.split('/').pop()?.split('?')[0] || `Image #${idx + 1}`}
                  </span>
                  <span>#{idx + 1}</span>
                </div>
              </div>
            ))}

            {/* Quick Add more button in multiple mode */}
            {multiple && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-stone-200 hover:border-[#540924] bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center p-3 text-stone-500 hover:text-[#540924] transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white group-hover:bg-[#540924] group-hover:text-white flex items-center justify-center border border-stone-200 transition-colors shadow-2xs mb-1">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Add Photo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
