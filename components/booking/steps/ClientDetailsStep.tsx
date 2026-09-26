"use client";

import {
  Compass,
  HelpCircle,
  Mail,
  MapPin,
  Megaphone,
  PartyPopper,
  Phone,
  Search,
  Share2,
  User,
  Users,
} from "lucide-react";

import Card from "@/components/ui/Card";

import type { BookingFormData } from "../types";

type ClientDetailsStepProps = {
  formData: BookingFormData;
  updateField: <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) => void;
};

const REFERRAL_OPTIONS = [
  {
    id: "Social Media",
    label: "Social Media",
    subLabel: "Instagram, Facebook, TikTok",
    icon: Share2,
  },
  {
    id: "Friend / Referral",
    label: "Friend / Family",
    subLabel: "Word of mouth recommendation",
    icon: Users,
  },
  {
    id: "Search Engine",
    label: "Google / Search",
    subLabel: "Online search engine",
    icon: Search,
  },
  {
    id: "Past Event",
    label: "Past Event",
    subLabel: "Attended a previous event",
    icon: PartyPopper,
  },
  {
    id: "Advertisement",
    label: "Ad / Expo",
    subLabel: "Banner, flyer, event expo",
    icon: Megaphone,
  },
  {
    id: "Other",
    label: "Other Source",
    subLabel: "Custom source",
    icon: HelpCircle,
  },
];

export default function ClientDetailsStep({
  formData,
  updateField,
}: ClientDetailsStepProps) {
  return (
    <div className="space-y-6">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Client Details
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Tell us how we can contact you about your event.
        </p>
      </div>

      {/* ============================================================
          CONTACT INFORMATION
      ============================================================ */}
      <Card>
        <div className="space-y-6 p-3">
          {/* Section Heading */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              Contact Information
            </h3>

            <p className="mt-1 max-w-xl text-sm leading-5 text-neutral-500">
              Please provide your contact details so our team can follow up
              with your event estimate.
            </p>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* FULL NAME */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Full Name <span className="text-neutral-500">*</span>
              </label>

              <div className="relative">
                <User
                  size={18}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                  className="h-14 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b49a6a] focus:ring-1 focus:ring-[#b49a6a]"
                />
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Phone Number <span className="text-neutral-500">*</span>
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="Enter your phone number"
                  required
                  className="h-14 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b49a6a] focus:ring-1 focus:ring-[#b49a6a]"
                />
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Email Address <span className="text-neutral-500">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="Enter your email address"
                  required
                  className="h-14 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b49a6a] focus:ring-1 focus:ring-[#b49a6a]"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================================
          EVENT ADDRESS
      ============================================================ */}
      <Card>
        <div className="space-y-5 p-3">
          {/* Section Heading */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              Event Address
            </h3>

            <p className="mt-1 text-sm leading-5 text-neutral-500">
              Please provide the complete address where the event will take
              place.
            </p>
          </div>

          {/* Address Field */}
          <div className="relative">
            <MapPin
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-3 top-4 text-neutral-400"
            />

            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={(event) =>
                updateField("address", event.target.value)
              }
              placeholder="Enter the complete event address..."
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm leading-5 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b49a6a] focus:ring-1 focus:ring-[#b49a6a]"
            />
          </div>
        </div>
      </Card>

      {/* ============================================================
          HOW DID YOU HEAR ABOUT US? (REFERRAL SOURCE)
      ============================================================ */}
      <Card>
        <div className="space-y-4 p-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass size={20} className="text-[#b49a6a]" />
              <h3 className="text-lg font-medium text-neutral-900">
                How Did You Hear About Us?
              </h3>
            </div>

            <p className="mt-1 text-sm leading-5 text-neutral-500">
              How did you first find out about our event management services?
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {REFERRAL_OPTIONS.map((source) => {
              const Icon = source.icon;
              const isSelected = formData.referralSource === source.id;

              return (
                <button
                  type="button"
                  key={source.id}
                  onClick={() => updateField("referralSource", source.id)}
                  className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                    isSelected
                      ? "border-[#b49a6a] bg-[#faf6f0] text-neutral-900 ring-2 ring-[#b49a6a]/20 shadow-xs"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-[#b49a6a] text-white"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      <Icon size={18} />
                    </span>

                    <input
                      type="radio"
                      name="referralSource"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 text-[#b49a6a] focus:ring-[#b49a6a]"
                    />
                  </div>

                  <p className="mt-3 text-xs font-bold text-neutral-900">
                    {source.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 line-clamp-1">
                    {source.subLabel}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom text field if 'Other' is selected */}
          {formData.referralSource === "Other" && (
            <div className="mt-3">
              <label
                htmlFor="customReferral"
                className="mb-1.5 block text-xs font-semibold text-neutral-700"
              >
                Please specify how you heard about us:
              </label>
              <input
                id="customReferral"
                type="text"
                placeholder="e.g. Local magazine, corporate partner, radio ad..."
                value={formData.customReferral || ""}
                onChange={(event) =>
                  updateField("customReferral", event.target.value)
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-[#b49a6a] focus:ring-1 focus:ring-[#b49a6a]"
              />
            </div>
          )}
        </div>
      </Card>

      {/* ============================================================
          PRIVACY / CONTACT NOTE
      ============================================================ */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-sm leading-6 text-neutral-600">
          Your contact information will be used only to communicate with you
          regarding your event and estimate.
        </p>
      </div>
    </div>
  );
}