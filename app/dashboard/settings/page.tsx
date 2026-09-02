import SettingsHeader from "@/components/dashboard/settings/SettingsHeader";
import ProfileSettings from "@/components/dashboard/settings/ProfileSettings";
import BusinessSettings from "@/components/dashboard/settings/BusinessSettings";
import NotificationSettings from "@/components/dashboard/settings/NotificationSettings";
import BookingSettings from "@/components/dashboard/settings/BookingSettings";
import SecuritySettings from "@/components/dashboard/settings/SecuritySettings";

export default function SettingsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <SettingsHeader />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileSettings />
        <BusinessSettings />
      </div>

      <NotificationSettings />

      <BookingSettings />

      <SecuritySettings />
    </div>
  );
}