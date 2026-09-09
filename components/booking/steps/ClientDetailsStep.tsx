"use client";

import {
  Mail,
  MessageSquare,
  Phone,
  User,
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

export default function ClientDetailsStep({
  formData,
  updateField,
}: ClientDetailsStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Client Details
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Tell us how we can contact you about your event.
        </p>
      </div>

      {/* Contact Information */}
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              Contact Information
            </h3>

            <p className="mt-1 max-w-xl text-sm leading-5 text-neutral-500">
              Please provide your contact details so our team can follow up
              with your event estimate.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}
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

            {/* Phone */}
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

            {/* Email */}
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

      {/* Additional Requirements */}
      <Card>
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              Additional Requirements
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Share anything else you'd like our team to know.
            </p>
          </div>

          <div className="relative">
            <MessageSquare
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-3 top-4 text-neutral-400"
            />

            <textarea
              id="message"
              value={formData.message}
              onChange={(event) =>
                updateField("message", event.target.value)
              }
              placeholder="Tell us about any special requirements, preferences, or questions..."
              rows={5}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-11 py-3 text-sm leading-5 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b49a6a] focus:ring-1 focus:ring-[#b49a6a]"
            />
          </div>
        </div>
      </Card>

      {/* Privacy / Contact Note */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-sm leading-6 text-neutral-600">
          Your contact information will be used only to communicate with you
          regarding your event and estimate.
        </p>
      </div>
    </div>
  );
}