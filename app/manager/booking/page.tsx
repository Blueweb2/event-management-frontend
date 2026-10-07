import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";

export default function ManagerBookingPage() {
  return (
    <div className="space-y-6">
      <BookingHeader />
      <BookingForm />
    </div>
  );
}
