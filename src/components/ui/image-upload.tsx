'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  aspectRatio: 'square' | 'wide';
  maxSizeMB: number;
  label: string;
  uploading: boolean;
  placeholder?: string; // e.g. business initial for logo
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({
  currentUrl,
  onUpload,
  aspectRatio,
  maxSizeMB,
  label,
  uploading,
  placeholder,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateAndUpload = useCallback(async (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    try {
      await onUpload(file);
    } catch {
      setError('Upload failed. Please try again.');
    }
  }, [maxSizeMB, onUpload]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  }

  const isSquare = aspectRatio === 'square';

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-2">
        {label}
      </label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden cursor-pointer group
          border-2 border-dashed rounded-lg transition-colors
          ${dragOver
            ? 'border-green-500 bg-green-500/10'
            : 'border-neutral-700 hover:border-neutral-500'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
          ${isSquare ? 'w-32 h-32' : 'w-full h-40'}
        `}
      >
        {/* Current image or placeholder */}
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={label}
            fill
            className="object-cover"
            sizes={isSquare ? '128px' : '100vw'}
          />
        ) : isSquare && placeholder ? (
          <div className="w-full h-full bg-red-600 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{placeholder}</span>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex flex-col items-center justify-center">
            <Upload className="w-6 h-6 text-neutral-500 mb-1" />
            <span className="text-xs text-neutral-500">
              {isSquare ? 'Upload Logo' : 'Upload Cover Image'}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
            <Camera className="w-6 h-6 text-white mb-1" />
            <span className="text-xs text-white font-medium">
              {currentUrl ? 'Change' : 'Upload'}
            </span>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <p className="mt-1 text-xs text-neutral-500">
        JPEG, PNG, or WebP. Max {maxSizeMB}MB.
      </p>

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
