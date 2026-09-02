"use client";

import { useState } from "react";
import { X } from "lucide-react";

import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryCTA from "@/components/gallery/GalleryCTA";

import {
  galleryItems,
  type GalleryItem,
} from "@/components/gallery/constants";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [selectedImage, setSelectedImage] =
    useState<GalleryItem | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter(
          (item) =>
            item.category === activeCategory,
        );

  return (
    <>
      {/* Hero */}
      <GalleryHero />

      {/* Gallery */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Filters */}
        <GalleryFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Results */}
        <div className="mt-7">
          <GalleryGrid
            items={filteredItems}
            onImageClick={setSelectedImage}
          />
        </div>
      </main>

      {/* CTA */}
      <GalleryCTA />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Close image preview"
            onClick={() =>
              setSelectedImage(null)
            }
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {/* Image Container */}
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />

            {/* Image Information */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-5 pb-5 pt-16">
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                {selectedImage.category}
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {selectedImage.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}