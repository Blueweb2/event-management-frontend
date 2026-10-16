import { Suspense } from "react";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";

export default function ManagerBookingPage() {
  return (
    <div className="space-y-6">
      <BookingHeader />
      <Suspense
        fallback={
          <div className="rounded-2xl border border-[#e8e1d8] bg-white p-12 text-center text-sm text-[#756d64]">
            Loading proposal workflow...
          </div>
        }
      >
        <BookingForm />
      </Suspense>
    </div>
  );
}
