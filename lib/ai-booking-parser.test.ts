import test from "node:test";
import assert from "node:assert/strict";
import {
  parseBookingVoiceText,
  normalizeDateString,
  extractValidIndianPhoneNumber,
  isValidDate,
  type ExtractedBookingFields,
} from "./ai-booking-parser.ts";
import {
  formatTime24to12,
  formatTime12to24,
  parse12HourComponents,
  build24HourFrom12,
} from "./time-utils.ts";

test("Scenario 1: Main Sample Wedding Request", async () => {
  const sample =
    "Book a luxury wedding for Rahul and Priya on 25th November 2026 at Grand Palace, Bangalore. Around 350 guests from 6 PM. Client phone 9876543210, email rahul@gmail.com. We need stage lighting, floral decor, photography, and buffet catering.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Wedding");
  assert.equal(result.data.eventDate, "2026-11-25");
  assert.equal(result.data.eventTime, "18:00");
  assert.equal(result.data.guests, "350");
  assert.equal(result.data.location, "Grand Palace, Bangalore");
  assert.equal(result.data.name, "Rahul and Priya");
  assert.equal(result.data.phone, "9876543210");
  assert.equal(result.data.email, "rahul@gmail.com");
  assert.equal(result.data.eventName, "Rahul & Priya Wedding");
  assert.equal(result.data.cateringIncluded, true);
  assert.equal(result.data.cateringServingType, "PER_GUEST");

  assert.ok(result.data.requestedServices?.includes("Stage & Ambient Lighting"));
  assert.ok(result.data.requestedServices?.includes("Stage & Floral Decoration"));
  assert.ok(result.data.requestedServices?.includes("Photography & Videography"));
  assert.ok(result.data.requestedServices?.includes("Catering & Food Experience"));

  assert.ok(result.confidence >= 0.85);
  assert.ok(result.detectedFields.includes("Event Name"));
  assert.ok(result.detectedFields.includes("Phone"));
  assert.ok(result.detectedFields.includes("Guest Count"));
});

test("Scenario 2: Corporate Conference", async () => {
  const sample =
    "Corporate annual conference for TechNova Corp on December 15th 2026 at Leela Palace. 200 attendees from 9 AM. Contact person Amit Sharma, phone 9811223344. Needs sound system and LED wall.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Conference");
  assert.equal(result.data.eventDate, "2026-12-15");
  assert.equal(result.data.eventTime, "09:00");
  assert.equal(result.data.guests, "200");
  assert.equal(result.data.location, "Leela Palace");
  assert.equal(result.data.name, "Amit Sharma");
  assert.equal(result.data.phone, "9811223344");
  assert.ok(result.data.eventName?.includes("Conference") || result.data.eventName?.includes("TechNova"));
  assert.ok(result.data.requestedServices?.includes("Pro Sound System & DJ"));
  assert.ok(result.data.requestedServices?.includes("Stage & Ambient Lighting"));
});

test("Scenario 3: Birthday Celebration", async () => {
  const sample =
    "Birthday celebration for Aarav turning 10 on October 28th 2026 at Palm Gardens. 80 guests at 5 PM. Client Priya Patel, phone 9898765432. Include buffet catering and DJ.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Birthday Celebration");
  assert.equal(result.data.eventDate, "2026-10-28");
  assert.equal(result.data.eventTime, "17:00");
  assert.equal(result.data.guests, "80");
  assert.equal(result.data.location, "Palm Gardens");
  assert.equal(result.data.name, "Priya Patel");
  assert.equal(result.data.phone, "9898765432");
  assert.equal(result.data.cateringIncluded, true);
  assert.equal(result.data.cateringServingType, "PER_GUEST");
  assert.ok(result.data.requestedServices?.includes("Pro Sound System & DJ"));
});

test("Scenario 4: Missing Contact Information", async () => {
  const sample =
    "Looking to organize a private dinner party on 20th November 2026 at Taj Gateway for 25 guests at 8 PM. Needs floral decor.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Private Dinner");
  assert.equal(result.data.eventDate, "2026-11-20");
  assert.equal(result.data.eventTime, "20:00");
  assert.equal(result.data.guests, "25");
  assert.equal(result.data.location, "Taj Gateway");

  // Contact must NOT be invented
  assert.equal(result.data.name, undefined);
  assert.equal(result.data.phone, undefined);
  assert.equal(result.data.email, undefined);

  // Missing fields list must explicitly report missing contact
  assert.ok(result.missingFields.includes("Client Name"));
  assert.ok(result.missingFields.includes("Phone"));
});

