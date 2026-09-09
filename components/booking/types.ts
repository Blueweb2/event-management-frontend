import type { PricingType } from "@/types/service";

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

export type BookingFormData = {
  // Event Details
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: string;
  location: string;
  description: string;

  // Client Details
  name: string;
  phone: string;
  email: string;
  message: string;

  // Services & Items
  services: ServiceItem[];

  // Pricing
  discountType: "percentage" | "fixed";
  discountValue: string;
  additionalCharges: string;
};