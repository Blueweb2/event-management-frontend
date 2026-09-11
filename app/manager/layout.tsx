import ManagerLayout from "@/components/manager/layout/ManagerLayout";

interface ManagerRootLayoutProps {
  children: React.ReactNode;
}

export default function ManagerRootLayout({
  children,
}: ManagerRootLayoutProps) {
  return <ManagerLayout>{children}</ManagerLayout>;
}