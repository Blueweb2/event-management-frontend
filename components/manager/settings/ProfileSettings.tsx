"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateMyProfile } from "@/lib/user.api";

export default function ProfileSettings() {
  const { user, token, setAuth } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!token || !(name || user?.name || "").trim()) return;

    try {
      setSaving(true);
      const updatedUser = await updateMyProfile(
        {
          name: (name || user?.name || "").trim(),
          phone: (phone || user?.phone || "").trim(),
          location: (location || user?.location || "").trim(),
        },
        token,
      );
      setAuth(token, updatedUser);
      setName(updatedUser.name);
      setPhone(updatedUser.phone || "");
      setLocation(updatedUser.location || "");
      setMessage("Profile saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <User size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#29241f]">
              Profile
            </h2>

            <p className="text-sm text-[#9b938a]">
              Manage your personal account information.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
            Full Name
          </label>

          <input
            value={name || user?.name || ""}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
            Email Address
          </label>

          <input
            value={user?.email || ""}
            type="email"
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#f3f0eb] px-3 text-sm text-[#756d64] outline-none"
            disabled
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
            Phone Number
          </label>

          <input
            value={phone || user?.phone || ""}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#403a34]">Location</label>
          <input value={location || user?.location || ""} onChange={(e) => setLocation(e.target.value)} type="text" className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10" />
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-xl bg-[#b8894b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {message && <p role="status" className="text-xs font-medium text-[#557555]">{message}</p>}
      </div>
    </section>
  );
}