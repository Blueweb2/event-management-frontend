import { get, post, put, del, type ApiResponse } from "./api";

// ==========================================
// Types
// ==========================================

export type FoodCategory =
  | "Welcome Drinks"
  | "Starters / Appetizers"
  | "Main Course"
  | "Breads & Rice"
  | "Desserts & Sweets"
  | "Live Counters"
  | "Beverages"
  | "Salads & Soups";

export type DietaryType = "veg" | "non-veg" | "vegan" | "egg";

export interface FoodItem {
  _id: string;
  name: string;
  category: FoodCategory;
  dietary: DietaryType;
  defaultRate: number;
  description: string;
  isPopular: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodItemData {
  name: string;
  category: FoodCategory;
  dietary: DietaryType;
  defaultRate: number;
  description?: string;
  isPopular?: boolean;
  active?: boolean;
  sortOrder?: number;
}

export interface UpdateFoodItemData {
  name?: string;
  category?: FoodCategory;
  dietary?: DietaryType;
  defaultRate?: number;
  description?: string;
  isPopular?: boolean;
  active?: boolean;
  sortOrder?: number;
}

export interface SelectedFoodItemSnapshot {
  foodItemId?: string | null;
  name: string;
  category: string;
  dietary: DietaryType;
  rate: number;
}

export interface FoodMenuSelection {
  included: boolean;
  servingType: "PER_GUEST" | "PER_PLATE" | "FIXED";
  ratePerGuest: number;
  totalFoodAmount: number;
  notes: string;
  items: SelectedFoodItemSnapshot[];
}

// ==========================================
// API Methods
// ==========================================

export async function getFoodItems(params?: {
  category?: string;
  dietary?: string;
  search?: string;
  active?: boolean;
}): Promise<FoodItem[]> {
  const searchParams = new URLSearchParams();

  if (params?.category && params.category !== "all") {
    searchParams.set("category", params.category);
  }

  if (params?.dietary && params.dietary !== "all") {
    searchParams.set("dietary", params.dietary);
  }

  if (params?.search && params.search.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params?.active !== undefined) {
    searchParams.set("active", String(params.active));
  }

  const query = searchParams.toString();
  const endpoint = `/food${query ? `?${query}` : ""}`;

  const res = await get<ApiResponse<FoodItem[]>>(endpoint);
  return res.data || [];
}

export async function getFoodItemById(id: string): Promise<FoodItem> {
  const res = await get<ApiResponse<FoodItem>>(`/food/${id}`);
  return res.data;
}

export async function createFoodItem(data: CreateFoodItemData): Promise<FoodItem> {
  const res = await post<ApiResponse<FoodItem>>("/food", data);
  return res.data;
}

export async function updateFoodItem(
  id: string,
  data: UpdateFoodItemData
): Promise<FoodItem> {
  const res = await put<ApiResponse<FoodItem>>(`/food/${id}`, data);
  return res.data;
}

export async function deleteFoodItem(
  id: string
): Promise<{ success: boolean; message: string }> {
  return del<{ success: boolean; message: string }>(`/food/${id}`);
}
