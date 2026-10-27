/**
 * AI Booking Parser
 * Supports both LLM extraction (when Gemini / OpenAI API key is configured)
 * and a robust built-in Natural Language / Regex extraction engine that works
 * immediately out of the box with zero external dependencies and zero cost.
 */

export interface ExtractedBookingFields {
  eventName?: string;
  eventType?: string;
  eventDate?: string; // YYYY-MM-DD
  eventTime?: string; // HH:MM in 24-hr format
  guests?: string;
  location?: string;
  description?: string;

  name?: string;
  phone?: string;
  email?: string;
  address?: string;

  requestedServices?: string[];
  cateringIncluded?: boolean;
  cateringServingType?: "FIXED" | "PER_GUEST" | "PER_PLATE";
  cateringNotes?: string;
}

export interface ParseBookingResult {
  success: boolean;
  data: ExtractedBookingFields;
  confidence: number;
  detectedFields: string[];
  missingFields: string[];
  summary: string;
  source: "llm" | "local_nlp";
}

/**
 * Converts Malayalam numerals (൦-൯) to standard ASCII digits (0-9)
 */
export function convertMalayalamDigitsToAscii(text: string): string {
  const malayalamDigitMap: Record<string, string> = {
    "൦": "0", "൧": "1", "൨": "2", "൩": "3", "൪": "4",
    "൫": "5", "൬": "6", "൭": "7", "൮": "8", "൯": "9",
  };
  return text.replace(/[൦-൯]/g, (ch) => malayalamDigitMap[ch] || ch);
}

/**
 * Unambiguous Malayalam number words mapping for guest counts
 */
export const MALAYALAM_NUMBER_WORDS: Record<string, number> = {
  "അമ്പത്": 50,
  "നൂറ്": 100,
  "നൂറ്റമ്പത്": 150,
  "ഇരുന്നൂറ്": 200,
  "ഇരുന്നൂറ്റമ്പത്": 250,
  "മുന്നൂറ്": 300,
  "മുന്നൂറ്റമ്പത്": 350,
  "നാനൂറ്": 400,
  "അഞ്ഞൂറ്": 500,
  "ആയിരം": 1000,
  "രണ്ടായിരം": 2000,
  "അയ്യായിരം": 5000,
};

export const MANGLISH_NUMBER_WORDS: Record<string, number> = {
  "ambathu": 50,
  "nooru": 100,
  "noottambathu": 150,
  "irunnooru": 200,
  "irunnoottambathu": 250,
  "munnooru": 300,
  "munnoottambathu": 350,
  "naanooru": 400,
  "anjnooru": 500,
  "ainooru": 500,
  "aayiram": 1000,
};

/**
 * Validates year, month (0-indexed), and day against real calendar constraints
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 2000 || year > 2100) return false;
  if (month < 0 || month > 11) return false;
  if (day < 1 || day > 31) return false;
  const dt = new Date(year, month, day);
  return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day;
}

/**
 * Standardizes relative or conversational date strings to YYYY-MM-DD.
 * Supports English, Malayalam (മലയാളം), and Manglish date expressions.
 * Returns null if the date is ambiguous, out of range, or invalid (e.g. Feb 31).
 */
