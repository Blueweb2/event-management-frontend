import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Sparkles,
  FileText,
} from "lucide-react";

import Input from "@/components/ui/Input";
import { eventTypeOptions } from "../constants";
import type { BookingFormData } from "../types";

interface EventDetailsStepProps {
  formData: BookingFormData;
  updateField: (
    field: keyof BookingFormData,
    value: string,
  ) => void;
}

export default function EventDetailsStep({
  formData,
  updateField,
}: EventDetailsStepProps) {
  return (
    <div className="rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-8 shadow-xs">
      {/* Step Header */}
      <div className="mb-6 flex items-start gap-3 border-b border-[#eee7dc] pb-5">
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[#29241f] text-white shrink-0 shadow-xs">
          <FileText size={18} className="text-[#d8a86c]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#29241f]">
            Event Core Details
          </h2>
          <p className="mt-0.5 text-xs text-[#756d64]">
            Tell us the occasion, expected guests, venue, and timing.
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Event Name */}
        <Input
          id="eventName"
          label="Event Name"
          placeholder="e.g. Annual Corporate Gala / Sharma Wedding"
          value={formData.eventName}
          onChange={(event) =>
            updateField(
              "eventName",
              event.target.value,
            )
          }
          required
        />

        {/* Event Type */}
        <div>
          <label
            htmlFor="eventType"
            className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#29241f]"
          >
            Event Type
            <span className="ml-1 text-[#b8894b]">*</span>
          </label>

          <select
            id="eventType"
            value={formData.eventType}
            onChange={(event) =>
              updateField(
                "eventType",
                event.target.value,
              )
            }
            required
            className="h-12 w-full rounded-2xl border border-[#d8cfc4] bg-white px-3.5 text-sm font-medium text-[#29241f] outline-none transition-all duration-200 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/20 shadow-2xs cursor-pointer"
          >
            <option value="">Select event type</option>
            {eventTypeOptions.map((eventType) => {
              const value = eventType
                .toLowerCase()
                .replace(/\s+/g, "-");

              return (
                <option
                  key={eventType}
                  value={value}
                >
                  {eventType}
                </option>
              );
            })}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="eventDate"
            label="Event Date"
            type="date"
            value={formData.eventDate}
            onChange={(event) =>
              updateField(
                "eventDate",
                event.target.value,
              )
            }
            leftIcon={<CalendarDays size={18} />}
            required
          />

          <Input
            id="eventTime"
            label="Event Time"
            type="time"
            value={formData.eventTime}
            onChange={(event) =>
              updateField(
                "eventTime",
                event.target.value,
              )
            }
            leftIcon={<Clock3 size={18} />}
            required
          />
        </div>

        {/* Guests */}
        <Input
          id="guests"
          label="Estimated Number of Guests"
          type="number"
          min="1"
          placeholder="e.g. 250"
          value={formData.guests}
          onChange={(event) =>
            updateField(
              "guests",
              event.target.value,
            )
          }
          leftIcon={<Users size={18} />}
          helperText="Guest count helps calculate per-guest services and staffing requirements."
          required
        />

        {/* Location */}
        <Input
          id="location"
          label="Event Venue / Location"
          placeholder="Enter venue name, hall, or complete location"
          value={formData.location}
          onChange={(event) =>
            updateField(
              "location",
              event.target.value,
            )
          }
          leftIcon={<MapPin size={18} />}
          helperText="Enter the resort, banquet hall, or destination."
          required
        />

        {/* Event Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#29241f]"
          >
            Event Description & Vision
            <span className="ml-1 text-[#b8894b]">*</span>
          </label>

          <textarea
            id="description"
            rows={4}
            placeholder="Describe your event theme, special preferences, setup style, or specific requirements..."
            value={formData.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            required
            className="w-full resize-none rounded-2xl border border-[#d8cfc4] bg-white p-3.5 text-sm text-[#29241f] placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/20 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}