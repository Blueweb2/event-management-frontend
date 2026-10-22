import { get, ApiResponse } from "./api";

export interface DepartmentStaffMember {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  location: string;
  status: "AVAILABLE" | "ON_LEAVE" | "ASSIGNED_OTHER" | "ASSIGNED_THIS_EVENT" | "ASSIGNED";
  statusLabel: string;
  statusReason: string;
  isAvailable: boolean;
}

export interface StaffingStream {
  streamId: string;
  streamType: "CATERING" | "SERVICE" | "OPERATIONS";
  title: string;
  department: string;
  category: string;
  description: string;
  specDetails: {
    guests?: number;
    servingType?: string;
    ratePerGuest?: number;
    totalFoodAmount?: number;
    itemsCount?: number;
    items?: Array<{
      _id?: string;
      name: string;
      category: string;
      dietary: string;
      quantity?: number;
      rate?: number;
      amount?: number;
    }>;
    quantity?: number;
    pricingType?: string;
    unitLabel?: string;
    unitPrice?: number;
    total?: number;
    location?: string;
  };
  recommendedStaffCount: number;
  allocatedCount: number;
  assignedDuties: Array<{
    _id: string;
    dutyTitle: string;
    role?: string;
    startTime: string;
    endTime: string;
    status: string;
    staff?: {
      _id: string;
      name: string;
      email: string;
      department?: string;
    };
  }>;
  departmentStaff: DepartmentStaffMember[];
}

export interface DepartmentSummaryItem {
  department: string;
  total: number;
  available: number;
  onLeave: number;
  assigned: number;
  staff: DepartmentStaffMember[];
}

export interface EventStaffingResponse {
  event: {
    id: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    eventTime: string;
    guests: number;
    location: string;
    status: string;
    client?: {
      _id: string;
      name: string;
      phone: string;
      email: string;
    };
    hasCatering: boolean;
    foodMenu?: {
      included: boolean;
      servingType: string;
      ratePerGuest: number;
      totalFoodAmount: number;
      notes: string;
      items: Array<{
        name: string;
        category: string;
        dietary: string;
        quantity: number;
        rate: number;
        amount: number;
      }>;
    };
    servicesCount: number;
  };
  targetDate: string;
  staffingStreams: StaffingStream[];
  departmentSummary: DepartmentSummaryItem[];
  allStaffPool: DepartmentStaffMember[];
}

export interface DateAvailabilityResponse {
  date: string;
  totalStaff: number;
  availableStaff: number;
  onLeaveStaff: number;
  assignedStaff: number;
  departments: DepartmentSummaryItem[];
  staff: DepartmentStaffMember[];
}

/**
 * Get dynamic event staffing requirements & department availability for an event
 */
export async function getEventStaffingRequirements(
  eventId: string,
  token?: string
): Promise<ApiResponse<EventStaffingResponse>> {
  return get<ApiResponse<EventStaffingResponse>>(
    `/departments/event-staffing/${eventId}`,
    token
  );
}

/**
 * Get organization-wide department availability for a given date
 */
export async function getDepartmentAvailability(
  date?: string,
  token?: string
): Promise<ApiResponse<DateAvailabilityResponse>> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return get<ApiResponse<DateAvailabilityResponse>>(
    `/departments/availability${query}`,
    token
  );
}

// ==========================================
// DEPARTMENT WORKFLOW INTERFACES
// ==========================================

