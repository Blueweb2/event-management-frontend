"use client";

import { useState } from "react";
import { User } from "lucide-react";

export default function ProfileSettings() {
  const [name, setName] = useState("Manager");
  const [email, setEmail] = useState("manager@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");

  const handleSave = () => {
    console.log({
      name,
      email,
      phone,
    });
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
            value={name}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
            Phone Number
          </label>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-[#b8894b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
        >
          Save Profile
        </button>
      </div>
    </section>
  );
}