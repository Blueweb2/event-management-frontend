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
      padding="md"
      title="Event Details"
      description="Tell us the basic details of your event."
      className="border-[#e8e1d8] shadow-sm"
    >
      <div className="space-y-5">
        {/* Event Name */}
        <Input
          id="eventName"
          label="Event Name"
          placeholder="e.g. Annual Corporate Gala"
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
            className="mb-1.5 block text-sm font-semibold text-[#29241f]"
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
            className="h-11 w-full rounded-xl border border-[#d8cfc4] bg-white px-3.5 text-sm font-medium text-[#29241f] outline-none transition-all duration-200 focus:border-[#b49a6a] focus:ring-2 focus:ring-[#b49a6a]/20 shadow-2xs"
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
        <div className="grid gap-4 sm:grid-cols-2">
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
          helperText="Guest count helps determine quantities and staffing requirements for the selected services."
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

        {/* Event Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-semibold text-[#29241f]"
          >
            Event Description
            <span className="ml-1 text-[#b8894b]">*</span>
          </label>

          <textarea
            id="description"
            rows={4}
            placeholder="Describe your event, including the theme, special requirements, or any other details..."
            value={formData.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            required
            className="w-full resize-none rounded-xl border border-[#d8cfc4] bg-white p-3.5 text-sm text-[#29241f] placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#b49a6a] focus:ring-2 focus:ring-[#b49a6a]/20 shadow-2xs"
          />
        </div>
      </div>
    </Card>
  );
}