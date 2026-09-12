import { post, patch } from "@/lib/api";

// ==========================================
// Types
// ==========================================

export interface BookingService {
  serviceId: string;
  optionId?: string | null;
  quantity?: number;
}

// ==========================================
// Create Booking Payload
// ==========================================

export interface CreateBookingPayload {
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  location: string;
  description: string;

  // Client details
  name: string;
  phone: string;
  email: string;
  message?: string;

  // Selected services
  services: BookingService[];

  // Pricing
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  additionalCharges?: number;
}

// ==========================================
// Client
// ==========================================

export interface BookingClient {
  _id: string;
  name: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// ==========================================
// Booking Service Snapshot
// ==========================================

export interface BookingServiceSnapshot {
  _id: string;
  serviceId: string;
  optionId?: string | null;

  serviceName: string;
  category: string;
  description: string;

  quantity: number;

  pricingType:
    | "FIXED"
    | "PER_GUEST"
    | "PER_UNIT"
    | "PER_HOUR"
    | "PER_DAY"
    | "PER_STAFF"
    | "PER_REEL";

  unitLabel: string;
  unitPrice: number;
  total: number;
}

// ==========================================
// Booking
// ==========================================

export interface Booking {
  _id: string;

  client: BookingClient | string;

  eventName: string;
  eventType: string;

  eventDate: string;
  eventTime: string;

  guests: number;

  location: string;
  description: string;

  message: string;

  services: BookingServiceSnapshot[];

  subtotal: number;

  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;

  additionalCharges: number;

  total: number;

  currency: string;

  status:
    | "Pending"
    | "Confirmed"
    | "Rejected"
    | "Cancelled";

  createdBy?: string | null;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Event Returned After Confirmation
// ==========================================

export interface ConfirmedEvent {
  _id: string;

  client: BookingClient | string;

  booking: string;

  eventName: string;
  eventType: string;

  eventDate: string;
  eventTime: string;

  guests: number;

  location: string;
  description: string;

  status:
    | "Upcoming"
    | "Ongoing"
    | "Completed"
    | "Cancelled";

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// API Responses
// ==========================================

export interface CreateBookingResponse {
  success: boolean;
  message: string;

  data: {
    booking: Booking;
  };
}

export interface ConfirmBookingResponse {
  success: boolean;
  message: string;

  data: {
    booking: Booking;
    event: ConfirmedEvent;
  };
}

// ==========================================
// Create Booking
// ==========================================

export const createBooking = async (
  payload: CreateBookingPayload
): Promise<CreateBookingResponse> => {
  return post<CreateBookingResponse>(
    "/bookings",
    payload
  );
};

// ==========================================
// Confirm Booking
// ==========================================

export const confirmBooking = async (
  bookingId: string,
  token?: string
): Promise<ConfirmBookingResponse> => {
  return patch<ConfirmBookingResponse>(
    `/bookings/${bookingId}/confirm`,
    undefined,
    token
  );
};