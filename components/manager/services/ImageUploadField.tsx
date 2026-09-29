"use client";

import { useState, useRef } from "react";
import {
  ImagePlus,
  UploadCloud,
  X,
  Loader2,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FolderHeart,
  Sparkles,
} from "lucide-react";
import ServiceMediaLibraryModal from "./ServiceMediaLibraryModal";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadFn: (file: File) => Promise<string>;
  getImageUrlFn: (url?: string) => string | undefined;
  disabled?: boolean;
  hint?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  uploadFn,
  getImageUrlFn,
  disabled = false,
  hint = "Supports PNG, JPG, JPEG, WEBP or GIF up to 5 MB",
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const displayUrl = getImageUrlFn(value);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5 MB.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadFn(file);
      onChange(uploadedUrl);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="block text-sm font-semibold text-[#4A4B4D]">
          {label}
        </label>
        
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => setIsLibraryOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#9A7B4F] hover:text-[#7A5F35] transition disabled:opacity-50"
          >
            <FolderHeart size={13} className="text-[#9A7B4F]" />
            <span>Choose from Library</span>
          </button>
          <span className="text-gray-300 text-xs">|</span>
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
          >
            <LinkIcon size={12} />
            <span>{showUrlInput ? "Use Uploader" : "URL"}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700 animate-in fade-in">
          <AlertCircle size={14} className="shrink-0 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {showUrlInput ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              disabled={disabled || isUploading}
              onChange={(e) => {
                onChange(e.target.value);
                setUploadError("");
              }}
              placeholder="https://images.unsplash.com/photo-..."
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 text-xs text-[#333] outline-none transition placeholder:text-[#9A9BA0] focus:border-[#9A7B4F] focus:bg-white focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          {displayUrl && (
            <div className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2">
              <img
                src={displayUrl}
                alt="URL Preview"
                className="h-12 w-12 rounded-lg object-cover border border-gray-100"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-700">Custom Image URL set</p>
                <p className="truncate text-[10px] text-gray-400">{value}</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            /* Uploaded Preview Card */
            <div className="relative flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-[#9A7B4F]/40">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                <img
                  src={displayUrl}
                  alt="Service preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <p className="truncate text-xs font-bold text-gray-900">
                    Image Selected
                  </p>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-gray-500 font-mono">
                  {value.split("/").pop()}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => setIsLibraryOpen(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#FAF7F2] border border-[#E9DFD1] px-2.5 py-1 text-[11px] font-bold text-[#8C6B3E] hover:bg-[#F4ECE0] active:scale-95 transition disabled:opacity-50"
                  >
                    <Sparkles size={11} />
                    <span>Choose from Library</span>
                  </button>

                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 active:scale-95 transition disabled:opacity-50"
                  >
                    <ImagePlus size={11} />
                    <span>Upload File</span>
                  </button>

                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={handleRemove}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 active:scale-95 transition disabled:opacity-50"
                  >
                    <X size={11} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone with Library Choice */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                isDragging
                  ? "border-[#9A7B4F] bg-[#9A7B4F]/5"
                  : "border-gray-200 bg-[#FBFBFC] hover:border-[#9A7B4F]/60 hover:bg-white"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 size={24} className="animate-spin text-[#9A7B4F]" />
                  <p className="text-xs font-semibold text-gray-700">
                    Uploading image...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4EBDD] text-[#9A7B4F] shadow-xs transition group-hover:scale-105">
                    <UploadCloud size={22} />
                  </span>
                  
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Drop service photo here, or browse
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {hint}
                    </p>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={disabled || isUploading}
                      onClick={() => setIsLibraryOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-black active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <FolderHeart size={13} className="text-[#d8a86c]" />
                      <span>Browse Media Library</span>
                    </button>

                    <button
                      type="button"
                      disabled={disabled || isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <ImagePlus size={13} />
                      <span>Upload from Device</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
        </div>
      )}

      {/* Media Library Selection Modal */}
      <ServiceMediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectImage={(selectedUrl) => {
          onChange(selectedUrl);
          setUploadError("");
        }}
        currentValue={value}
        uploadFn={uploadFn}
      />
    </div>
  );
}