test("Scenario 5: Invalid Date and Invalid Phone Number Handling", async () => {
  // 31st February is invalid, and phone 12345 or 1234567890 are invalid
  assert.equal(isValidDate(2026, 1, 31), false);
  assert.equal(normalizeDateString("31st February 2026"), null);
  assert.equal(normalizeDateString("February 31, 2026"), null);

  assert.equal(extractValidIndianPhoneNumber("call 12345"), null);
  assert.equal(extractValidIndianPhoneNumber("phone 1234567890"), null); // doesn't start with 6-9
  assert.equal(extractValidIndianPhoneNumber("phone 0000000000"), null);

  const sample = "Wedding for Suresh on 31st February 2026 with phone 12345 at Grand Hall.";
  const result = await parseBookingVoiceText(sample);

  // Invalid date and phone are rejected without inventing fake values
  assert.equal(result.data.eventDate, undefined);
  assert.equal(result.data.phone, undefined);
  assert.equal(result.data.name, "Suresh");
  assert.equal(result.data.eventType, "Wedding");
});

test("Scenario 6: Gibberish / Empty Transcript Does Not Claim Success", async () => {
  const empty = await parseBookingVoiceText("");
  assert.equal(empty.success, false);
  assert.equal(empty.confidence, 0);

  const gibberish = await parseBookingVoiceText("asdf qwerty zxcv random typing 1234567890");
  assert.equal(gibberish.success, false);
  assert.equal(gibberish.detectedFields.length, 0);
});

test("Scenario 7: Preservation of Existing Form Data", () => {
  // Emulate handleApplyAIBooking logic
  const existingFormData = {
    eventName: "Draft Event",
    eventType: "Corporate Gala",
    eventDate: "2026-11-01",
    eventTime: "10:00",
    guests: "50",
    location: "Original Office",
    description: "Original Description",
    name: "John Doe",
    phone: "9876543210",
    email: "john@doe.com",
    message: "Important VIP guests",
    address: "123 Business Park",
    referralSource: "Social Media",
    customReferral: "Instagram Ad",
    discountType: "percentage" as const,
    discountValue: "10",
    additionalCharges: "500",
    services: [
      {
        id: "svc-1",
        serviceId: "s-1",
        name: "Existing Service",
        category: "Production",
        quantity: 1,
        unitPrice: 1000,
      },
    ],
    foodMenu: {
      included: true,
      servingType: "FIXED" as const,
      ratePerGuest: 500,
      totalFoodAmount: 25000,
      notes: "Vegetarian only",
      items: [],
    },
  };

  // User speaks only date and guest count update:
  const extractedData: ExtractedBookingFields = {
    eventDate: "2026-12-25",
    guests: "120",
  };

  // Merge logic as in BookingForm.tsx
  const mergedFormData = {
    ...existingFormData,
    eventName: extractedData.eventName ? extractedData.eventName : existingFormData.eventName,
    eventType: extractedData.eventType ? extractedData.eventType : existingFormData.eventType,
    eventDate: extractedData.eventDate ? extractedData.eventDate : existingFormData.eventDate,
    eventTime: extractedData.eventTime ? extractedData.eventTime : existingFormData.eventTime,
    guests: extractedData.guests ? extractedData.guests : existingFormData.guests,
    location: extractedData.location ? extractedData.location : existingFormData.location,
    description: extractedData.description ? extractedData.description : existingFormData.description,
    name: extractedData.name ? extractedData.name : existingFormData.name,
    phone: extractedData.phone ? extractedData.phone : existingFormData.phone,
    email: extractedData.email ? extractedData.email : existingFormData.email,
    address: extractedData.address ? extractedData.address : existingFormData.address,
  };

  // Verified: Updated fields changed
  assert.equal(mergedFormData.eventDate, "2026-12-25");
  assert.equal(mergedFormData.guests, "120");

  // Verified: Unrelated existing fields preserved perfectly
  assert.equal(mergedFormData.name, "John Doe");
  assert.equal(mergedFormData.phone, "9876543210");
  assert.equal(mergedFormData.email, "john@doe.com");
  assert.equal(mergedFormData.location, "Original Office");
  assert.equal(mergedFormData.message, "Important VIP guests");
  assert.equal(mergedFormData.referralSource, "Social Media");
  assert.equal(mergedFormData.customReferral, "Instagram Ad");
  assert.equal(mergedFormData.discountValue, "10");
  assert.equal(mergedFormData.additionalCharges, "500");
  assert.equal(mergedFormData.services.length, 1);
  assert.equal(mergedFormData.foodMenu.notes, "Vegetarian only");
});

