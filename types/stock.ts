export type StockCategory =
  | "Crockery"
  | "Glassware"
  | "Cutlery"
  | "Furniture"
  | "Audio/Visual"
  | "Linen"
  | "Kitchen Equipment"
  | "Decor"
  | "Lighting"
  | "Other";

export type EventStockStatus =
  | "PLANNED"
  | "RESERVED"
  | "READY_FOR_COLLECTION"
  | "TAKEN_BY_STAFF"
  | "AT_EVENT"
  | "RETURN_PENDING"
  | "RETURNED"
  | "VERIFIED"
  | "DISCREPANCY"
  | "CLOSED";

export type StockMovementStatus =
  | "ASSIGNED"
  | "TAKEN"
  | "IN_USE"
  | "RETURN_PENDING"
  | "RETURNED"
  | "VERIFIED"
  | "DISCREPANCY"
  | "CLOSED";

export type StockTransactionType =
  | "CREATED"
  | "ADDED"
  | "ADJUSTED"
  | "RESERVED"
  | "UNRESERVED"
  | "TAKEN"
  | "RETURNED"
  | "DAMAGED"
  | "LOST"
  | "VERIFIED"
  | "DISCREPANCY_RESOLVED";

export interface StockItem {
  _id: string;
  name: string;
  sku?: string;
  category: StockCategory;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  inUseQuantity: number;
  damagedQuantity: number;
  lostQuantity: number;
  minStockLevel: number;
  unit: string;
  unitPrice: number;
  location: string;
  description?: string;
  createdBy?: { _id: string; name: string; email: string };
  updatedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface EventStockAllocation {
  _id: string;
  event:
    | string
    | {
        _id: string;
        eventName: string;
        eventDate: string;
        eventTime?: string;
        location?: string;
        status?: string;
        client?: { name: string; phone?: string };
      };
  booking?: string;
  stockItem: StockItem;
  requiredQuantity: number;
  reservedQuantity: number;
  takenQuantity: number;
  returnedQuantity: number;
  damagedQuantity: number;
  lostQuantity: number;
  assignedStaff?: {
    _id: string;
    name: string;
    email: string;
    role?: string;
    phone?: string;
  } | null;
  status: EventStockStatus;
  expectedReturnAt?: string;
  approvedReturnedQuantity?: number;
  approvedDamagedQuantity?: number;
  approvedLostQuantity?: number;
  managerNotes?: string;
  takeNotes?: string;
  returnNotes?: string;
  damagedReason?: string;
  lostReason?: string;
  discrepancyNotes?: string;
  resolutionNotes?: string;
  assignedBy?: { _id: string; name: string; email: string };
  assignedAt?: string;
  takenAt?: string;
  returnedAt?: string;
  verifiedAt?: string;
  verifiedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  _id: string;
  event: string | { _id: string; eventName: string; eventDate: string; location?: string };
  stockItem: StockItem;
  eventStock?: string;
  assignedStaff: string | { _id: string; name: string; email: string };
  expectedQuantity: number;
  takenQuantity: number;
  returnedQuantity: number;
  damagedQuantity: number;
  lostQuantity: number;
  status: StockMovementStatus;
  takenAt?: string;
  returnedAt?: string;
  verifiedAt?: string;
  takenBy?: { _id: string; name: string };
  returnedBy?: { _id: string; name: string };
  verifiedBy?: { _id: string; name: string };
  takeNotes?: string;
  returnNotes?: string;
  damagedReason?: string;
  lostReason?: string;
  discrepancyNotes?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  _id: string;
  stockItem: StockItem | { _id: string; name: string; category: string; unit: string };
  event?: { _id: string; eventName: string; eventDate: string; location?: string } | null;
  movement?: string | null;
  type: StockTransactionType;
  quantity: number;
  previousAvailable: number;
  newAvailable: number;
  previousTotal: number;
  newTotal: number;
  performedBy?: { _id: string; name: string; email: string; role?: string };
  notes?: string;
  createdAt: string;
}

export interface StaffStockSummary {
  activeEventsCount: number;
  itemsInPossession: number;
  returnsPending: number;
  readyToCollect: number;
  allocations: EventStockAllocation[];
}

export interface ManagerStockSummary {
  totalItems: number;
  lowStockCount: number;
  lowStockItems: StockItem[];
  pendingReturnsCount: number;
  pendingReturns: EventStockAllocation[];
  activeAllocationsCount: number;
  activeAllocations: EventStockAllocation[];
}

export type EventStock = EventStockAllocation & {
  eventId?: any;
  stockItemId?: any;
  notes?: string;
};

