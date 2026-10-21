"use client";

import UnifiedExpensesSection from "@/components/manager/expenses/UnifiedExpensesSection";

export default function ExpensesPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <UnifiedExpensesSection showHeader showStats />
    </div>
  );
}