import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CustomerStats from "@/components/dashboard/customers/CustomerStats";
import CustomerFilters from "@/components/dashboard/customers/CustomerFilters";
import CustomersTable from "@/components/dashboard/customers/CustomersTable";
import CustomerCard from "@/components/dashboard/customers/CustomerCard";

import { customers } from "@/components/dashboard/customers/constants";

export default function CustomersPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <DashboardHeader role="manager" />

      {/* Customer Statistics */}
      <CustomerStats />

      {/* Search & Filters */}
      <CustomerFilters />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <CustomersTable />
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
          />
        ))}
      </div>
    </div>
  );
}