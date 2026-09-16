import { get, post, put, del, type ApiResponse } from "./api";
import { getAuthToken } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  imageUrl?: string;
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
  imageUrl?: string;
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
  imageUrl?: string;
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
  quantity: number;
  amount: number;
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

export async function uploadFoodImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/food/upload`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "Failed to upload food image");
  }

  return result.data.imageUrl;
}

export function getFoodImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_URL.replace(/\/api$/, "")}${imageUrl}`;
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
