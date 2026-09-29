"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Search,
  Sparkles,
  UploadCloud,
  Check,
  Image as ImageIcon,
  Loader2,
  FolderHeart,
  Grid3X3,
  Layers,
} from "lucide-react";
import {
  PRESET_SERVICE_LIBRARY,
  SERVICE_LIBRARY_CATEGORIES,
  type LibraryImageItem,
} from "@/lib/service-library";
import { getServiceLibraryImages, getServiceImageUrl } from "@/lib/services.api";

interface ServiceMediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentValue?: string;
  uploadFn?: (file: File) => Promise<string>;
}

export default function ServiceMediaLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
  currentValue = "",
  uploadFn,
}: ServiceMediaLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "preset" | "uploaded">("all");
  const [uploadedImages, setUploadedImages] = useState<LibraryImageItem[]>([]);
  const [loadingUploaded, setLoadingUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadExistingImages = async () => {
      try {
        setLoadingUploaded(true);
        const data = await getServiceLibraryImages();
        const mapped: LibraryImageItem[] = data.map((item, idx) => ({
          id: `uploaded-${idx}-${encodeURIComponent(item.url)}`,
          url: item.url,
          title: item.title || "Custom Uploaded Service",
          category: item.category || "other",
          tags: [item.title, item.category, "uploaded"].filter(Boolean),
          source: "uploaded",
        }));
        setUploadedImages(mapped);
      } catch (err) {
        console.warn("Failed to load uploaded library images", err);
      } finally {
        setLoadingUploaded(false);
      }
    };

    void loadExistingImages();
  }, [isOpen]);

  const allItems = useMemo<LibraryImageItem[]>(() => {
    return [...uploadedImages, ...PRESET_SERVICE_LIBRARY];
  }, [uploadedImages]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Tab filter
      if (activeTab === "preset" && item.source !== "preset") return false;
      if (activeTab === "uploaded" && item.source !== "uploaded") return false;

      // Category filter
      if (selectedCategory !== "all") {
        const itemCat = (item.category || "").toLowerCase();
        if (selectedCategory === "hospitality" && (itemCat.includes("staff") || itemCat.includes("security") || itemCat.includes("logistics"))) {
          // match
        } else if (selectedCategory === "lighting" && itemCat.includes("light")) {
          // match
        } else if (selectedCategory === "sound" && (itemCat.includes("sound") || itemCat.includes("dj") || itemCat.includes("audio"))) {
          // match
        } else if (!itemCat.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const catMatch = item.category.toLowerCase().includes(query);
        const tagMatch = item.tags.some((t) => t.toLowerCase().includes(query));
        return titleMatch || catMatch || tagMatch;
      }

      return true;
    });
  }, [allItems, activeTab, selectedCategory, searchQuery]);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadFn) return;

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
      onSelectImage(uploadedUrl);
      onClose();
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-[#e8e1d8] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee7dc] bg-[#faf8f5] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#29241f] text-white">
              <FolderHeart size={18} className="text-[#d8a86c]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#29241f]">
                  Service Media Library
                </h2>
                <span className="rounded-full bg-[#9A7B4F]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#9A7B4F]">
                  {allItems.length} Photos
                </span>
              </div>
              <p className="text-xs text-[#8d847b]">
                Pick high-resolution preset photos or your previously uploaded images for this service.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uploadFn && (
              <>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-black disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UploadCloud size={14} />
                  )}
                  <span>Upload New</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleDirectUpload}
                  className="hidden"
                />
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition border border-gray-200"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-2.5 text-xs font-semibold text-rose-800">
            {uploadError}
          </div>
        )}

        {/* Search Bar & Source Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#eee7dc] bg-white px-6 py-3.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search library by service title, flowers, buffet, lighting, camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#d8cfc4] bg-[#faf8f5]/60 pl-9.5 pr-4 text-xs text-[#29241f] outline-none transition placeholder:text-gray-400 focus:border-[#a7773f] focus:bg-white focus:ring-2 focus:ring-[#a7773f]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-[#f5f1ea] p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-white text-[#29241f] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Layers size={13} />
              <span>All ({allItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preset")}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "preset"
                  ? "bg-white text-[#29241f] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Sparkles size={13} className="text-[#a7773f]" />
              <span>Curated Presets ({PRESET_SERVICE_LIBRARY.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("uploaded")}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "uploaded"
                  ? "bg-white text-[#29241f] shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Grid3X3 size={13} />
              <span>Uploaded ({uploadedImages.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-[#eee7dc] bg-[#faf8f5]/40 px-6 py-2.5 no-scrollbar">
          {SERVICE_LIBRARY_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-lg px-3 py-1 text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? "bg-[#29241f] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Media Grid Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingUploaded ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center text-xs text-gray-400">
              <Loader2 size={24} className="animate-spin text-[#a7773f]" />
              <span>Loading media library...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <ImageIcon size={32} className="text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No images matched your filter</p>
              <p className="text-xs text-gray-400">
                Try searching for general keywords or choose another category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setActiveTab("all");
                }}
                className="mt-2 rounded-xl bg-gray-100 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => {
                const resolvedUrl = getServiceImageUrl(item.url) || item.url;
                const isSelected = currentValue === item.url || (currentValue && currentValue.includes(item.url));

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onSelectImage(item.url);
                      onClose();
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[#9A7B4F] ring-2 ring-[#9A7B4F] shadow-md"
                        : "border-gray-200 bg-white hover:border-[#9A7B4F]/60 hover:shadow-md"
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                      <img
                        src={resolvedUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-108"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#9A7B4F] text-white shadow-md">
                          <Check size={14} />
                        </div>
                      )}

                      {/* Source badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                          item.source === "uploaded"
                            ? "bg-emerald-800/80 text-white"
                            : "bg-black/60 text-white"
                        }`}>
                          {item.source === "uploaded" ? "Uploaded" : item.category}
                        </span>
                      </div>

                      {/* Hover action overlay button */}
                      <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex w-full items-center justify-center gap-1 rounded-xl bg-white/95 py-1.5 text-center text-xs font-bold text-gray-900 shadow-md">
                          <Check size={13} className="text-[#9A7B4F]" />
                          <span>Select Photo</span>
                        </span>
                      </div>
                    </div>

                    {/* Meta Footer */}
                    <div className="p-3">
                      <p className="truncate text-xs font-bold text-gray-900 group-hover:text-[#9A7B4F]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] capitalize text-gray-400">
                        {item.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#eee7dc] bg-[#faf8f5] px-6 py-3 text-xs text-[#756d64]">
          <p>
            Showing <strong>{filteredItems.length}</strong> photo options. Click any photo to apply immediately.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
