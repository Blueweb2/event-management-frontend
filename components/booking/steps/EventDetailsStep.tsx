import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import {
  eventTypeOptions,
} from "../constants";

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
    <Card
      title="Event Details"
      description="Tell us the basic details of your event."
      className="border-[#e8e1d8] shadow-sm"
    >
      <div className="space-y-6">
        {/* Event Type */}
        <div>
          <label
            htmlFor="eventType"
            className="mb-2 block text-sm font-semibold text-[#403a34]"
          >
            Event Type
            <span className="ml-1 text-[#b8894b]">
              *
            </span>
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
            className={[
              "w-full rounded-xl border bg-white px-4 py-3",
              "text-sm text-[#403a34]",
              "outline-none transition-all duration-200",
              "border-[#d9d0c6]",
              "focus:border-[#b8894b]",
              "focus:ring-2 focus:ring-[#b8894b]/15",
            ].join(" ")}
          >
            <option value="">
              Select event type
            </option>

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
        <div className="grid gap-5 sm:grid-cols-2">
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
            leftIcon={
              <CalendarDays size={18} />
            }
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
          label="Number of Guests"
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
          helperText="Food quantities and staff requirements will be planned based on your guest count."
          required
        />

        {/* Location */}
        <Input
          id="location"
          label="Event Location"
          placeholder="Enter venue or event location"
          value={formData.location}
          onChange={(event) =>
            updateField(
              "location",
              event.target.value,
            )
          }
          leftIcon={<MapPin size={18} />}
          helperText="Enter the venue name, hall, or complete event location."
          required
        />
      </div>
    </Card>
  );
}