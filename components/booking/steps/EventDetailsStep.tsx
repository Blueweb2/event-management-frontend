import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";

import Input from "@/components/ui/Input";
import { eventTypeOptions } from "../constants";
import type { BookingFormData } from "../types";
import {
  parse12HourComponents,
  build24HourFrom12,
  formatTime24to12,
} from "@/lib/time-utils";

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
  const { hour: timeHour, minute: timeMinute, ampm: timeAmpm } =
    parse12HourComponents(formData.eventTime);

  const standardMinutes = [
    "00", "05", "10", "15", "20", "25",
    "30", "35", "40", "45", "50", "55",
  ];
  const minuteOptions =
    timeMinute && !standardMinutes.includes(timeMinute)
      ? [...standardMinutes, timeMinute].sort(
          (a, b) => parseInt(a, 10) - parseInt(b, 10),
        )
      : standardMinutes;

  const handleHourChange = (newHour: string) => {
    if (!newHour) {
      updateField("eventTime", "");
      return;
    }
    const min = timeMinute || "00";
    const ampm = timeAmpm || "PM";
    updateField("eventTime", build24HourFrom12(newHour, min, ampm));
  };

  const handleMinuteChange = (newMin: string) => {
    const hr = timeHour || "6";
    const ampm = timeAmpm || "PM";
    updateField("eventTime", build24HourFrom12(hr, newMin, ampm));
  };

  const handleAmpmChange = (newAmpm: "AM" | "PM") => {
    const hr = timeHour || "6";
    const min = timeMinute || "00";
    updateField("eventTime", build24HourFrom12(hr, min, newAmpm));
  };
  return (
    <div className="rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-8 shadow-xs">
      {/* Step Header */}
      <div className="mb-6 flex items-start gap-3 border-b border-[#eee7dc] pb-5">
       
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#29241f]">
            Event Information
          </h2>
     
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

          {/* 12-Hour Event Time Input with AM/PM selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="eventTimeHour"
                className="text-xs sm:text-sm font-semibold text-[#29241f] flex items-center gap-1"
              >
                Event Time
                <span className="text-[#b8894b]">*</span>
              </label>
              {formData.eventTime && (
                <span className="text-[11px] font-bold text-[#9A6C37] bg-[#B8894B]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock3 size={11} />
                  {formatTime24to12(formData.eventTime)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 rounded-2xl border border-[#e8e1d8] bg-white p-1.5 shadow-2xs focus-within:border-[#b8894b] focus-within:ring-2 focus-within:ring-[#b8894b]/20 transition-all">
              <div className="flex items-center justify-center pl-2 pr-1 text-[#756d64]">
                <Clock3 size={18} />
              </div>

              {/* Hour Dropdown (1-12) */}
              <div className="flex-1 min-w-[70px]">
                <select
                  id="eventTimeHour"
                  value={timeHour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className="w-full rounded-xl bg-[#fcfaf7] px-2.5 py-2 text-xs sm:text-sm font-bold text-[#29241f] border border-[#eee7dc] focus:bg-white focus:outline-none transition cursor-pointer"
                >
                  <option value="">Hour</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-sm font-bold text-[#756d64]">:</span>

              {/* Minute Dropdown */}
              <div className="flex-1 min-w-[70px]">
                <select
                  id="eventTimeMinute"
                  value={timeMinute}
                  onChange={(e) => handleMinuteChange(e.target.value)}
                  disabled={!timeHour}
                  className="w-full rounded-xl bg-[#fcfaf7] px-2.5 py-2 text-xs sm:text-sm font-bold text-[#29241f] border border-[#eee7dc] focus:bg-white focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {minuteOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM / PM Segmented Toggle */}
              <div className="inline-flex rounded-xl bg-[#f0ece4] p-1 border border-[#e8e1d8] shrink-0">
                <button
                  type="button"
                  onClick={() => handleAmpmChange("AM")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    timeAmpm === "AM" && formData.eventTime
                      ? "bg-white text-[#29241f] shadow-xs"
                      : "text-[#756d64] hover:text-[#29241f]"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleAmpmChange("PM")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    timeAmpm === "PM" && formData.eventTime
                      ? "bg-[#b8894b] text-white shadow-xs"
                      : "text-[#756d64] hover:text-[#29241f]"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Hidden input for form submission and selector compatibility */}
            <input
              type="hidden"
              id="eventTime"
              name="eventTime"
              value={formData.eventTime}
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div className="rounded-2xl border border-[#e8e1d8] bg-[#fcfaf7] p-4 sm:p-5 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label
              htmlFor="guests"
              className="text-xs sm:text-sm font-semibold text-[#29241f] flex items-center gap-1"
            >
              Estimated Number of Guests
              <span className="text-[#b8894b]">*</span>
            </label>

            {(() => {
              const count = parseInt(formData.guests, 10);
              if (!count || count <= 0) return null;
              if (count <= 50)
                return (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
                    <Sparkles size={11} className="text-amber-600" />
                    Intimate Gathering
                  </span>
                );
              if (count <= 150)
                return (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
                    <Sparkles size={11} className="text-emerald-600" />
                    Medium Event
                  </span>
                );
              if (count <= 400)
                return (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200/60">
                    <Sparkles size={11} className="text-blue-600" />
                    Large Celebration
                  </span>
                );
              if (count <= 800)
                return (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-800 border border-purple-200/60">
                    <Sparkles size={11} className="text-purple-600" />
                    Grand Scale Gala
                  </span>
                );
              return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200/60">
                  <Sparkles size={11} className="text-rose-600" />
                  Mega Event
                </span>
              );
            })()}
          </div>

          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-[#8d847b]">
              <Users size={18} />
            </div>

            <input
              id="guests"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 250"
              value={formData.guests}
              onChange={(event) => {
                const val = event.target.value.replace(/\D/g, "");
                updateField("guests", val);
              }}
              onFocus={(event) => event.target.select()}
              required
              className="h-12 w-full rounded-xl border border-[#d8cfc4] bg-white pl-10 pr-24 text-sm font-medium text-[#29241f] placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/20 shadow-2xs"
            />

            {/* Stepper Buttons */}
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const curr = parseInt(formData.guests, 10) || 0;
                  const next = Math.max(1, curr - 25);
                  updateField("guests", String(next));
                }}
                disabled={!formData.guests || Number(formData.guests) <= 1}
                aria-label="Decrease guest count by 25"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e0d6c8] bg-[#f9f6f0] text-[#5c544a] hover:bg-[#eee6d8] hover:text-[#29241f] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Minus size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const curr = parseInt(formData.guests, 10) || 0;
                  const next = curr + 25;
                  updateField("guests", String(next));
                }}
                aria-label="Increase guest count by 25"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e0d6c8] bg-[#f9f6f0] text-[#5c544a] hover:bg-[#eee6d8] hover:text-[#29241f] active:scale-95 transition-all"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Quick Preset Chips */}
          {/* <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#8d847b] font-medium mr-1">Quick Select:</span>
            {[50, 100, 200, 350, 500, 1000].map((preset) => {
              const isSelected = formData.guests === String(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateField("guests", String(preset))}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? "bg-[#29241f] text-white shadow-xs scale-105"
                      : "bg-white border border-[#e0d6c8] text-[#5c544a] hover:border-[#9A7B4F] hover:text-[#29241f]"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div> */}

          <p className="mt-2.5 text-xs text-[#756d64]">
            Guest count is used to calculate per-guest services, catering quantities, and staff allocations.
          </p>
        </div>

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
            Event Notes &amp; Setup Requirements
            <span className="ml-1 text-[#b8894b]">*</span>
          </label>

          <textarea
            id="description"
            rows={4}
            placeholder="Enter client theme, special instructions, decor preferences, floor plan requirements, or coordinator notes..."
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