export function normalizeDateString(dateInput: string): string | null {
  if (!dateInput) return null;
  const cleaned = convertMalayalamDigitsToAscii(dateInput).trim().toLowerCase();

  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Handle ISO YYYY-MM-DD directly
  const isoMatch = cleaned.match(/\b(20\d\d)-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (isValidDate(y, m, d)) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return null;
  }

  // 2. Handle DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d\d)\b/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    if (isValidDate(y, m, d)) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return null;
  }

  // Malayalam month lookup table
  const mlMonths: Record<string, number> = {
    "ജനുവരി": 0, "ജന": 0,
    "ഫെബ്രുവരി": 1, "ഫെബ്രു": 1,
    "മാർച്ച്": 2, "മാർ": 2,
    "ഏപ്രിൽ": 3, "ഏപ്രി": 3,
    "മെയ്": 4,
    "ജൂൺ": 5,
    "ജൂലൈ": 6,
    "ഓഗസ്റ്റ്": 7, "ആഗസ്റ്റ്": 7, "ഓഗ": 7, "ആഗ": 7,
    "സെപ്റ്റംബർ": 8, "സെപ്തംബർ": 8, "സെപ്": 8,
    "ഒക്ടോബർ": 9, "ഒക്ടോ": 9,
    "നവംബർ": 10, "നവം": 10,
    "ഡിസംബർ": 11, "ഡിസം": 11,
  };

  // 3. Malayalam date pattern: "2026 നവംബർ 25-ന്" or "2026 നവംബർ 25"
  const mlYmdMatch = cleaned.match(
    /\b(20\d\d)\s+(ജനുവരി|ഫെബ്രുവരി|മാർച്ച്|ഏപ്രിൽ|മെയ്|ജൂൺ|ജൂലൈ|ഓഗസ്റ്റ്|ആഗസ്റ്റ്|സെപ്റ്റംബർ|സെപ്തംബർ|ഒക്ടോബർ|നവംബർ|ഡിസംബർ)\s+(\d{1,2})(?:-?ന്|-?ആം|-?ാം)?(?![a-zA-Z0-9_\u0D00-\u0D7F])/
  );
  if (mlYmdMatch) {
    const y = parseInt(mlYmdMatch[1], 10);
    const m = mlMonths[mlYmdMatch[2]];
    const d = parseInt(mlYmdMatch[3], 10);
    if (m !== undefined && isValidDate(y, m, d)) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return null;
  }

  // 4. Malayalam date pattern: "25 നവംബർ 2026", "25-ാം തിയതി നവംബർ 2026", "25-ആം തീയതി നവംബർ"
  const mlDmyMatch = cleaned.match(
    /(?:^|[^\w\u0D00-\u0D7F])(\d{1,2})(?:-?ആം|-?ാം)?\s*(?:തിയതി|തീയതി|തിയ്യതി)?\s*(?:-ന്)?\s+(ജനുവരി|ഫെബ്രുവരി|മാർച്ച്|ഏപ്രിൽ|മെയ്|ജൂൺ|ജൂലൈ|ഓഗസ്റ്റ്|ആഗസ്റ്റ്|സെപ്റ്റംബർ|സെപ്തംബർ|ഒക്ടോബർ|നവംബർ|ഡിസംബർ)(?:\s*,?\s*(20\d\d))?(?![a-zA-Z0-9_\u0D00-\u0D7F])/
  );
  if (mlDmyMatch) {
    const d = parseInt(mlDmyMatch[1], 10);
    const m = mlMonths[mlDmyMatch[2]];
    const y = mlDmyMatch[3] ? parseInt(mlDmyMatch[3], 10) : currentYear;
    if (m !== undefined && isValidDate(y, m, d)) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return null;
  }

  // 5. Malayalam date pattern: "നവംബർ 25, 2026", "നവംബർ 25-ന്"
  const mlMdyMatch = cleaned.match(
    /(?:^|[^\w\u0D00-\u0D7F])(ജനുവരി|ഫെബ്രുവരി|മാർച്ച്|ഏപ്രിൽ|മെയ്|ജൂൺ|ജൂലൈ|ഓഗസ്റ്റ്|ആഗസ്റ്റ്|സെപ്റ്റംബർ|സെപ്തംബർ|ഒക്ടോബർ|നവംബർ|ഡിസംബർ)\s+(\d{1,2})(?:-?ന്|-?ആം|-?ാം)?(?:\s*,?\s*(20\d\d))?(?![a-zA-Z0-9_\u0D00-\u0D7F])/
  );
  if (mlMdyMatch) {
    const m = mlMonths[mlMdyMatch[1]];
    const d = parseInt(mlMdyMatch[2], 10);
    const y = mlMdyMatch[3] ? parseInt(mlMdyMatch[3], 10) : currentYear;
    if (m !== undefined && isValidDate(y, m, d)) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return null;
  }

  // English Month lookup table
  const months: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  // 6. English / Manglish pattern: "25th November 2026", "25 Nov-nu", "25-am theeyathi November 2026"
  const dayMonthMatch = cleaned.match(
    /\b(\d{1,2})(?:st|nd|rd|th|am|aam)?\s*(?:theeyathi|thiyathi)?\s*(?:of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:-?nu|-?inu|-?il)?(?:\s*,?\s*(20\d\d))?\b/i
  );
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const month = months[dayMonthMatch[2].toLowerCase().slice(0, 3)];
    const year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3], 10) : currentYear;

    if (!isNaN(day) && month !== undefined && isValidDate(year, month, day)) {
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    return null;
  }

  // 7. English / Manglish pattern: "November 25, 2026", "Nov 25-nu", "Nov 15-inu"
  const monthDayMatch = cleaned.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th|am|aam)?(?:-?nu|-?inu|-?il)?(?:\s*,?\s*(20\d\d))?\b/i
  );
  if (monthDayMatch) {
    const month = months[monthDayMatch[1].toLowerCase().slice(0, 3)];
    const day = parseInt(monthDayMatch[2], 10);
    const year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : currentYear;

    if (!isNaN(day) && month !== undefined && isValidDate(year, month, day)) {
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    return null;
  }

  return null;
}

/**
 * Standardizes time expressions (e.g. "6 PM", "വൈകുന്നേരം 6 മണി", "vaikittu 6 manikku", "18:00") into 24-hr "HH:MM"
 */