export interface MyDepartmentInfo {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  department: string;
  normalizedDepartment: string;
  permissions: string[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isOperationsManager: boolean;
}

export interface KitchenMenuItem {
  _id?: string;
  foodItemId?: string;
  name: string;
  category: string;
  dietary: string;
  rate?: number;
  quantity?: number;
  hasRecipe?: boolean;
  recipeId?: string;
  ingredientsCount?: number;
}

export interface KitchenEventItem {
  id: string;
  eventId: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  location: string;
  status: string;
  client?: {
    name: string;
    phone: string;
    email: string;
  };
  foodMenu: {
    included: boolean;
    servingType: string;
    ratePerGuest: number;
    notes: string;
    totalItems: number;
    items: KitchenMenuItem[];
  };
  dietarySummary: {
    veg: number;
    nonVeg: number;
    vegan: number;
    egg: number;
  };
}

export interface RecipeIngredient {
  name: string;
  quantityPerServing: number;
  unit: string;
  stockItem?: string;
  notes?: string;
}

export interface RecipeItem {
  _id: string;
  foodItem?: {
    _id: string;
    name: string;
    category: string;
    dietary: string;
    defaultRate: number;
  };
  foodItemName: string;
  category: string;
  yieldServings: number;
  defaultWastagePercent: number;
  ingredients: RecipeIngredient[];
  preparationSteps?: Array<{ stepNumber: number; instruction: string }>;
  notes?: string;
}

export interface CalculatedIngredient {
  name: string;
  unit: string;
  requiredQuantity: number;
  availableQuantity: number | null;
  shortageQuantity: number | null;
  hasShortage: boolean;
  hasStockMapping?: boolean;
  isUnitCompatible?: boolean;
  unitMismatchWarning?: string | null;
  stockItemId?: string | null;
  stockItemName?: string | null;
  stockItemUnit?: string | null;
  stockItemAvailableQuantity?: number | null;
  status?: "SUFFICIENT" | "SHORTAGE" | "UNIT_MISMATCH" | "UNMAPPED";
  statusLabel?: string;
  usedInMenuItems: string[];
}

export interface IngredientCalculationResult {
  eventId: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  guests: number;
  configuredWastagePercent: number;
  hasFoodMenu: boolean;
  totalMenuItems: number;
  missingRecipesCount: number;
  missingRecipes: Array<{
    foodItemId?: string;
    name: string;
    category: string;
    reason: string;
  }>;
  perItemCalculations?: Array<{
    name: string;
    category?: string;
    hasRecipe?: boolean;
    recipeId?: string;
    yieldServings?: number;
    ingredients: Array<{
      name: string;
      unit: string;
      perGuestQuantity?: number;
      baseQuantity?: number;
      wastagePercent?: number;
      requiredQuantity: number;
      availableQuantity?: number | null;
      shortageQuantity?: number | null;
      hasShortage?: boolean;
      status?: string;
      notes?: string;
    }>;
  }>;
  aggregatedIngredients: CalculatedIngredient[];
  shortages: CalculatedIngredient[];
  hasAnyShortage: boolean;
  calculatedAt: string;
}

export interface PurchaseRequestPayload {
  eventId?: string;
  items: Array<{
    itemName: string;
    requiredQuantity: number;
    availableQuantity: number;
    shortageQuantity: number;
    unit: string;
    estimatedCost?: number;
    urgency?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    stockItem?: string;
    notes?: string;
  }>;
  notes?: string;
}

export interface PurchaseRequestRecord {
  _id: string;
  department: string;
  status: "PENDING" | "APPROVED" | "ORDERED" | "FULFILLED" | "REJECTED";
  notes?: string;
  items: Array<{
    _id: string;
    itemName: string;
    requiredQuantity: number;
    availableQuantity: number;
    shortageQuantity: number;
    unit: string;
    estimatedCost: number;
    urgency: string;
    notes?: string;
  }>;
  requestedBy?: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
  createdAt: string;
}

export interface DepartmentTask {
  id: string;
  dutyId: string;
  dutyTitle: string;
  eventId: string;
  eventName: string;
  eventDate?: string;
  staffName: string;
  department: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  plannedStartAt?: string;
  plannedEndAt?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  completionNotes?: string;
}

export interface DecorationEventItem {
  id: string;
  eventId: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  location: string;
  status: string;
  client?: {
    name: string;
    phone: string;
    email: string;
  };
  decorServices: Array<{
    serviceName: string;
    category: string;
    quantity: number;
    total: number;
    pricingType: string;
  }>;
  totalDecorServices: number;
}

export interface PhotographyEventItem {
  id: string;
  eventId: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  location: string;
  status: string;
  client?: {
    name: string;
    phone: string;
    email: string;
  };
  photoServices: Array<{
    serviceName: string;
    category: string;
    quantity: number;
    total: number;
    pricingType: string;
  }>;
}

// ==========================================
// API CLIENT FUNCTIONS
// ==========================================

import { post, patch, del } from "./api";

export async function getMyDepartmentInfo(token?: string): Promise<ApiResponse<MyDepartmentInfo>> {
  return get<ApiResponse<MyDepartmentInfo>>("/departments/my-info", token);
}

// Kitchen
export async function getKitchenEvents(
  params?: { search?: string; status?: string },
  token?: string
): Promise<ApiResponse<KitchenEventItem[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  const qStr = query.toString() ? `?${query.toString()}` : "";
  return get<ApiResponse<KitchenEventItem[]>>(`/departments/kitchen/events${qStr}`, token);
}

export async function getKitchenEventDetail(
  eventId: string,
  token?: string
): Promise<ApiResponse<KitchenEventItem>> {
  return get<ApiResponse<KitchenEventItem>>(`/departments/kitchen/events/${eventId}`, token);
}

export async function getRecipes(
  params?: { search?: string; category?: string },
  token?: string
): Promise<ApiResponse<RecipeItem[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category) query.append("category", params.category);
  const qStr = query.toString() ? `?${query.toString()}` : "";
  return get<ApiResponse<RecipeItem[]>>(`/departments/kitchen/recipes${qStr}`, token);
}

export async function upsertRecipe(
  data: Partial<RecipeItem>,
  token?: string
): Promise<ApiResponse<RecipeItem>> {
  return post<ApiResponse<RecipeItem>>("/departments/kitchen/recipes", data, token);
}

