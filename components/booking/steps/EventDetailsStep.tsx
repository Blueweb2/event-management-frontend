import { useState, useEffect, useRef, useMemo } from "react";
import {
  Clock3,
  MapPin,
  Users,
  Sparkles,
  Plus,
  Minus,
  Building2,
  Search,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

import Input from "@/components/ui/Input";
import DatePicker from "@/components/common/DatePicker";
import EventTypeSelect from "./EventTypeSelect";
import type { BookingFormData } from "../types";
import { getServices } from "@/lib/services.api";
import type { Service } from "@/types/service";
import {
  parse12HourComponents,
  build24HourFrom12,
  formatTime24to12,
} from "@/lib/time-utils";

interface VenueOption {
  id: string;
  name: string;
  city?: string;
  price?: number;
  isBackend?: boolean;
}

const CURATED_VENUES: VenueOption[] = [
  { id: "v-1", name: "Nilambur Convention Centre", city: "Nilambur" },
  { id: "v-2", name: "Calicut Trade Centre", city: "Kozhikode" },
  { id: "v-3", name: "Lulu International Convention Centre", city: "Thrissur" },
  { id: "v-4", name: "Grand Hyatt Bolgatty", city: "Kochi" },
  { id: "v-5", name: "Manjeri Town Hall & Auditorium", city: "Manjeri, Malappuram" },
  { id: "v-6", name: "Gokulam Convention Center", city: "Kaloor, Kochi" },
  { id: "v-7", name: "Apsara Convention Centre", city: "Kozhikode" },
  { id: "v-8", name: "Flora Convention Centre", city: "Perinthalmanna" },
  { id: "v-9", name: "Woodbine Convention Centre", city: "Nilambur" },
  { id: "v-10", name: "Leela Palace", city: "Bangalore / Kovalam" },
  { id: "v-11", name: "Al Saj Convention Centre", city: "Kazhakkoottam, Trivandrum" },
  { id: "v-12", name: "Taj Malabar Resort & Spa", city: "Willingdon Island, Kochi" },
  { id: "v-13", name: "Kottakkal Arya Vaidya Sala Hall", city: "Kottakkal, Malappuram" },
  { id: "v-14", name: "Rose Lounge & Banquet", city: "Kozhikode" },
];

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
  const [backendVenues, setBackendVenues] = useState<Service[]>([]);
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const venueComboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    getServices()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          const venues = data.filter(
            (s) => s.category?.toLowerCase() === "venue" && s.active
          );
          setBackendVenues(venues);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend venues:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close venue dropdown on outside click or tap
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        venueComboboxRef.current &&
        !venueComboboxRef.current.contains(e.target as Node)
      ) {
        setIsVenueDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Merge backend venues and curated venues
  const allVenues = useMemo<VenueOption[]>(() => {
    const backendList: VenueOption[] = backendVenues.map((v) => ({
      id: v._id || v.name,
      name: v.name,
      city: v.description?.slice(0, 32) || "Registered Venue",
      price: v.basePrice,
      isBackend: true,
    }));

    const names = new Set(backendList.map((b) => b.name.toLowerCase().trim()));
    const remainingCurated = CURATED_VENUES.filter(
      (c) => !names.has(c.name.toLowerCase().trim())
    );

    return [...backendList, ...remainingCurated];
  }, [backendVenues]);

  const searchQuery = formData.location.trim().toLowerCase();

  const filteredVenues = useMemo(() => {
    if (!searchQuery) {
      return allVenues.slice(0, 8);
    }
    return allVenues.filter(
      (v) =>
        v.name.toLowerCase().includes(searchQuery) ||
        (v.city && v.city.toLowerCase().includes(searchQuery))
    );
  }, [allVenues, searchQuery]);

  const hasExactMatch = allVenues.some(
    (v) => v.name.toLowerCase().trim() === searchQuery
  );

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
        <EventTypeSelect
          id="eventType"
          value={formData.eventType}
          onChange={(val) => updateField("eventType", val)}
          required
        />

        {/* Date & Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker
            id="eventDate"
            label="Event Date"
            value={formData.eventDate}
            onChange={(selectedDate) =>
              updateField("eventDate", selectedDate)
            }
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

        {/* Location / Venue - Spread Search */}
        <div ref={venueComboboxRef} className="relative space-y-1.5">
          <Input
            id="location"
            label="Event Venue / Location"
            placeholder="Type venue name or location "
            value={formData.location}
            onChange={(event) => {
              updateField("location", event.target.value);
              if (!isVenueDropdownOpen) setIsVenueDropdownOpen(true);
            }}
            onFocus={() => setIsVenueDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsVenueDropdownOpen(false);
              } else if (e.key === "Enter") {
                if (isVenueDropdownOpen) {
                  e.preventDefault();
                  if (filteredVenues.length > 0 && !formData.location.trim()) {
                    updateField("location", filteredVenues[0].name);
                  }
                  setIsVenueDropdownOpen(false);
                }
              }
            }}
            leftIcon={<Search size={18} />}
            rightElement={
              <div className="flex items-center gap-1">
                {formData.location && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField("location", "");
                    }}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Clear location"
                    aria-label="Clear location"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsVenueDropdownOpen((prev) => !prev)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  title="Toggle venue search"
                  aria-label="Toggle venue search"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isVenueDropdownOpen ? "rotate-180 text-[#9A7B4F]" : ""
                    }`}
                  />
                </button>
              </div>
            }
            helperText="Search across in-house & regional convention centres or type any custom hall/city."
            required
            autoComplete="off"
          />

          {/* Spread Search Dropdown Panel */}
          {isVenueDropdownOpen && (
            <div
              role="listbox"
              className="absolute z-40 left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto rounded-xl border border-[#e8e1d8] bg-white shadow-xl p-1.5 focus:outline-none transition-all"
            >
              {/* Custom Location Option (when text typed does not match exact venue) */}
              {formData.location.trim() && !hasExactMatch && (
                <div className="mb-1 p-1 border-b border-[#f0eae1]">
                  <button
                    type="button"
                    onClick={() => setIsVenueDropdownOpen(false)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg text-left bg-[#fcfaf7] hover:bg-[#f5efe6] border border-dashed border-[#d8cfc4] text-[#6B5B95] font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} className="text-[#9A7B4F] shrink-0" />
                      <span className="truncate">
                        Use custom location: <strong className="text-[#29241f]">&quot;{formData.location.trim()}&quot;</strong>
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] text-gray-500 bg-white border border-[#e8e1d8] px-1.5 py-0.5 rounded font-semibold">
                      Custom
                    </span>
                  </button>
                </div>
              )}

              {/* Spread Search Header */}
              <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>
                  {searchQuery
                    ? `Matching Venues (${filteredVenues.length})`
                    : `Venues & Convention Centres (${allVenues.length})`}
                </span>
                <span className="text-[10px] font-normal text-gray-400">
                  {searchQuery ? "Click to pick" : "Type to filter"}
                </span>
              </div>

              {filteredVenues.length === 0 ? (
                <div className="py-4 px-3 text-center text-xs text-gray-500">
                  <p className="font-medium text-gray-700">No matching venues found</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Press Enter or click outside to keep &quot;{formData.location}&quot; as your custom location.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5 mt-1">
                  {filteredVenues.map((venue) => {
                    const isSelected =
                      formData.location.trim().toLowerCase() ===
                      venue.name.toLowerCase();

                    return (
                      <button
                        key={venue.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          updateField("location", venue.name);
                          setIsVenueDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                          isSelected
                            ? "bg-[#6B5B95]/10 text-[#6B5B95] font-medium"
                            : "text-[#29241f] hover:bg-[#fcfaf7]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              venue.isBackend
                                ? "bg-[#6B5B95]/10 text-[#6B5B95]"
                                : "bg-[#9A7B4F]/10 text-[#9A7B4F]"
                            }`}
                          >
                            <Building2 size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#29241f] truncate flex items-center gap-1.5">
                              <span>{venue.name}</span>
                              {venue.isBackend && (
                                <span className="rounded bg-[#6B5B95]/15 px-1.5 py-0.2 text-[9px] font-semibold text-[#6B5B95]">
                                  Registered
                                </span>
                              )}
                            </div>
                            {venue.city && (
                              <div className="text-[11px] text-gray-400 truncate flex items-center gap-1">
                                <MapPin size={10} className="shrink-0" />
                                <span>{venue.city}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {venue.price && venue.price > 0 && (
                            <span className="text-[11px] font-semibold text-[#9A7B4F]">
                              ₹{venue.price.toLocaleString("en-IN")}/day
                            </span>
                          )}
                          {isSelected && (
                            <Check size={14} className="text-[#6B5B95] shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Event Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#29241f]"
          >
            Event Notes &amp; Setup Requirements
            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
          </label>

          <textarea
            id="description"
            rows={4}
            placeholder="Enter client theme, special instructions, decor preferences, floor plan requirements, or coordinator notes..."
            value={formData.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            className="w-full resize-none rounded-2xl border border-[#d8cfc4] bg-white p-3.5 text-sm text-[#29241f] placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/20 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}