test("Scenario 8: Malayalam Wedding Request (Full Malayalam Script)", async () => {
  const sample =
    "2026 നവംബർ 25-ന് ബാംഗ്ലൂർ ഗ്രാൻഡ് പാലസിൽ വെച്ച് രാഹുലിന്റെയും പ്രിയയുടെയും കല്യാണം. വൈകുന്നേരം 6 മണി മുതൽ ഏകദേശം 350 ആളുകൾ. ക്ലയന്റ് ഫോൺ 9876543210, ഇമെയിൽ rahul@gmail.com. സ്റ്റേജ് ലൈറ്റിംഗ്, ഫ്ലോറൽ ഡെക്കറേഷൻ, ഫോട്ടോഗ്രാഫി, ബുഫെ കാറ്ററിംഗ് വേണം.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Wedding");
  assert.equal(result.data.eventDate, "2026-11-25");
  assert.equal(result.data.eventTime, "18:00");
  assert.equal(result.data.guests, "350");
  assert.ok(result.data.location?.includes("ഗ്രാൻഡ് പാലസ്"));
  assert.ok(result.data.name?.includes("രാഹുൽ") && result.data.name?.includes("പ്രിയ"));
  assert.equal(result.data.phone, "9876543210");
  assert.equal(result.data.email, "rahul@gmail.com");
  assert.equal(result.data.cateringIncluded, true);
  assert.equal(result.data.cateringServingType, "PER_GUEST");

  assert.ok(result.data.requestedServices?.includes("Stage & Ambient Lighting"));
  assert.ok(result.data.requestedServices?.includes("Stage & Floral Decoration"));
  assert.ok(result.data.requestedServices?.includes("Photography & Videography"));
  assert.ok(result.data.requestedServices?.includes("Catering & Food Experience"));
  assert.ok(result.confidence >= 0.85);
});

test("Scenario 9: Malayalam Corporate Conference Request", async () => {
  const sample =
    "2026 ഡിസംബർ 15-ന് ലീല പാലസിൽ വെച്ച് വാർഷിക സമ്മേളനം. രാവിലെ 9 മണിക്ക് 200 പേർ പങ്കെടുക്കും. ബന്ധപ്പെടേണ്ട വ്യക്തി ജോൺ, ഫോൺ 9845012345, ഇമെയിൽ john@corp.com. സൗണ്ട് സിസ്റ്റം വേണം.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Conference");
  assert.equal(result.data.eventDate, "2026-12-15");
  assert.equal(result.data.eventTime, "09:00");
  assert.equal(result.data.guests, "200");
  assert.ok(result.data.location?.includes("ലീല പാലസ്"));
  assert.equal(result.data.name, "ജോൺ");
  assert.equal(result.data.phone, "9845012345");
  assert.equal(result.data.email, "john@corp.com");
  assert.ok(result.data.requestedServices?.includes("Pro Sound System & DJ"));
});

test("Scenario 10: Malayalam Birthday with Number Words and Missing Contact Info", async () => {
  const sample =
    "2027 ജനുവരി 5-ന് കമ്മ്യൂണിറ്റി ഹാളിൽ വെച്ച് പിറന്നാൾ ആഘോഷം. വൈകുന്നേരം 4 മണിക്ക് അമ്പത് ആളുകൾ. ക്ലയന്റ് ആരവ്.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Birthday Celebration");
  assert.equal(result.data.eventDate, "2027-01-05");
  assert.equal(result.data.eventTime, "16:00");
  // Unambiguous Malayalam number word "അമ്പത്" (50)
  assert.equal(result.data.guests, "50");
  assert.ok(result.data.location?.includes("കമ്മ്യൂണിറ്റി ഹാൾ"));
  assert.equal(result.data.name, "ആരവ്");

  // Missing phone and email must not be invented
  assert.equal(result.data.phone, undefined);
  assert.equal(result.data.email, undefined);
  assert.ok(result.missingFields.includes("Phone"));
});

