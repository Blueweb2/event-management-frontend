"use client";

import { useMemo, useState } from "react";

import AddFoodModal from "@/components/dashboard/food/AddFoodModal";
import FoodFilters from "@/components/dashboard/food/FoodFilters";
import FoodHeader from "@/components/dashboard/food/FoodHeader";
import FoodMenuList from "@/components/dashboard/food/FoodMenuList";
import FoodStats from "@/components/dashboard/food/FoodStats";

import {
  foodItems as initialFoodItems,
  type FoodCategory,
  type FoodItem,
  type FoodType,
} from "@/components/dashboard/food/constants";

export default function FoodPage() {
  const [items, setItems] =
    useState<FoodItem[]>(initialFoodItems);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState<
    "All" | FoodCategory
  >("All");

  const [type, setType] = useState<"All" | FoodType>("All");

  const [availability, setAvailability] = useState<
    "All" | "Available" | "Unavailable"
  >("All");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingItem, setEditingItem] =
    useState<FoodItem | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || item.category === category;

      const matchesType =
        type === "All" || item.type === type;

      const matchesAvailability =
        availability === "All" ||
        (availability === "Available" && item.available) ||
        (availability === "Unavailable" && !item.available);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesAvailability
      );
    });
  }, [items, search, category, type, availability]);

  const handleAddFood = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEditFood = (item: FoodItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDeleteFood = (item: FoodItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) return;

    setItems((current) =>
      current.filter((food) => food.id !== item.id)
    );
  };

  const handleToggleAvailability = (item: FoodItem) => {
    setItems((current) =>
      current.map((food) =>
        food.id === item.id
          ? {
              ...food,
              available: !food.available,
            }
          : food
      )
    );
  };

  const handleSaveFood = (item: FoodItem) => {
    setItems((current) => {
      const exists = current.some(
        (food) => food.id === item.id
      );

      if (exists) {
        return current.map((food) =>
          food.id === item.id ? item : food
        );
      }

      return [item, ...current];
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("All");
    setType("All");
    setAvailability("All");
  };

  return (
    <div className="space-y-6 pb-8">
      <FoodHeader onAddFood={handleAddFood} />

      <FoodStats />

      <FoodFilters
        search={search}
        category={category}
        type={type}
        availability={availability}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onTypeChange={setType}
        onAvailabilityChange={setAvailability}
        onClear={handleClearFilters}
      />

      <FoodMenuList
        items={filteredItems}
        onEdit={handleEditFood}
        onDelete={handleDeleteFood}
        onToggleAvailability={handleToggleAvailability}
      />

      <AddFoodModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveFood}
        editingItem={editingItem}
      />
    </div>
  );
}