export function normalizeTimeString(timeInput: string): string | null {
  if (!timeInput) return null;
  const cleaned = convertMalayalamDigitsToAscii(timeInput).trim().toLowerCase();

  // 1. Malayalam time expression with prefix: e.g. "വൈകുന്നേരം 6 മണി", "രാവിലെ 9:30"
  const mlPrefixMatch = cleaned.match(
    /(വൈകുന്നേരം|വൈകിട്ട്|വൈകീട്ട്|രാത്രി|രാവിലെ|പുലർച്ചെ|ഉച്ചയ്ക്ക്|ഉച്ചക്ക്)\s*(\d{1,2})(?::(\d{2}))?\s*(?:മണി(?:ക്ക്|യ്ക്ക്)?)?/i
  );
  if (mlPrefixMatch) {
    const period = mlPrefixMatch[1];
    let hours = parseInt(mlPrefixMatch[2], 10);
    const mins = mlPrefixMatch[3] ? mlPrefixMatch[3] : "00";

    if (hours >= 1 && hours <= 12) {
      if (/വൈകുന്നേരം|വൈകിട്ട്|വൈകീട്ട്|രാത്രി/.test(period) && hours < 12) {
        hours += 12;
      } else if (/രാവിലെ|പുലർച്ചെ/.test(period) && hours === 12) {
        hours = 0;
      } else if (/ഉച്ചയ്ക്ക്|ഉച്ചക്ക്/.test(period) && hours >= 1 && hours <= 6) {
        hours += 12;
      }
      return `${String(hours).padStart(2, "0")}:${mins}`;
    }
  }

  // 2. Malayalam time expression with suffix: e.g. "6 മണിക്ക് വൈകുന്നേരം", "6 മണിക്ക്"
  const mlSuffixMatch = cleaned.match(
    /(\d{1,2})(?::(\d{2}))?\s*മണി(?:ക്ക്|യ്ക്ക്)?(?:\s*(?:മുതൽ|വരെ))?(?:\s*(വൈകുന്നേരം|വൈകിട്ട്|വൈകീട്ട്|രാത്രി|രാവിലെ|പുലർച്ചെ|ഉച്ചയ്ക്ക്|ഉച്ചക്ക്))?/i
  );
  if (mlSuffixMatch) {
    let hours = parseInt(mlSuffixMatch[1], 10);
    const mins = mlSuffixMatch[2] ? mlSuffixMatch[2] : "00";
    const period = mlSuffixMatch[3];

    if (hours >= 1 && hours <= 12) {
      if (period && /വൈകുന്നേരം|വൈകിട്ട്|വൈകീട്ട്|രാത്രി/.test(period) && hours < 12) {
        hours += 12;
      } else if (period && /രാവിലെ|പുലർച്ചെ/.test(period) && hours === 12) {
        hours = 0;
      } else if (period && /ഉച്ചയ്ക്ക്|ഉച്ചക്ക്/.test(period) && hours >= 1 && hours <= 6) {
        hours += 12;
      }
      return `${String(hours).padStart(2, "0")}:${mins}`;
    }
  }

  // 3. Manglish time expressions: e.g. "vaikittu 6 manikku", "raavile 9 am", "uchakku 1 mani"
  const manglishMatch = cleaned.match(
    /(vaik(?:unneram|ittu|eettu)|raathri|raavile|uchay?kku)\s*(\d{1,2})(?::(\d{2}))?\s*(?:mani(?:kku)?)?/i
  );
  if (manglishMatch) {
    const period = manglishMatch[1].toLowerCase();
    let hours = parseInt(manglishMatch[2], 10);
    const mins = manglishMatch[3] ? manglishMatch[3] : "00";

    if (hours >= 1 && hours <= 12) {
      if (/vaik|raathri/.test(period) && hours < 12) {
        hours += 12;
      } else if (/raavile/.test(period) && hours === 12) {
        hours = 0;
      } else if (/ucha/.test(period) && hours >= 1 && hours <= 6) {
        hours += 12;
      }
      return `${String(hours).padStart(2, "0")}:${mins}`;
    }
  }

  // 4. Check 12-hour am/pm format: e.g. "6:30 pm" or "6pm"
  const ampmMatch = cleaned.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const mins = ampmMatch[2] ? ampmMatch[2] : "00";
    const period = ampmMatch[3].toLowerCase();

    if (hours < 1 || hours > 12) return null;
    const minsNum = parseInt(mins, 10);
    if (minsNum < 0 || minsNum > 59) return null;

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${mins}`;
  }

  // 5. Check 24-hour "18:00" format
  const militaryMatch = cleaned.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (militaryMatch) {
    return `${militaryMatch[1].padStart(2, "0")}:${militaryMatch[2]}`;
  }

  return null;
}

/**
 * Validates and extracts a legitimate 10-digit Indian mobile number
 * (Starts with 6, 7, 8, or 9; supports +91 / 91 / 0 prefixes and Malayalam numerals)
 */
export function extractValidIndianPhoneNumber(text: string): string | null {
  const converted = convertMalayalamDigitsToAscii(text);
  const match = converted.match(/(?:(?:\+91|91|0)[\s-]?)?([6-9]\d{9})\b|\b([6-9]\d{4}[\s-]?\d{5})\b/);
  if (!match) return null;
  const candidate = (match[1] || match[2] || "").replace(/\D/g, "");
  if (candidate.length === 10 && /^[6-9]\d{9}$/.test(candidate)) {
    return candidate;
  }
  return null;
}

const RESERVED_WORDS = new Set([
  "the", "our", "this", "next", "event", "venue", "grand", "hotel", "palace",
  "phone", "email", "contact", "mobile", "number", "details", "booking", "proposal",
  "we", "they", "around", "approx", "please", "need", "require", "looking", "for",
  "date", "time", "guests", "pax", "people", "stage", "catering", "buffet",
  // Malayalam stop words
  "ക്ലയന്റ്", "ഫോൺ", "ഇമെയിൽ", "സ്ഥലം", "വേദി", "തീയതി", "തിയതി", "ആളുകൾ", "പേർ",
  "സമയം", "കല്യാണം", "വിവാഹം", "കാറ്ററിംഗ്", "സദ്യ", "ലൈറ്റിംഗ്", "ഡെക്കറേഷൻ", "ഫോട്ടോഗ്രാഫി", "സൗണ്ട്"
]);

/**
 * Normalizes Malayalam locative grammatical suffixes to their base nominative form.
 * e.g. "ഗ്രാൻഡ് പാലസിൽ" -> "ഗ്രാൻഡ് പാലസ്", "കമ്മ്യൂണിറ്റി ഹാളിൽ" -> "കമ്മ്യൂണിറ്റി ഹാൾ"
 */
export function cleanMalayalamLocative(raw: string): string {
  return raw
    .replace(/-(?:il|yil|ൽ|യിൽ)$/i, "")
    .replace(/(?:il|yil)$/i, "")
    .replace(/രിൽ$/, "ർ")
    .replace(/(?:ത്തിൽ|ത്തി)$/, "ം")
    .replace(/(?:സിൽ|സി)$/, "സ്")
    .replace(/(?:ളിൽ|ളി)$/, "ൾ")
    .replace(/(?:യിൽ|യി)$/, "")
    .replace(/(?:-ൽ|-യിൽ|ൽ|യിൽ)$/i, "")
    .trim();
}

/**
 * High-speed built-in NLP & Regex parser.
 * Works 100% locally with zero external API dependencies.
 * Full bilingual support for Malayalam, English, and Manglish mixed expressions.
 */
export function parseBookingTextLocally(rawText: string): ExtractedBookingFields {
  const result: ExtractedBookingFields = {};
  const text = convertMalayalamDigitsToAscii(rawText).trim();
  const lower = text.toLowerCase();

  // 1. Phone number (strictly valid 10-digit Indian numbers starting with 6-9)
  const phone = extractValidIndianPhoneNumber(text);
  if (phone) {
    result.phone = phone;
  }

  // 2. Email Address
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  // 3. Guest count (supports digits and unambiguous Malayalam number words)
  const numericGuestMatch =
    text.match(/(?:around|approx(?:\.|imately)?|about|for|ഏകദേശം|ഏതാണ്ട്)?\s*(\d{1,5})\s*(?:guests?|people|pax|attendees|persons?|members?|ആളുകൾ|ആളുകൾക്ക്|പേർ|പേർക്ക്|അതിഥികൾ|അതിഥികൾക്ക്|perkk|perkku|aalukal)(?![a-zA-Z0-9_\u0D00-\u0D7F])/i) ||
    text.match(/(?:guests?|pax|attendance|ആളുകൾ|പേർ)\s*(?:is|of|:)?\s*(\d{1,5})(?![a-zA-Z0-9_\u0D00-\u0D7F])/i);

  const wordGuestMatch = text.match(
    /(?:ഏകദേശം|ഏതാണ്ട്|around)?\s*(അമ്പത്|നൂറ്|നൂറ്റമ്പത്|ഇരുന്നൂറ്|ഇരുന്നൂറ്റമ്പത്|മുന്നൂറ്|മുന്നൂറ്റമ്പത്|നാനൂറ്|അഞ്ഞൂറ്|ആയിരം|ambathu|nooru|noottambathu|irunnooru|irunnoottambathu|munnooru|munnoottambathu|naanooru|anjnooru|ainooru|aayiram)\s*(?:പേർ|പേർക്ക്|ആളുകൾ|ആളുകൾക്ക്|അതിഥികൾ|അതിഥികൾക്ക്|guests?|pax|people|perkk)(?![a-zA-Z0-9_\u0D00-\u0D7F])/i
  );

  if (numericGuestMatch) {
    const val = parseInt(numericGuestMatch[1], 10);
    if (val > 0 && val <= 100000) {
      result.guests = String(val);
    }
  } else if (wordGuestMatch && wordGuestMatch[1]) {
    const wordKey = wordGuestMatch[1].toLowerCase();
    const val = MALAYALAM_NUMBER_WORDS[wordKey] || MANGLISH_NUMBER_WORDS[wordKey];
    if (val) {
      result.guests = String(val);
    }
  }

  // 4. Date extraction
  const detectedDate = normalizeDateString(text);
  if (detectedDate) {
    result.eventDate = detectedDate;
  }

  // 5. Time extraction
  const detectedTime = normalizeTimeString(text);
  if (detectedTime) {
    result.eventTime = detectedTime;
  }

  // 6. Event Type (ordered by specificity to prevent false classifications)
  if (/corporate\s+dinner|കോർപ്പറേറ്റ്\s*ഡിന്നർ/i.test(lower)) {
    result.eventType = "Corporate Gala";
    result.eventName = "Corporate Dinner";
  } else if (/wedding\s+reception|വിവാഹ\s*റിസപ്ഷൻ/i.test(lower)) {
    result.eventType = "Wedding";
    result.eventName = "Wedding Reception";
  } else if (/conference|seminar|summit|symposium|സമ്മേളനം|സെമിനാർ|കോൺഫറൻസ്|sammelanam/i.test(lower)) {
    result.eventType = "Conference";
  } else if (/wedding|marriage|shaadi|reception|sangeet|mehendi|baraat|വിവാഹം|കല്യാണം|നിക്കാഹ്|മാംഗല്യം|kalyanam|vivaham|nikkah|mangalyam/i.test(lower)) {
    result.eventType = "Wedding";
  } else if (/birthday|bday|turning\s+\d+|sweet\s+16|ജന്മദിനം|പിറന്നാൾ|pirannal|janmadinam/i.test(lower)) {
    result.eventType = "Birthday Celebration";
  } else if (/product\s+launch|launch\s+party|ഉദ്ഘാടനം|ലോഞ്ച്|udghadanam/i.test(lower)) {
    result.eventType = "Product Launch";
  } else if (/concert|festival|musical|live\s+band|ഗാനമേള|സംഗീത\s*നിശ|ഉത്സവം|കച്ചേരി|ganamela|utsavam/i.test(lower)) {
    result.eventType = "Concert / Festival";
  } else if (/corporate|gala|annual\s+meet|business|townhall|award|വാർഷികം|വാർഷികാഘോഷം|varshikam|varshikotsavam/i.test(lower)) {
    result.eventType = "Corporate Gala";
  } else if (/dinner|private\s+party|cocktail|വിരുന്ന്|virunnu/i.test(lower)) {
    result.eventType = "Private Dinner";
  }

  // 7. Client Name extraction
  // Malayalam joint couple names: e.g. "രാഹുലിന്റെയും പ്രിയയുടെയും കല്യാണം"
  const mlJointCoupleMatch = text.match(
    /([A-Za-z\u0D00-\u0D7F]+?)(?:ിന്റെയും|ന്റെയും)\s*([A-Za-z\u0D00-\u0D7F]+?)(?:യുടെയും|ിന്റെയും|ന്റെയും)?\s*(?:കല്യാണം|വിവാഹം|wedding|marriage)/i
  );

  // Manglish joint couple or possessive names: e.g. "Rahulinteyum Priyayudeyum kalyanam", "Rahulinte kalyanam"
  const manglishCoupleMatch = text.match(
    /\b([A-Z][a-z]+?)(?:inteyum|inte|ude)\s+([A-Z][a-z]+?)(?:yudeyum|udeyum|inteyum|inte|ude)\s*(?:kalyanam|reception|wedding|marriage|vivaham|engagement|pirannal)\b/i
  ) || text.match(
    /\b([A-Z][a-z]+?)(?:inteyum|inte|ude)\s*(?:kalyanam|reception|wedding|marriage|vivaham|engagement|pirannal)\b/i
  );

  // Malayalam client identifier: "ക്ലയന്റ് രാഹുൽ", "ക്ലയന്റ് പേര്: രാഹുൽ", "ബന്ധപ്പെടേണ്ട വ്യക്തി: ജോൺ"
  const mlClientMatch = text.match(
    /(?:ക്ലയന്റ്(?:\s+പേര്)?|ബന്ധപ്പെടേണ്ട\s+വ്യക്തി|പേര്)\s*[:=-]?\s*(?!(?:ഫോൺ|ഇമെയിൽ|നമ്പർ|സ്ഥലം|തീയതി|phone|email)\b)([A-Za-z\u0D00-\u0D7F]+(?:\s+[A-Za-z\u0D00-\u0D7F]+)?)/i
  );

  // English / Manglish client markers: "client Rahul", "contact person John", "peru Rahul"
  const directClientMatch = text.match(
    /(?:client(?:\s+name)?(?:\s+is)?|contact(?:\s+person)?(?:\s+is)?|customer(?:\s+name)?(?:\s+is)?|peru(?:\s+is)?)\s*[:=-]?\s*(?!(?:phone|mobile|cell|contact|email|number|details|booking|event|venue|date|time|guests|pax)\b)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );

  const namedPersonMatch = text.match(
    /(?:for|with)\s+([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+|\s+[A-Z][a-z]+)?)\b/
  );

  if (mlJointCoupleMatch && mlJointCoupleMatch[1] && mlJointCoupleMatch[2]) {
    const p1 = mlJointCoupleMatch[1].trim().replace(/ല$/, "ൽ").replace(/[ിന്റെ]+$/, "");
    const p2 = mlJointCoupleMatch[2].trim().replace(/ല$/, "ൽ").replace(/[ിന്റെ]+$/, "");
    result.name = `${p1} and ${p2}`;
  } else if (manglishCoupleMatch && manglishCoupleMatch[1]) {
    const p1 = manglishCoupleMatch[1].trim().replace(/(?:inteyum|inte|ude)$/i, "");
    const p2 = manglishCoupleMatch[2] ? manglishCoupleMatch[2].trim().replace(/(?:yudeyum|udeyum|inteyum|inte|ude)$/i, "") : "";
    if (p2 && !RESERVED_WORDS.has(p2.toLowerCase()) && !RESERVED_WORDS.has(p1.toLowerCase())) {
      result.name = `${p1} and ${p2}`;
    } else if (!RESERVED_WORDS.has(p1.toLowerCase())) {
      result.name = p1;
    }
  } else if (mlClientMatch && mlClientMatch[1]) {
    const raw = mlClientMatch[1].trim();
    if (!RESERVED_WORDS.has(raw.toLowerCase())) {
      result.name = raw;
    }
  } else if (directClientMatch && directClientMatch[1]) {
    const raw = directClientMatch[1].trim();
    if (!RESERVED_WORDS.has(raw.toLowerCase())) {
      result.name = raw;
    }
  } else if (namedPersonMatch && namedPersonMatch[1]) {
    const raw = namedPersonMatch[1].trim();
    if (!RESERVED_WORDS.has(raw.toLowerCase()) && !/^(the|our|this|next)$/i.test(raw)) {
      result.name = raw;
    }
  }

  // 8. Event Name synthesis or extraction
  const explicitEventNameMatch = text.match(
    /(?:named|titled|event\s+name(?:\s+is)?)\s+([A-Za-z0-9\u0D00-\u0D7F\s&'-]{4,40}?)(?=\s+(?:on|at|for|with|dated|\.|$))/i
  );

  if (explicitEventNameMatch && explicitEventNameMatch[1]) {
    result.eventName = explicitEventNameMatch[1].trim();
  } else if (result.name && result.eventType) {
    if (result.eventType === "Wedding") {
      result.eventName = `${result.name.replace(/\band\b/i, "&")} Wedding`;
    } else if (result.eventType === "Birthday Celebration") {
      result.eventName = `${result.name}'s Birthday Celebration`;
    } else if (result.eventType === "Conference") {
      result.eventName = `${result.name} Conference`;
    } else {
      result.eventName = `${result.name}'s ${result.eventType}`;
    }
  } else if (result.eventType) {
    result.eventName = `${result.eventType} Celebration`;
  }

  // 9. Location / Venue
  // Malayalam & Manglish venue: "...ൽ വെച്ച്", "...യിൽ വെച്ച്", "...-il vechu", "Nilamburil vechu", "Calicut-il vech"
  const mlVechuMatch = text.match(
    /(?:^|[^\w\u0D00-\u0D7F])([A-Z\u0D00-\u0D7F][A-Za-z0-9\u0D00-\u0D7F\s&',.-]{1,35}?)(?:-ൽ|-യിൽ|ൽ|യിൽ|-il|il|-yil|yil)?\s*(?:വെച്ച്|vechu|vech)(?![a-zA-Z0-9_\u0D00-\u0D7F])/
  ) || text.match(
    /(?:(?:-?ന്|-?ആം|-?ാം|തിയതി|തീയതി|തിയ്യതി|മണിക്ക്|മണി|manikku|mani|pm|am)\s+|[.,\n]|^)\s*([A-Za-z\u0D00-\u0D7F][A-Za-z0-9\u0D00-\u0D7F\s&',.-]{1,35}?)(?:-ൽ|-യിൽ|ൽ|യിൽ|-il|il|-yil|yil)?\s*(?:വെച്ച്|vechu|vech)(?![a-zA-Z0-9_\u0D00-\u0D7F])/i
  );

  // Standalone Malayalam locative (e.g. "നിലമ്പൂരിൽ", "കൊച്ചിയിൽ")
  const mlStandaloneLocMatch = text.match(
    /(?:(?:മണിക്ക്|വൈകിട്ട്|വൈകീട്ട്|രാവിലെ|രാത്രി|തിയതി|തീയതി|ന്)\s+|[.,\n]|^)\s*([\u0D00-\u0D7F]{2,40}?(?:-ൽ|-യിൽ|ൽ|യിൽ))(?=[.,\s]|$)/i
  );

  // Standalone Manglish locative (e.g. "Nilamburil", "Calicut-il", "Kozhikode-il", "Kochi-yil")
  const manglishStandaloneLocMatch = text.match(
    /(?:(?:manikku|vaikittu|ravile|raathri|on|at|date|\d+|guests?|perkk|perku|per|kalyanam|reception|functions?)\s+|[.,\n]|^)\s*([A-Z][a-z]{2,20}(?:-il|il|-yil|yil))(?=[.,\s]|$)/i
  );

  // Explicit venue tag: "വേദി: ഗ്രാൻഡ് പാലസ്", "സ്ഥലം: ലീല പാലസ്", "venue Manjeri", "place Nilambur"
  const explicitVenueMatch = text.match(
    /(?:വേദി|സ്ഥലം|venue(?:\s+is)?|location(?:\s+is)?|place(?:\s+is)?|sthalem|sthalam)\s*[:=-]?\s*([A-Za-z0-9\u0D00-\u0D7F\s&',.-]{2,50}?)(?=\s*(?:[.]|\s+(?:on|for|with|from|around|\d+|need|വൈകുന്നേരം|രാവിലെ|വൈകിട്ട്|ക്ലയന്റ്|$)))/i
  );

  // English venue: "in Nilambur", "at Grand Palace, Bangalore", "in Calicut"
  const englishVenueMatch =
    text.match(/(?:at|held\s+at|in)\s+([A-Z\u0D00-\u0D7F][A-Za-z0-9\u0D00-\u0D7F\s&',-]{2,50}?)(?=\s*(?:[.]|\s+(?:on|for|with|from|around|at|\d+|need|വൈകുന്നേരം|രാവിലെ|വൈകിട്ട്|ക്ലയന്റ്|$)))/i) ||
    text.match(/(?:at|in\s+)([A-Z\u0D00-\u0D7F][A-Za-z0-9\u0D00-\u0D7F\s&',-]+(?:Hall|Palace|Hotel|Resort|Convention|Center|Centre|Banquet|Gardens?|Grounds?))/i);

  if (mlVechuMatch && mlVechuMatch[1]) {
    let rawLoc = mlVechuMatch[1].trim()
      .replace(/^(?:(?:20\d\d)\s+)?(?:[^\s]+\s+)?(?:\d{1,2}(?:-?ന്|-?ആം|-?ാം)?\s+)?/, "")
      .replace(/^(?:.*?\b(?:manikku|mani|pm|am|at|in|on|vaikittu|ravile|raathri)\s+)/i, "")
      .replace(/[.,]$/, "")
      .trim();
    rawLoc = cleanMalayalamLocative(rawLoc);
    if (!RESERVED_WORDS.has(rawLoc.toLowerCase()) && rawLoc.length >= 2) {
      result.location = rawLoc;
    }
  } else if (explicitVenueMatch && explicitVenueMatch[1]) {
    let rawLoc = explicitVenueMatch[1].trim().replace(/[.,]$/, "");
    rawLoc = cleanMalayalamLocative(rawLoc);
    if (!RESERVED_WORDS.has(rawLoc.toLowerCase()) && rawLoc.length >= 2) {
      result.location = rawLoc;
    }
  } else if (englishVenueMatch && englishVenueMatch[1]) {
    const cleanLoc = englishVenueMatch[1].trim().replace(/[.,]$/, "");
    if (!RESERVED_WORDS.has(cleanLoc.toLowerCase()) && cleanLoc.length >= 2) {
      result.location = cleanLoc;
    }
  } else if (mlStandaloneLocMatch && mlStandaloneLocMatch[1]) {
    let rawLoc = mlStandaloneLocMatch[1].trim();
    rawLoc = cleanMalayalamLocative(rawLoc);
    if (!RESERVED_WORDS.has(rawLoc.toLowerCase()) && rawLoc.length >= 2) {
      result.location = rawLoc;
    }
  } else if (manglishStandaloneLocMatch && manglishStandaloneLocMatch[1]) {
    let rawLoc = manglishStandaloneLocMatch[1].trim();
    rawLoc = cleanMalayalamLocative(rawLoc);
    if (!RESERVED_WORDS.has(rawLoc.toLowerCase()) && rawLoc.length >= 2) {
      result.location = rawLoc;
    }
  }

  // 10. Services Detection (English, Malayalam script, Manglish)
  const servicesDetected: string[] = [];
  if (/photo|photography|camera|videography|drone|cinematography|ഫോട്ടോഗ്രാഫി(?:യും)?|വീഡിയോഗ്രാഫി(?:യും)?|ഫോട്ടോ|വീഡിയോ/i.test(lower)) {
    servicesDetected.push("Photography & Videography");
  }
  if (/lighting|stage\s+lights|led\s+wall|ambient\s+lights|spotlight|ലൈറ്റിംഗ്(?:ും)?|ലൈറ്റിങ്(?:ും)?|ലൈറ്റ്|സ്റ്റേജ്\s*ലൈറ്റ്/i.test(lower)) {
    servicesDetected.push("Stage & Ambient Lighting");
  }
  if (/sound|audio|speakers?|microphones?|mic|dj|music|pa\s+system|pattu|gana|സൗണ്ട്(?:ഉം)?|ഡിജെ|ഓഡിയോ|മൈക്ക്|പാട്ട്/i.test(lower)) {
    servicesDetected.push("Pro Sound System & DJ");
  }
  if (/decor|decoration|flowers?|floral|mandap|mandapam|stage\s+decor|backdrop|ഡെക്കറേഷൻ|ഡെക്കറേഷനും|അലങ്കാരം|ഫ്ലോറൽ|പൂക്കൾ/i.test(lower)) {
    servicesDetected.push("Stage & Floral Decoration");
  }
  if (/anchor|emcee|host|mc|ആങ്കർ|എംസി|അവതാരക/i.test(lower)) {
    servicesDetected.push("Event Anchor & Host");
  }
  if (/catering|food|buffet|lunch|dinner|beverages?|snack|biriyani|biryani|sadya|sadhya|oonu|ഭക്ഷണം|കാറ്ററിംഗ്|കാറ്ററിംഗും|കാറ്ററിങ്|കാറ്ററിങ്ങും|സദ്യ|ബുഫെ|ബുഫേ|ഊണ്|സൽക്കാരം/i.test(lower)) {
    result.cateringIncluded = true;
    servicesDetected.push("Catering & Food Experience");
    if (/buffet|per\s+guest|per\s+person|ബുഫെ|ബുഫേ|ഓരോരുത്തർക്കും/i.test(lower)) {
      result.cateringServingType = "PER_GUEST";
    } else if (/per\s+plate|plated|പ്ലേറ്റിന്|പ്ലേറ്റ്/i.test(lower)) {
      result.cateringServingType = "PER_PLATE";
    } else {
      result.cateringServingType = "FIXED";
    }
  }

  if (servicesDetected.length > 0) {
    result.requestedServices = servicesDetected;
  }

  // 11. Description / Notes
  result.description = text;

  return result;
}

/**
 * Evaluates detected and missing fields
 */
function evaluateFields(fields: ExtractedBookingFields): {
  detected: string[];
  missing: string[];
  confidence: number;
} {
  const detected: string[] = [];
  const missing: string[] = [];

  if (fields.eventName) detected.push("Event Name");
  else missing.push("Event Name");

  if (fields.eventType) detected.push("Event Type");
  else missing.push("Event Type");

  if (fields.eventDate) detected.push("Event Date");
  else missing.push("Event Date");

  if (fields.eventTime) detected.push("Time");
  else missing.push("Time");

  if (fields.guests) detected.push("Guest Count");
  else missing.push("Guest Count");

  if (fields.location) detected.push("Venue / Location");
  else missing.push("Venue / Location");

  if (fields.name) detected.push("Client Name");
  else missing.push("Client Name");

  if (fields.phone) detected.push("Phone");
  else missing.push("Phone");

  if (fields.email) detected.push("Email");
  if (fields.requestedServices && fields.requestedServices.length > 0) {
    detected.push(`Services (${fields.requestedServices.length})`);
  }
  if (fields.cateringIncluded) detected.push("Catering");

  // Calculate confidence score proportionally
  let confidence = 0;
  if (detected.length >= 7) confidence = 0.95;
  else if (detected.length >= 5) confidence = 0.85;
  else if (detected.length >= 3) confidence = 0.70;
  else if (detected.length >= 1) confidence = 0.45;

  return { detected, missing, confidence };
}

function generateParseSummary(fields: ExtractedBookingFields): string {
  const parts: string[] = [];
  if (fields.eventName) parts.push(fields.eventName);
  if (fields.eventDate) parts.push(`on ${fields.eventDate}`);
  if (fields.guests) parts.push(`for ${fields.guests} guests`);
  if (fields.location) parts.push(`at ${fields.location}`);
  if (fields.name) parts.push(`(Client: ${fields.name})`);
  return parts.length > 0 ? parts.join(" ") : "No event details recognized in message.";
}

/**
 * Main parser entry point: attempts LLM extraction if an API key is available,
 * and gracefully falls back to the local NLP parser with guaranteed high availability.
 */
export async function parseBookingVoiceText(
  transcript: string,
  apiKey?: string
): Promise<ParseBookingResult> {
  const cleanTranscript = (transcript || "").trim();
  if (!cleanTranscript) {
    return {
      success: false,
      data: {},
      confidence: 0,
      detectedFields: [],
      missingFields: ["Event Name", "Event Type", "Event Date", "Guest Count", "Client Name", "Phone"],
      summary: "No voice or text input received.",
      source: "local_nlp",
    };
  }

  // Always run local parser as baseline
  const localFields = parseBookingTextLocally(cleanTranscript);

  // If Gemini or OpenAI API key is present in environment, attempt LLM extraction
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const llmResult = await extractWithGemini(cleanTranscript, geminiKey);
      if (llmResult) {
        // Sanitize and validate LLM fields against strict formatting
        const validatedDate = llmResult.eventDate ? normalizeDateString(llmResult.eventDate) : localFields.eventDate;
        const validatedPhone = llmResult.phone ? extractValidIndianPhoneNumber(llmResult.phone) : localFields.phone;
        const validatedTime = llmResult.eventTime ? normalizeTimeString(llmResult.eventTime) : localFields.eventTime;

        const merged: ExtractedBookingFields = {
          ...localFields,
          ...llmResult,
          eventDate: validatedDate || undefined,
          phone: validatedPhone || undefined,
          eventTime: validatedTime || undefined,
          email: llmResult.email || localFields.email,
        };

        const { detected, missing, confidence } = evaluateFields(merged);
        return {
          success: detected.length > 0,
          data: merged,
          confidence,
          detectedFields: detected,
          missingFields: missing,
          summary: generateParseSummary(merged),
          source: "llm",
        };
      }
    } catch (llmError) {
      console.warn("LLM extraction failed or timed out, using robust local NLP fallback:", llmError);
    }
  } else if (openAiKey) {
    try {
      const llmResult = await extractWithOpenAI(cleanTranscript, openAiKey);
      if (llmResult) {
        const validatedDate = llmResult.eventDate ? normalizeDateString(llmResult.eventDate) : localFields.eventDate;
        const validatedPhone = llmResult.phone ? extractValidIndianPhoneNumber(llmResult.phone) : localFields.phone;
        const validatedTime = llmResult.eventTime ? normalizeTimeString(llmResult.eventTime) : localFields.eventTime;

        const merged: ExtractedBookingFields = {
          ...localFields,
          ...llmResult,
          eventDate: validatedDate || undefined,
          phone: validatedPhone || undefined,
          eventTime: validatedTime || undefined,
          email: llmResult.email || localFields.email,
        };

        const { detected, missing, confidence } = evaluateFields(merged);
        return {
          success: detected.length > 0,
          data: merged,
          confidence,
          detectedFields: detected,
          missingFields: missing,
          summary: generateParseSummary(merged),
          source: "llm",
        };
      }
    } catch (llmError) {
      console.warn("OpenAI extraction failed or timed out, using robust local NLP fallback:", llmError);
    }
  }

  // Local NLP evaluation
  const { detected, missing, confidence } = evaluateFields(localFields);
  return {
    success: detected.length > 0,
    data: localFields,
    confidence,
    detectedFields: detected,
    missingFields: missing,
    summary: generateParseSummary(localFields),
    source: "local_nlp",
  };
}

/**
 * Gemini LLM Structured Extractor with timeout protection
 */
async function extractWithGemini(
  text: string,
  apiKey: string
): Promise<ExtractedBookingFields | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert event planning booking assistant.
Extract structured booking proposal information from the following user voice note or inquiry:
"""${text}"""

Return STRICT valid JSON ONLY with these fields (omit fields not explicitly mentioned or if invalid):
{
  "eventName": "Event title or name",
  "eventType": "Corporate Gala" | "Wedding" | "Birthday Celebration" | "Conference" | "Concert / Festival" | "Product Launch" | "Private Dinner" | "Other",
  "eventDate": "YYYY-MM-DD",
  "eventTime": "HH:MM",
  "guests": "guest count as string number e.g. '300'",
  "location": "venue or city name",
  "name": "client contact person name",
  "phone": "client 10-digit Indian mobile number",
  "email": "client email address",
  "address": "client address if given",
  "requestedServices": ["list of requested services like Photography, Lighting, Sound, Decor"],
  "cateringIncluded": boolean,
  "cateringServingType": "PER_GUEST" | "PER_PLATE" | "FIXED",
  "description": "brief clean summary"
}
`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const json = await response.json();
    const rawContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    return JSON.parse(rawContent) as ExtractedBookingFields;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * OpenAI LLM Structured Extractor with timeout protection
 */
async function extractWithOpenAI(
  text: string,
  apiKey: string
): Promise<ExtractedBookingFields | null> {
  const url = "https://api.openai.com/v1/chat/completions";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Extract structured event booking fields into valid JSON. Fields: eventName, eventType, eventDate (YYYY-MM-DD), eventTime (HH:MM), guests (string), location, name, phone, email, requestedServices (array of strings), cateringIncluded (boolean), cateringServingType ('PER_GUEST' | 'PER_PLATE' | 'FIXED'), description.",
          },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ExtractedBookingFields;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