test("Scenario 11: Mixed Malayalam-English (Manglish) Request", async () => {
  const sample =
    "Rahul and Priya wedding on 25 November 2026 at Grand Palace, Bangalore. Around 350 perkk vaikittu 6 manikku. Contact phone 9876543210, email rahul@gmail.com. Need stage lighting, floral decoration, photography and buffet catering.";

  const result = await parseBookingVoiceText(sample);

  assert.equal(result.success, true);
  assert.equal(result.data.eventType, "Wedding");
  assert.equal(result.data.eventDate, "2026-11-25");
  assert.equal(result.data.eventTime, "18:00");
  assert.equal(result.data.guests, "350");
  assert.equal(result.data.location, "Grand Palace, Bangalore");
  assert.equal(result.data.phone, "9876543210");
  assert.equal(result.data.email, "rahul@gmail.com");
  assert.equal(result.data.cateringIncluded, true);
  assert.equal(result.data.cateringServingType, "PER_GUEST");
  assert.ok(result.data.requestedServices?.includes("Stage & Ambient Lighting"));
  assert.ok(result.data.requestedServices?.includes("Stage & Floral Decoration"));
  assert.ok(result.data.requestedServices?.includes("Photography & Videography"));
});

test("Scenario 12: Malayalam Numerals & Invalid Date Handling", async () => {
  // Test Malayalam numerals conversion
  const sampleWithNumerals = "കല്യാണം ൨൦൨൬ നവംബർ ൨൫-ന് ഫോൺ ൯൮൭൬൫൪൩൨൧൦ വേദി ലീല പാലസ്. ൩൫൦ ആളുകൾ.";
  const resultNumerals = await parseBookingVoiceText(sampleWithNumerals);

  assert.equal(resultNumerals.data.eventDate, "2026-11-25");
  assert.equal(resultNumerals.data.phone, "9876543210");
  assert.equal(resultNumerals.data.guests, "350");

  // Invalid date: 31st February in Malayalam should be rejected (returns null)
  assert.equal(normalizeDateString("31 ഫെബ്രുവരി 2026"), null);

  const invalidDateSample = "വിവാഹം 31 ഫെബ്രുവരി 2026. ഫോൺ 12345.";
  const resultInvalid = await parseBookingVoiceText(invalidDateSample);

  assert.equal(resultInvalid.data.eventDate, undefined);
  assert.equal(resultInvalid.data.phone, undefined);
});

test("Scenario 13: 12-Hour and 24-Hour Time Conversions (Midnight, Noon, Morning, Afternoon, Evening)", () => {
  // 12:00 AM <-> 00:00 (Midnight)
  assert.equal(formatTime24to12("00:00"), "12:00 AM");
  assert.equal(formatTime12to24("12:00 AM"), "00:00");
  assert.equal(formatTime12to24("12:00 am"), "00:00");

  // 12:00 PM <-> 12:00 (Noon)
  assert.equal(formatTime24to12("12:00"), "12:00 PM");
  assert.equal(formatTime12to24("12:00 PM"), "12:00");
  assert.equal(formatTime12to24("12:00 pm"), "12:00");

  // 6:30 PM <-> 18:30 (Evening)
  assert.equal(formatTime24to12("18:30"), "6:30 PM");
  assert.equal(formatTime12to24("6:30 PM"), "18:30");
  assert.equal(formatTime12to24("6:30 pm"), "18:30");

  // 9:15 AM <-> 09:15 (Morning)
  assert.equal(formatTime24to12("09:15"), "9:15 AM");
  assert.equal(formatTime12to24("9:15 AM"), "09:15");
  assert.equal(formatTime12to24("09:15 AM"), "09:15");

  // 6:00 PM <-> 18:00
  assert.equal(formatTime24to12("18:00"), "6:00 PM");
  assert.equal(formatTime12to24("6:00 PM"), "18:00");

  // 9:00 AM <-> 09:00
  assert.equal(formatTime24to12("09:00"), "9:00 AM");
  assert.equal(formatTime12to24("9:00 AM"), "09:00");

  // 2:45 PM <-> 14:45 (Afternoon)
  assert.equal(formatTime24to12("14:45"), "2:45 PM");
  assert.equal(formatTime12to24("2:45 PM"), "14:45");

  // Already 24h passthrough
  assert.equal(formatTime12to24("18:30"), "18:30");
  assert.equal(formatTime12to24("00:00"), "00:00");

  // Edge cases and empty strings
  assert.equal(formatTime24to12(""), "");
  assert.equal(formatTime24to12(null), "");
  assert.equal(formatTime12to24(""), "");
  assert.equal(formatTime12to24(null), "");
});

