export type FoodCategory =
  | "Starters"
  | "Main Course"
  | "Rice"
  | "Breads"
  | "Desserts"
  | "Beverages";

export type FoodType = "Veg" | "Non-Veg";

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  type: FoodType;
  price: number;
  description: string;
  available: boolean;
  popular?: boolean;
}

export const foodCategories: FoodCategory[] = [
  "Starters",
  "Main Course",
  "Rice",
  "Breads",
  "Desserts",
  "Beverages",
];

export const foodItems: FoodItem[] = [
  {
    id: "FOOD-001",
    name: "Paneer Tikka",
    category: "Starters",
    type: "Veg",
    price: 180,
    description: "Grilled cottage cheese with Indian spices.",
    available: true,
    popular: true,
  },
  {
    id: "FOOD-002",
    name: "Chicken Tikka",
    category: "Starters",
    type: "Non-Veg",
    price: 220,
    description: "Tender chicken pieces marinated and grilled.",
    available: true,
    popular: true,
  },
  {
    id: "FOOD-003",
    name: "Vegetable Kurma",
    category: "Main Course",
    type: "Veg",
    price: 160,
    description: "Mixed vegetables cooked in a creamy coconut gravy.",
    available: true,
  },
  {
    id: "FOOD-004",
    name: "Chicken Curry",
    category: "Main Course",
    type: "Non-Veg",
    price: 240,
    description: "Traditional Kerala-style chicken curry.",
    available: true,
    popular: true,
  },
  {
    id: "FOOD-005",
    name: "Kerala Vegetable Biryani",
    category: "Rice",
    type: "Veg",
    price: 190,
    description: "Fragrant basmati rice with vegetables and spices.",
    available: true,
  },
  {
    id: "FOOD-006",
    name: "Chicken Biryani",
    category: "Rice",
    type: "Non-Veg",
    price: 260,
    description: "Aromatic rice cooked with spiced chicken.",
    available: true,
    popular: true,
  },
  {
    id: "FOOD-007",
    name: "Appam",
    category: "Breads",
    type: "Veg",
    price: 40,
    description: "Soft Kerala-style rice pancake.",
    available: true,
  },
  {
    id: "FOOD-008",
    name: "Malabar Parotta",
    category: "Breads",
    type: "Veg",
    price: 35,
    description: "Layered flaky Kerala flatbread.",
    available: true,
  },
  {
    id: "FOOD-009",
    name: "Gulab Jamun",
    category: "Desserts",
    type: "Veg",
    price: 80,
    description: "Soft milk-based dessert served warm.",
    available: true,
    popular: true,
  },
  {
    id: "FOOD-010",
    name: "Payasam",
    category: "Desserts",
    type: "Veg",
    price: 90,
    description: "Traditional Kerala sweet pudding.",
    available: true,
  },
  {
    id: "FOOD-011",
    name: "Fresh Lime Juice",
    category: "Beverages",
    type: "Veg",
    price: 50,
    description: "Freshly prepared lime drink.",
    available: true,
  },
  {
    id: "FOOD-012",
    name: "Mango Juice",
    category: "Beverages",
    type: "Veg",
    price: 70,
    description: "Refreshing seasonal mango juice.",
    available: false,
  },
];

export const foodStats = {
  total: foodItems.length,
  available: foodItems.filter((item) => item.available).length,
  unavailable: foodItems.filter((item) => !item.available).length,
  popular: foodItems.filter((item) => item.popular).length,
};