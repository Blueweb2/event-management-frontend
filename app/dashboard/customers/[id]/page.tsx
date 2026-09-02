import CustomerActions from "@/components/dashboard/customers/CustomerActions";
import CustomerDetailsHeader from "@/components/dashboard/customers/CustomerDetailsHeader";
import CustomerOverviewStats from "@/components/dashboard/customers/CustomerOverviewStats";
import CustomerBookingHistory from "@/components/dashboard/customers/CustomerBookingHistory";
import CustomerContactCard from "@/components/dashboard/customers/CustomerContactCard";
import CustomerNotes from "@/components/dashboard/customers/CustomerNotes";
import CustomerActivityTimeline from "@/components/dashboard/customers/CustomerActivityTimeline";

import {
  customers,
  customerBookings,
} from "@/components/dashboard/customers/constants";

import { customerActivities } from "@/components/dashboard/customers/customerActivity";

interface CustomerDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailsPage({
  params,
}: CustomerDetailsPageProps) {
  const { id } = await params;

  const customer = customers.find(
    (customer) => customer.id === id,
  );

  /*
   * Customer not found
   */
  if (!customer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-[#e8e1d8] bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
            <span className="text-lg font-semibold">!</span>
          </div>

          <h1 className="mt-5 text-xl font-semibold text-[#29241f]">
            Customer Not Found
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8d847b]">
            The customer you are looking for does not exist or
            may have been removed.
          </p>

          <a
            href="/dashboard/customers"
            className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full bg-[#b8894b] px-5 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
          >
            View Customers
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Actions */}
      <CustomerActions
        customerId={customer.id}
        phone={customer.phone}
        email={customer.email}
      />

      {/* Customer Header */}
      <CustomerDetailsHeader
        customer={customer}
      />

      {/* Customer Overview Stats */}
      <CustomerOverviewStats
        customer={customer}
        totalSpent={160000}
        upcomingEvents={1}
      />

      {/* Booking History + Contact */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <CustomerBookingHistory
          bookings={customerBookings}
        />

        <CustomerContactCard
          customer={customer}
        />
      </div>

      {/* Customer Notes */}
      <CustomerNotes />

      {/* Activity Timeline */}
      <CustomerActivityTimeline
        activities={customerActivities}
      />
    </div>
  );
}