test("Scenario 14: Malayalam and English Voice Time Recognition", async () => {
  // English 6 PM
  const resEng1 = await parseBookingVoiceText("Booking for Rahul on 2026-11-25 at 6 PM. Phone 9876543210.");
  assert.equal(resEng1.data.eventTime, "18:00");

  // English 18:00
  const resEng2 = await parseBookingVoiceText("Conference on 2026-12-15 at 18:00. Phone 9876543210.");
  assert.equal(resEng2.data.eventTime, "18:00");

  // English 9:15 AM
  const resEng3 = await parseBookingVoiceText("Meeting on 2026-12-15 at 9:15 AM. Phone 9876543210.");
  assert.equal(resEng3.data.eventTime, "09:15");

  // Malayalam വൈകുന്നേരം 6 മണി
  const resMl1 = await parseBookingVoiceText("കല്യാണം 2026 നവംബർ 25-ന് വൈകുന്നേരം 6 മണി. ഫോൺ 9876543210.");
  assert.equal(resMl1.data.eventTime, "18:00");

  // Malayalam രാവിലെ 9 മണി
  const resMl2 = await parseBookingVoiceText("സമ്മേളനം 2026 ഡിസംബർ 15-ന് രാവിലെ 9 മണി. ഫോൺ 9876543210.");
  assert.equal(resMl2.data.eventTime, "09:00");

  // Malayalam വൈകിട്ട് 6:30
  const resMl3 = await parseBookingVoiceText("റിസപ്ഷൻ 2026 നവംബർ 25-ന് വൈകിട്ട് 6:30 മണിക്ക്. ഫോൺ 9876543210.");
  assert.equal(resMl3.data.eventTime, "18:30");
});

test("Scenario 15: 12-Hour Component Parsing and Round-Trip Building for Form Controls", () => {
  // 18:30 -> { hour: "6", minute: "30", ampm: "PM" }
  const c1 = parse12HourComponents("18:30");
  assert.equal(c1.hour, "6");
  assert.equal(c1.minute, "30");
  assert.equal(c1.ampm, "PM");
  assert.equal(build24HourFrom12(c1.hour, c1.minute, c1.ampm), "18:30");

  // 00:00 -> { hour: "12", minute: "00", ampm: "AM" } (Midnight)
  const c2 = parse12HourComponents("00:00");
  assert.equal(c2.hour, "12");
  assert.equal(c2.minute, "00");
  assert.equal(c2.ampm, "AM");
  assert.equal(build24HourFrom12(c2.hour, c2.minute, c2.ampm), "00:00");

  // 12:00 -> { hour: "12", minute: "00", ampm: "PM" } (Noon)
  const c3 = parse12HourComponents("12:00");
  assert.equal(c3.hour, "12");
  assert.equal(c3.minute, "00");
  assert.equal(c3.ampm, "PM");
  assert.equal(build24HourFrom12(c3.hour, c3.minute, c3.ampm), "12:00");

  // 09:15 -> { hour: "9", minute: "15", ampm: "AM" }
  const c4 = parse12HourComponents("09:15");
  assert.equal(c4.hour, "9");
  assert.equal(c4.minute, "15");
  assert.equal(c4.ampm, "AM");
  assert.equal(build24HourFrom12(c4.hour, c4.minute, c4.ampm), "09:15");
});

