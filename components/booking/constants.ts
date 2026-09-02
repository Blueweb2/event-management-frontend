import {
  CalendarDays,
  ClipboardList,
  Utensils,
  User,
  type LucideIcon,
} from "lucide-react";

export interface BookingStepConfig {
  id: number;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
}

export const bookingSteps: BookingStepConfig[] = [
  {
    id: 1,
    title: "Event Details",
    shortTitle: "Event",
    icon: CalendarDays,
  },
  {
    id: 2,
    title: "Choose Package",
    shortTitle: "Package",
    icon: ClipboardList,
  },
  {
    id: 3,
    title: "Food & Requirements",
    shortTitle: "Food",
    icon: Utensils,
  },
  {
    id: 4,
    title: "Your Details",
    shortTitle: "Details",
    icon: User,
  },
];

/*
 * Package pricing
 *
 * These are base prices.
 * Final pricing can later be calculated by the backend
 * based on guest count and selected services.
 */
export interface PackageOption {
  id: string;
  name: string;
  description: string;
  price: string;
  popular?: boolean;
}

export const packageOptions: PackageOption[] = [
  {
    id: "starter",
    name: "Starter",
    description:
      "Simple and practical for smaller events.",
    price: "Starting from ₹25,000",
  },
  {
    id: "medium",
    name: "Medium",
    description:
      "A complete package for comfortable events.",
    price: "Starting from ₹50,000",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description:
      "A complete experience with premium service.",
    price: "Starting from ₹85,000",
  },
];

/*
 * Food preferences
 */
export const foodTypeOptions = [
  "Vegetarian",
  "Non-Vegetarian",
  "Both",
];

/*
 * Meals that can be selected
 */
export const mealOptions = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
];

/*
 * Additional event services
 */
export const requirementOptions = [
  "Decoration",
  "Stage Setup",
  "Seating Arrangement",
  "Sound System",
  "Photography",
  "Serving Staff",
];

/*
 * Event types
 */
export const eventTypeOptions = [
  "Wedding",
  "Birthday",
  "Engagement",
  "Corporate Event",
  "Religious Event",
  "Private Function",
  "Other",
];

/*
 * Common food pricing.
 *
 * These values are frontend defaults for displaying
 * an estimated calculation.
 *
 * Final pricing should eventually come from the backend.
 */
export const foodPrices = {
  breakfast: 120,
  lunch: 250,
  dinner: 250,
  snacks: 100,
} as const;

/*
 * Additional service pricing.
 */
export const requirementPrices: Record<string, number> = {
  Decoration: 15000,
  "Stage Setup": 10000,
  "Seating Arrangement": 7500,
  "Sound System": 8000,
  Photography: 12000,
  "Serving Staff": 7500,
};