export async function calculateKitchenIngredients(
  eventId: string,
  wastagePercent: number = 5,
  token?: string
): Promise<ApiResponse<IngredientCalculationResult>> {
  return get<ApiResponse<IngredientCalculationResult>>(
    `/departments/kitchen/calculate/${eventId}?wastageAllowancePercent=${wastagePercent}`,
    token
  );
}

export async function createKitchenPurchaseRequest(
  payload: PurchaseRequestPayload,
  token?: string
): Promise<ApiResponse<PurchaseRequestRecord>> {
  return post<ApiResponse<PurchaseRequestRecord>>(
    "/departments/kitchen/purchase-requests",
    payload,
    token
  );
}

export async function getKitchenPurchaseRequests(
  status?: string,
  token?: string
): Promise<ApiResponse<PurchaseRequestRecord[]>> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return get<ApiResponse<PurchaseRequestRecord[]>>(
    `/departments/kitchen/purchase-requests${query}`,
    token
  );
}

export async function getKitchenTasks(
  eventId?: string,
  token?: string
): Promise<ApiResponse<DepartmentTask[]>> {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  return get<ApiResponse<DepartmentTask[]>>(`/departments/kitchen/tasks${query}`, token);
}

export async function createKitchenTask(
  payload: {
    eventId: string;
    title: string;
    description?: string;
    dutyTitle?: string;
    plannedStartAt?: string;
    plannedEndAt?: string;
  },
  token?: string
): Promise<ApiResponse<DepartmentTask>> {
  return post<ApiResponse<DepartmentTask>>("/departments/kitchen/tasks", payload, token);
}

export async function updateKitchenTaskStatus(
  dutyId: string,
  taskId: string,
  payload: { status: string; notes?: string },
  token?: string
): Promise<ApiResponse<DepartmentTask>> {
  return patch<ApiResponse<DepartmentTask>>(
    `/departments/kitchen/tasks/${dutyId}/${taskId}/status`,
    payload,
    token
  );
}

export async function deleteKitchenTask(
  dutyId: string,
  taskId: string,
  token?: string
): Promise<ApiResponse<{ message: string; taskId: string }>> {
  return del<ApiResponse<{ message: string; taskId: string }>>(
    `/departments/kitchen/tasks/${dutyId}/${taskId}`,
    token
  );
}

// Decoration
export async function getDecorationEvents(
  params?: { search?: string; status?: string },
  token?: string
): Promise<ApiResponse<DecorationEventItem[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  const qStr = query.toString() ? `?${query.toString()}` : "";
  return get<ApiResponse<DecorationEventItem[]>>(`/departments/decoration/events${qStr}`, token);
}

export async function getDecorationMaterials(
  eventId: string,
  token?: string
): Promise<ApiResponse<{ eventId: string; eventName: string; materials: any[] }>> {
  return get<ApiResponse<{ eventId: string; eventName: string; materials: any[] }>>(
    `/departments/decoration/materials/${eventId}`,
    token
  );
}

export async function createDecorationPurchaseRequest(
  payload: PurchaseRequestPayload,
  token?: string
): Promise<ApiResponse<PurchaseRequestRecord>> {
  return post<ApiResponse<PurchaseRequestRecord>>(
    "/departments/decoration/purchase-requests",
    payload,
    token
  );
}

export async function getDecorationTasks(
  eventId?: string,
  token?: string
): Promise<ApiResponse<DepartmentTask[]>> {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  return get<ApiResponse<DepartmentTask[]>>(`/departments/decoration/tasks${query}`, token);
}

export async function createDecorationTask(
  payload: {
    eventId: string;
    title: string;
    description?: string;
    dutyTitle?: string;
  },
  token?: string
): Promise<ApiResponse<DepartmentTask>> {
  return post<ApiResponse<DepartmentTask>>("/departments/decoration/tasks", payload, token);
}

// Photography
export async function getPhotographyEvents(
  params?: { search?: string; status?: string },
  token?: string
): Promise<ApiResponse<PhotographyEventItem[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  const qStr = query.toString() ? `?${query.toString()}` : "";
  return get<ApiResponse<PhotographyEventItem[]>>(`/departments/photography/events${qStr}`, token);
}

export async function getPhotographyEquipment(
  token?: string
): Promise<ApiResponse<any[]>> {
  return get<ApiResponse<any[]>>("/departments/photography/equipment", token);
}

export async function getPhotographyTasks(
  eventId?: string,
  token?: string
): Promise<ApiResponse<DepartmentTask[]>> {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  return get<ApiResponse<DepartmentTask[]>>(`/departments/photography/tasks${query}`, token);
}

export async function createPhotographyTask(
  payload: {
    eventId: string;
    title: string;
    description?: string;
    dutyTitle?: string;
  },
  token?: string
): Promise<ApiResponse<DepartmentTask>> {
  return post<ApiResponse<DepartmentTask>>("/departments/photography/tasks", payload, token);
}

