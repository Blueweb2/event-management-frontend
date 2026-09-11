import SettingsHeader from "@/components/manager/settings/SettingsHeader";
import ProfileSettings from "@/components/manager/settings/ProfileSettings";
import BusinessSettings from "@/components/manager/settings/BusinessSettings";
import NotificationSettings from "@/components/manager/settings/NotificationSettings";
import BookingSettings from "@/components/manager/settings/BookingSettings";
import SecuritySettings from "@/components/manager/settings/SecuritySettings";

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