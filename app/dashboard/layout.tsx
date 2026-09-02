import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardBottomNav from "@/components/dashboard/DashboardBottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fbf6ef]">
      {/* Main dashboard area */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8">
        <DashboardHeader role="manager" />

        <main className="mt-6">{children}</main>
      </div>

      {/* Mobile navigation */}
      <DashboardBottomNav role="manager" />
    </div>
  );
}