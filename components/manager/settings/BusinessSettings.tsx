"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

export default function BusinessSettings() {
  const [businessName, setBusinessName] = useState(
    "Elegant Events"
  );

  const [email, setEmail] = useState(
    "hello@elegantevents.com"
  );

  const [phone, setPhone] = useState(
    "+91 98765 43210"
  );

  const [address, setAddress] = useState(
    "Kochi, Kerala"
  );

  const handleSave = () => {
    console.log({
      businessName,
      email,
      phone,
      address,
    });
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
              Manage your event business details.
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

        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-[#b8894b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a7773f]"
        >
          Save Business Details
        </button>
      </div>
    </section>
  );
}