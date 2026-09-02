export type ExpenseStatus = "Paid" | "Pending";

export type PaymentMethod =
  | "Cash"
  | "Bank Transfer"
  | "UPI"
  | "Card"
  | "Other";

export type ExpenseCategory =
  | "Food"
  | "Decoration"
  | "Staff"
  | "Transport"
  | "Venue"
  | "Equipment"
  | "Other";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  event: string;
  date: string;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  description: string;
}

export const expenseCategories: ExpenseCategory[] = [
  "Food",
  "Decoration",
  "Staff",
  "Transport",
  "Venue",
  "Equipment",
  "Other",
];

export const paymentMethods: PaymentMethod[] = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Card",
  "Other",
];

export const expenseStatuses: ExpenseStatus[] = [
  "Paid",
  "Pending",
];

export const expenses: Expense[] = [
  {
    id: "EXP-001",
    title: "Decoration Materials",
    category: "Decoration",
    amount: 35000,
    event: "Wedding Celebration",
    date: "Sep 10, 2026",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    description:
      "Flowers, stage decoration materials, lighting accessories, and setup items.",
  },
  {
    id: "EXP-002",
    title: "Catering Supplies",
    category: "Food",
    amount: 28000,
    event: "Wedding Celebration",
    date: "Sep 11, 2026",
    paymentMethod: "UPI",
    status: "Paid",
    description:
      "Vegetables, rice, spices, dairy products, and other catering supplies.",
  },
  {
    id: "EXP-003",
    title: "Staff Payment",
    category: "Staff",
    amount: 18000,
    event: "Birthday Celebration",
    date: "Sep 14, 2026",
    paymentMethod: "Cash",
    status: "Paid",
    description:
      "Event staff payment for setup, guest coordination, and service.",
  },
  {
    id: "EXP-004",
    title: "Transport Charges",
    category: "Transport",
    amount: 7500,
    event: "Corporate Conference",
    date: "Sep 17, 2026",
    paymentMethod: "Bank Transfer",
    status: "Pending",
    description:
      "Transportation for event equipment and staff.",
  },
  {
    id: "EXP-005",
    title: "Venue Equipment Rental",
    category: "Equipment",
    amount: 22000,
    event: "Corporate Conference",
    date: "Sep 16, 2026",
    paymentMethod: "Card",
    status: "Paid",
    description:
      "Projector, microphones, speakers, and conference equipment rental.",
  },
  {
    id: "EXP-006",
    title: "Venue Advance",
    category: "Venue",
    amount: 40000,
    event: "Engagement Ceremony",
    date: "Sep 19, 2026",
    paymentMethod: "Bank Transfer",
    status: "Pending",
    description:
      "Advance payment made toward the engagement venue.",
  },
  {
    id: "EXP-007",
    title: "Flower Arrangement",
    category: "Decoration",
    amount: 12500,
    event: "Engagement Ceremony",
    date: "Sep 20, 2026",
    paymentMethod: "UPI",
    status: "Paid",
    description:
      "Fresh flowers and table arrangements.",
  },
  {
    id: "EXP-008",
    title: "Cleaning Service",
    category: "Staff",
    amount: 6000,
    event: "Birthday Celebration",
    date: "Sep 15, 2026",
    paymentMethod: "Cash",
    status: "Paid",
    description:
      "Pre-event and post-event cleaning service.",
  },
];

export const expenseStats = {
  total: expenses.length,
  totalAmount: expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  ),
  paidAmount: expenses
    .filter((expense) => expense.status === "Paid")
    .reduce((total, expense) => total + expense.amount, 0),
  pendingAmount: expenses
    .filter((expense) => expense.status === "Pending")
    .reduce((total, expense) => total + expense.amount, 0),
};