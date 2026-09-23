export interface Expense {
  _id: string;
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
