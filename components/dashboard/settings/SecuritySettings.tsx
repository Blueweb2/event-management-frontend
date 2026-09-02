"use client";

import { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(false);

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    console.log("Password change requested");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <ShieldCheck size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#29241f]">
              Security
            </h2>

            <p className="text-sm text-[#9b938a]">
              Manage your password and account security.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound
              size={17}
              className="text-[#a7773f]"
            />

            <h3 className="text-sm font-semibold text-[#403a34]">
              Change Password
            </h3>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Current password"
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="New password"
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
            />

            <button
              type="button"
              onClick={handlePasswordChange}
              className="rounded-xl border border-[#b8894b] px-5 py-2.5 text-sm font-semibold text-[#9a6c37] transition hover:bg-[#f7efe4]"
            >
              Update Password
            </button>
          </div>
        </div>

        <div className="border-t border-[#eee8e1] pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#403a34]">
                Two-Factor Authentication
              </p>

              <p className="mt-1 text-xs leading-5 text-[#9b938a]">
                Add an additional security layer to your account.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={twoFactorEnabled}
              onClick={() =>
                setTwoFactorEnabled(!twoFactorEnabled)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                twoFactorEnabled
                  ? "bg-[#b8894b]"
                  : "bg-[#d9d0c7]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  twoFactorEnabled
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}