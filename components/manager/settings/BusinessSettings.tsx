"use client";

import { useState, useEffect } from "react";
import { Building2, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "antigravity_business_settings";

export default function BusinessSettings() {
  const [businessName, setBusinessName] = useState("Elegant Events");
  const [email, setEmail] = useState("hello@elegantevents.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("Kochi, Kerala");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.address) setAddress(parsed.address);
      }
    } catch {}
  }, []);

  const handleSave = () => {
    const payload = {
      businessName: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setMessage("Business information saved successfully.");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("Failed to save business information.");
    }
  };

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <Building2 size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#29241f]">
              Business Information
            </h2>

            <p className="text-sm text-[#9b938a]">
              Manage your event business details for invoice exports and branding.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
            Business Name
          </label>

          <input
            value={businessName}
            onChange={(e) =>
              setBusinessName(e.target.value)
            }
            type="text"
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
              Business Email
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
              Business Phone
            </label>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
            Address
          </label>

          <textarea
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            rows={3}
            className="w-full resize-none rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 py-3 text-sm outline-none focus:border-[#b8894b]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[#b8894b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a7773f] transition"
          >
            Save Business Details
          </button>
          {message && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#557555]">
              <CheckCircle2 size={15} />
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}