import {
  get,
  post,
  put,
  patch,
  del,
} from "@/lib/api";
import type { FoodMenuSelection } from "./food.api";

// ==========================================
// Types
// ==========================================

export interface EventClient {
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

export interface BookingServiceSnapshot {
  _id?: string;
  serviceId: string | { _id: string; name?: string };
  optionId?: string | null;
  serviceName: string;
  category: string;
  description?: string;
  quantity: number;
  pricingType: string;
  unitLabel?: string;
  unitPrice: number;
  total: number;
}

export interface EventBooking {
  _id: string;

  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  location: string;

  description?: string;

  services?: BookingServiceSnapshot[];
  foodMenu?: FoodMenuSelection;

  subtotal?: number;
  discountAmount?: number;
  additionalCharges?: number;
  gstRate?: number;
  gstAmount?: number;

  total?: number;
  currency?: string;

  status:
    | "Pending"
    | "Confirmed"
    | "Rejected"
    | "Cancelled";
}

export type EventStatus =
  | "CONFIRMED"
  | "READY_TO_START"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "Upcoming"
  | "Ongoing"
  | "Completed"
  | "Cancelled"
  | "Invoiced"
  | "Settled";

export interface Event {
  _id: string;

  client: EventClient | string;

  booking: EventBooking | string;

  eventName: string;
  eventType: string;

  eventDate: string;
  eventTime: string;

  guests: number;

  location: string;

  description: string;

  status: EventStatus;

  notes?: string;

  startedAt?: string | null;
  startedBy?:
    | {
        _id: string;
        name: string;
        email?: string;
        role?: string;
      }
    | string
    | null;

  completedAt?: string | null;
  completedBy?:
    | {
        _id: string;
        name: string;
        email?: string;
      }
    | string
    | null;

  invoicedAt?: string | null;
  invoicedBy?:
    | {
        _id: string;
        name: string;
        email?: string;
      }
    | string
    | null;

  createdBy?:
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
      }
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface GetEventsParams {
  search?: string;
  status?: EventStatus | "";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface GetEventsResponse {
  success: boolean;
  message?: string;

  data: Event[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetEventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

export interface CreateEventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

export interface UpdateEventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

// ==========================================
// Create Event
// ==========================================

export function createEvent(
  bookingId: string,
  token?: string
): Promise<CreateEventResponse> {
  return post<CreateEventResponse>(
    "/events",
    {
      bookingId,
    },
    token
  );
}

// ==========================================
// Get Events
// ==========================================

export function getEvents(
  params: GetEventsParams = {},
  token?: string
): Promise<GetEventsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status
    );
  }

  if (params.startDate) {
    searchParams.set(
      "startDate",
      params.startDate
    );
  }

  if (params.endDate) {
    searchParams.set(
      "endDate",
      params.endDate
    );
  }

  if (params.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page)
    );
  }

  if (params.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit)
    );
  }

  const queryString =
    searchParams.toString();

  const endpoint = queryString
    ? `/events?${queryString}`
    : "/events";

  return get<GetEventsResponse>(
    endpoint,
    token
  );
}

// ==========================================
// Get Event By ID
// ==========================================

export function getEventById(
  eventId: string,
  token?: string
): Promise<GetEventResponse> {
  return get<GetEventResponse>(
    `/events/${eventId}`,
    token
  );
}

// ==========================================
// Update Event
// ==========================================

export function updateEvent(
  eventId: string,
  data: Partial<{
    eventName: string;
    eventType: string;
    eventDate: string;
    eventTime: string;
    guests: number;
    location: string;
    description: string;
    notes: string;
  }>,
  token?: string
): Promise<UpdateEventResponse> {
  return put<UpdateEventResponse>(
    `/events/${eventId}`,
    data,
    token
  );
}

// ==========================================
// Update Event Status
// ==========================================

export function updateEventStatus(
  eventId: string,
  status: EventStatus,
  token?: string
): Promise<UpdateEventResponse> {
  return patch<UpdateEventResponse>(
    `/events/${eventId}/status`,
    {
      status,
    },
    token
  );
}

// ==========================================
// Start Event (Manager Action)
// ==========================================

export function startEvent(
  eventId: string,
  token?: string
): Promise<UpdateEventResponse> {
  return patch<UpdateEventResponse>(
    `/events/${eventId}/start`,
    {},
    token
  );
}

// ==========================================
// Cancel Event
// ==========================================

export function cancelEvent(
  eventId: string,
  token?: string
): Promise<UpdateEventResponse> {
  return del<UpdateEventResponse>(
    `/events/${eventId}`,
    token
  );
}

// ==========================================
// Get Event Activity Timeline
// ==========================================

export function getEventActivityTimeline(
  eventId: string,
  token?: string
): Promise<{ success: boolean; data: { eventId: string; eventName: string; activities: any[] } }> {
  return get<{ success: boolean; data: { eventId: string; eventName: string; activities: any[] } }>(
    `/events/${eventId}/activity-timeline`,
    token
  );
}