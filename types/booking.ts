export type {
  BookingService,
  CreateBookingPayload,
  CreateBookingResponse,
  ConfirmBookingResponse,
} from "@/lib/booking.api";

export type BookingStatus = "Pending" | "Confirmed" | "Rejected" | "Cancelled";
