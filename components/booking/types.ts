export type ServiceItem = {
  id: string;
  category: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
};

export type BookingFormData = {
  // Event details
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: string;
  location: string;
  description: string;

  // Services & Items
  services: ServiceItem[];

  // Pricing
  discountType: "percentage" | "fixed";
  discountValue: string;
  additionalCharges: string;

  // Client
  name: string;
  phone: string;
  email: string;
  message: string;
};