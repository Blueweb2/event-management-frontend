// types/event.ts

export type EventStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface EventCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
}

export interface EventStaff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AssignedStaff {
  staff: EventStaff;
  status: "Pending" | "Confirmed";
}

export interface ManagerEvent {
  _id: string;
  name: string;
  type: string;
  customer?: EventCustomer | null;
  date: string;
  time: string;
  location: string;
  guests: number;
  package: string;
  amount: number;
  status: EventStatus;
  description?: string;
  assignedStaff?: AssignedStaff[];
}