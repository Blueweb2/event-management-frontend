export type PricingType =
  | "FIXED"
  | "PER_GUEST"
  | "PER_UNIT"
  | "PER_HOUR"
  | "PER_DAY"
  | "PER_STAFF"
  | "PER_REEL";

export type ServiceOption = {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  pricingType: PricingType;
  unitLabel?: string;
  active: boolean;
};

export type Service = {
  _id: string;
  name: string;
  category: string;
  description?: string;
  pricingType: PricingType;
  basePrice: number;
  unitLabel?: string;
  options: ServiceOption[];
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateServiceData = {
  name: string;
  category: string;
  description?: string;
  pricingType: PricingType;
  basePrice: number;
  unitLabel?: string;
  options?: ServiceOption[];
  sortOrder?: number;
};

export type UpdateServiceData = Partial<CreateServiceData> & {
  active?: boolean;
};