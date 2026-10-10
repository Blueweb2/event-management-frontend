"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Search,
  Sparkles,
  SlidersHorizontal,
  X,
  Layers,
  HeartHandshake,
} from "lucide-react";

import type { BookingFormData, ServiceItem } from "../types";
import { getServices, getServiceImageUrl } from "@/lib/services.api";
import { getFallbackServiceImage } from "@/lib/service-library";
import type { PricingType, Service } from "@/types/service";

import ServiceCategoryTabs, {
  type ServiceCategoryMeta,
  getCategoryIcon,
} from "../services/ServiceCategoryTabs";
import ServiceOptionCard from "../services/ServiceOptionCard";
import ServiceImagePreview, {
  type PreviewableServiceOption,
} from "../services/ServiceImagePreview";
import SelectedServicesSummary from "../services/SelectedServicesSummary";
import { formatCurrency } from "../services/PricingDisplay";

type ServicesItemsStepProps = {
  formData: BookingFormData;
  updateServices: (services: BookingFormData["services"]) => void;
};

export default function ServicesItemsStep({
  formData,
  updateServices,
}: ServicesItemsStepProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lightbox modal state
  const [previewItem, setPreviewItem] = useState<PreviewableServiceOption | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const guestCount = Math.max(1, Number(formData.guests) || 1);

  // Load backend active services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getServices();
        setServices(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load services."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadServices();
  }, []);

  // Flatten all services & options into visual display items
  const allDisplayItems = useMemo<PreviewableServiceOption[]>(() => {
    const items: PreviewableServiceOption[] = [];

    services.forEach((service) => {
      const activeOptions = (service.options || []).filter((opt) => opt.active);

      if (activeOptions.length > 0) {
        // Option variations present -> flatten each option as a distinct card
        activeOptions.forEach((opt) => {
          const uniqueKey = `${service._id}__${opt._id}`;
          const isSelected = formData.services.some(
            (s) => s.serviceId === service._id && s.optionId === opt._id
          );
          const currentItem = formData.services.find(
            (s) => s.serviceId === service._id && s.optionId === opt._id
          );

          const rawImg = opt.imageUrl || service.imageUrl;
          const resolvedImg = getServiceImageUrl(rawImg) || getFallbackServiceImage(service.category);

          const pricingType: PricingType = opt.pricingType || service.pricingType || "FIXED";
          const defaultQty = pricingType === "PER_GUEST" ? guestCount : 1;

          items.push({
            uniqueKey,
            serviceId: service._id,
            optionId: opt._id,
            category: service.category || "other",
            parentServiceName: service.name,
            title: opt.name,
            description: opt.description || service.description || "",
            imageUrl: resolvedImg,
            price: Number(opt.price) || 0,
            pricingType,
            unitLabel: opt.unitLabel || service.unitLabel || "",
            isSelected,
            selectedQuantity: currentItem ? Number(currentItem.quantity) : defaultQty,
            guestCount,
          });
        });
      } else {
        // Base service with no sub-options
        const uniqueKey = service._id;
        const isSelected = formData.services.some(
          (s) => s.serviceId === service._id && !s.optionId
        );
        const currentItem = formData.services.find(
          (s) => s.serviceId === service._id && !s.optionId
        );

        const resolvedImg = getServiceImageUrl(service.imageUrl) || getFallbackServiceImage(service.category);
        const pricingType: PricingType = service.pricingType || "FIXED";
        const defaultQty = pricingType === "PER_GUEST" ? guestCount : 1;

        items.push({
          uniqueKey,
          serviceId: service._id,
          optionId: undefined,
          category: service.category || "other",
          parentServiceName: service.name,
          title: service.name,
          description: service.description || "",
          imageUrl: resolvedImg,
          price: Number(service.basePrice) || 0,
          pricingType,
          unitLabel: service.unitLabel || "",
          isSelected,
          selectedQuantity: currentItem ? Number(currentItem.quantity) : defaultQty,
          guestCount,
        });
      }
    });

    return items;
  }, [services, formData.services, guestCount]);

  // Compute category tabs metadata dynamically
  const categories = useMemo<ServiceCategoryMeta[]>(() => {
    const categoryCounts: Record<string, number> = {};

    allDisplayItems.forEach((item) => {
      const cat = (item.category || "other").toLowerCase();
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return Object.keys(categoryCounts).map((catId) => ({
      id: catId,
      name: catId.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count: categoryCounts[catId],
      icon: getCategoryIcon(catId),
    }));
  }, [allDisplayItems]);

  // Automatically select the first dynamic category tab as default
  useEffect(() => {
    if (categories.length > 0) {
      const isCurrentValid = categories.some(
        (c) => c.id.toLowerCase() === selectedCategory.toLowerCase()
      );
      if (!isCurrentValid) {
        setSelectedCategory(categories[0].id);
      }
    }
  }, [categories, selectedCategory]);

  // Filtered visual cards according to active category and search keyword
  const filteredItems = useMemo(() => {
    return allDisplayItems.filter((item) => {
      // Category filter (defaults to first dynamic category)
      if (selectedCategory && selectedCategory !== "all") {
        const itemCat = item.category.toLowerCase();
        const filterCat = selectedCategory.toLowerCase();
        if (itemCat !== filterCat && !itemCat.includes(filterCat)) {
          return false;
        }
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchParent = item.parentServiceName.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        return matchTitle || matchParent || matchCat || matchDesc;
      }

      return true;
    });
  }, [allDisplayItems, selectedCategory, searchQuery]);

  // Toggle selection
  const handleToggleSelect = (item: PreviewableServiceOption) => {
    if (item.isSelected) {
      // Remove item
      const nextServices = formData.services.filter((s) => {
        if (item.optionId) {
          return !(s.serviceId === item.serviceId && s.optionId === item.optionId);
        }
        return !(s.serviceId === item.serviceId && !s.optionId);
      });
      updateServices(nextServices);
    } else {
      // Add item
      const displayName =
        item.optionId && item.parentServiceName !== item.title
          ? `${item.parentServiceName} - ${item.title}`
          : item.title;

      const qty = item.pricingType === "PER_GUEST" ? guestCount : (item.selectedQuantity || 1);

      const newItem: ServiceItem = {
        id: crypto.randomUUID(),
        serviceId: item.serviceId,
        optionId: item.optionId,
        category: item.category,
        name: displayName,
        description: item.description,
        imageUrl: item.imageUrl,
        quantity: qty,
        unitPrice: item.price,
        pricingType: item.pricingType,
        unitLabel: item.unitLabel,
      };

      updateServices([...formData.services, newItem]);
    }
  };

  // Update item quantity (from card or preview modal or summary)
  const handleUpdateQuantity = (uniqueKeyOrItemId: string, quantity: number) => {
    const qty = Math.max(1, Number(quantity) || 1);

    updateServices(
      formData.services.map((s) => {
        const itemKey = s.optionId ? `${s.serviceId}__${s.optionId}` : s.serviceId;
        if (s.id === uniqueKeyOrItemId || itemKey === uniqueKeyOrItemId) {
          return {
            ...s,
            quantity: qty,
          };
        }
        return s;
      })
    );
  };

  // Remove item by id
  const handleRemoveItem = (itemId: string) => {
    updateServices(formData.services.filter((s) => s.id !== itemId));
  };

  // Clear all selections
  const handleClearAll = () => {
    updateServices([]);
  };

  // Open Lightbox
  const handleOpenPreview = (item: PreviewableServiceOption) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
  

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-xs font-semibold text-rose-800">
          <AlertCircle size={17} className="shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Unable to load services</p>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-3xl border border-[#eee7dc] bg-white p-12 text-center">
          <Loader2 size={32} className="animate-spin text-[#9A7B4F]" />
          <p className="text-sm font-bold text-[#29241f]">
            Loading services catalog...
          </p>
          <p className="text-xs text-gray-400">
            Fetching available setups, decor, and equipment packages
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8cfc4] bg-white p-12 text-center">
          <Layers size={36} className="mx-auto text-gray-300" />
          <p className="mt-3 text-base font-bold text-[#29241f]">
            No services currently available
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Create or activate services in Manager &gt; Services.
          </p>
        </div>
      ) : (
        <>
          {/* Search & Category Filter Navigation */}
          <div className="space-y-3.5">
            {/* Search Bar */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, floral stage, buffet dining, lighting packages, drone cameras..."
                className="h-12 w-full rounded-2xl border border-[#d8cfc4] bg-white pl-11 pr-10 text-xs sm:text-sm text-[#29241f] outline-none transition placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/15 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Navigation Tabs */}
            <ServiceCategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              totalServicesCount={allDisplayItems.length}
            />
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* LEFT COLUMN: Visual Service Cards Grid (8 cols on desktop) */}
            <div className="space-y-4 lg:col-span-7 xl:col-span-8">
              {/* Category Active Header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-base font-black text-[#29241f] flex items-center gap-2">
                    <span>
                      {(() => {
                        const activeCat = categories.find(
                          (c) => c.id.toLowerCase() === selectedCategory.toLowerCase()
                        );
                        if (activeCat) {
                          return `${activeCat.name.toUpperCase()} COLLECTION`;
                        }
                        return selectedCategory
                          ? `${selectedCategory.toUpperCase()} COLLECTION`
                          : "SERVICES COLLECTION";
                      })()}
                    </span>
                    <span className="rounded-full bg-[#9A7B4F]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#9A7B4F]">
                      {filteredItems.length} {filteredItems.length === 1 ? "Option" : "Options"}
                    </span>
                  </h3>
                </div>

                {formData.services.length > 0 && (
                  <p className="text-xs font-bold text-emerald-700 hidden sm:block">
                    ✓ {formData.services.length} selected in plan
                  </p>
                )}
              </div>

              {/* Visual Cards Grid */}
              {filteredItems.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-[#d8cfc4] bg-white p-8 text-center">
                  <SlidersHorizontal size={32} className="text-gray-300" />
                  <p className="text-sm font-bold text-gray-800">
                    No matching services found
                  </p>
                  <p className="text-xs text-gray-400">
                    Try adjusting your search keyword or browse another category.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      if (categories.length > 0) {
                        setSelectedCategory(categories[0].id);
                      }
                    }}
                    className="mt-2 rounded-xl bg-[#29241f] px-4 py-2 text-xs font-bold text-white hover:bg-black transition"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {filteredItems.map((item) => (
                    <ServiceOptionCard
                      key={item.uniqueKey}
                      item={item}
                      onToggleSelect={handleToggleSelect}
                      onOpenPreview={handleOpenPreview}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sticky "Your Event Selection" Panel (5 cols on desktop) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
              <SelectedServicesSummary
                selectedItems={formData.services}
                guestCount={guestCount}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
                onClearAll={handleClearAll}
              />
            </div>
          </div>

          {/* MOBILE BOTTOM FLOATING SELECTION SUMMARY BAR */}
          <SelectedServicesSummary
            selectedItems={formData.services}
            guestCount={guestCount}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onClearAll={handleClearAll}
            isMobileFloating
          />

          {/* LIGHTBOX MODAL PREVIEW */}
          <ServiceImagePreview
            item={previewItem}
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setPreviewItem(null);
            }}
            onToggleSelect={(item) => {
              handleToggleSelect(item);
              // Update local preview selection state
              setPreviewItem((prev) =>
                prev ? { ...prev, isSelected: !prev.isSelected } : null
              );
            }}
            onUpdateQuantity={(key, qty) => {
              handleUpdateQuantity(key, qty);
              setPreviewItem((prev) =>
                prev ? { ...prev, selectedQuantity: qty } : null
              );
            }}
          />
        </>
      )}
    </div>
  );
}