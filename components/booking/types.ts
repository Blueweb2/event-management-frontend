import type { PricingType } from "@/types/service";

import type { FoodMenuSelection } from "@/lib/food.api";

/* ============================================================
   SERVICE ITEM
============================================================ */

export type ServiceItem = {
  id: string;
  serviceId: string;
  optionId?: string;
  category: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  pricingType?: PricingType;
  unitLabel?: string;
};

/* ============================================================
   BOOKING FORM DATA
============================================================ */

export type BookingFormData = {
  /* ==========================================================
     EVENT DETAILS
  ========================================================== */

  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: string;
  location: string;
  description: string;

  /* ==========================================================
     CLIENT DETAILS
  ========================================================== */

  name: string;
  phone: string;
  email: string;
   message: string;
  address: string;

  /* ==========================================================
     FOOD & CATERING MENU
  ========================================================== */

  foodMenu: FoodMenuSelection;

  /* ==========================================================
     SERVICES & ITEMS
  ========================================================== */

  services: ServiceItem[];

  /* ==========================================================
     PRICING
  ========================================================== */

  discountType: "percentage" | "fixed";
  discountValue: string;
  additionalCharges: string;
};