import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <BookingHeader />

        <BookingForm />
      </div>
    </main>
  );
}