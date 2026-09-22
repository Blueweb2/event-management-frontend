export interface FoodMenuItem {
  _id?: string;
  name: string;
  category: string;
  rate: number;
  quantity?: number;
  description?: string;
  isVegetarian?: boolean;
}

export interface FoodMenu {
  included: boolean;
  items: FoodMenuItem[];
}
