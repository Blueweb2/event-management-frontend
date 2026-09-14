"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import FoodHeader from "@/components/manager/food/FoodHeader";
import FoodList from "@/components/manager/food/FoodList";
import FoodModal from "@/components/manager/food/FoodModal";
import { type FoodItem, getFoodItems } from "@/lib/food.api";

export default function ManagerFoodPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getFoodItems();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load food menu items."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleItemSaved = (savedItem: FoodItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i._id === savedItem._id);
      if (exists) {
        return prev.map((i) => (i._id === savedItem._id ? savedItem : i));
      }
      return [savedItem, ...prev];
    });
  };

  const handleItemUpdated = (updatedItem: FoodItem) => {
    setItems((prev) =>
      prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
    );
  };

  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <FoodHeader items={items} onAddNew={handleAddNew} />

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white p-12 text-center">
          <Loader2 size={28} className="animate-spin text-[#6B5B95]" />
          <p className="mt-3 text-xs font-medium text-gray-500">
            Loading food catalog...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={fetchItems}
            className="rounded-lg bg-red-100 px-3 py-1 font-semibold text-red-800 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Food List */}
      {!loading && !error && (
        <FoodList
          items={items}
          onEdit={handleEdit}
          onItemUpdated={handleItemUpdated}
          onItemDeleted={handleItemDeleted}
          onAddNew={handleAddNew}
        />
      )}

      {/* Modal */}
      <FoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleItemSaved}
        editingItem={editingItem}
      />
    </div>
  );
}
