import { ZoomIn } from "lucide-react";

import type { GalleryItem } from "./constants";

interface GalleryGridProps {
  items: GalleryItem[];
  onImageClick: (item: GalleryItem) => void;
}

export default function GalleryGrid({
  items,
  onImageClick,
}: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ddd5cb] bg-[#faf8f5] px-6 py-16 text-center">
        <p className="text-base font-semibold text-[#403a34]">
          No images found
        </p>

        <p className="mt-2 text-sm text-[#8b8177]">
          Try selecting another category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onImageClick(item)}
          className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f1eee9] text-left shadow-sm transition hover:shadow-lg"
        >
          {/* Image */}
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90" />

          {/* Zoom Button */}
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#6f604f] opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100">
            <ZoomIn size={18} />
          </div>

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              {item.category}
            </p>

            <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
              {item.title}
            </h2>
          </div>
        </button>
      ))}
    </div>
  );
}