import ServiceList from "@/components/manager/services/ServiceList";

export default function ManagerServicesPage() {
  return (
    <main className="min-h-screen bg-[var(--ivory)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ServiceList />
      </div>
    </main>
  );
}