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
  eventTime?: string; // HH:MM or 6:00 PM
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
  summary: string;
  source: "llm" | "local_nlp";
}

/**
 * Standardizes relative or conversational date strings to YYYY-MM-DD
 */
export function normalizeDateString(dateInput: string): string | null {
  if (!dateInput) return null;
  const cleaned = dateInput.trim().toLowerCase();

  const now = new Date();
  const currentYear = now.getFullYear();

  // Handle ISO YYYY-MM-DD directly
  const isoMatch = cleaned.match(/\b(20\d\d)-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, "0");
    const d = isoMatch[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d\d)\b/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, "0");
    const m = dmyMatch[2].padStart(2, "0");
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Month lookup table
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

  // e.g. "25th November 2026" or "25 Nov"
  const dayMonthMatch = cleaned.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*,?\s*(20\d\d))?\b/i
  );
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const month = months[dayMonthMatch[2].toLowerCase().slice(0, 3)];
    const year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3], 10) : currentYear;

    if (!isNaN(day) && month !== undefined) {
      const dt = new Date(year, month, day);
      return dt.toISOString().slice(0, 10);
    }
  }

  // e.g. "November 25, 2026" or "Nov 25"
  const monthDayMatch = cleaned.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(20\d\d))?\b/i
  );
  if (monthDayMatch) {
    const month = months[monthDayMatch[1].toLowerCase().slice(0, 3)];
    const day = parseInt(monthDayMatch[2], 10);
    const year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : currentYear;

    if (!isNaN(day) && month !== undefined) {
      const dt = new Date(year, month, day);
      return dt.toISOString().slice(0, 10);
    }
  }

  return null;
}

/**
 * Standardizes time expressions (e.g. "6 PM", "6:30pm", "18:00") into 24-hr "HH:MM"
 */
export function normalizeTimeString(timeInput: string): string | null {
  if (!timeInput) return null;
  const cleaned = timeInput.trim().toLowerCase();

  // Check 12-hour am/pm format: e.g. "6:30 pm" or "6pm"
  const ampmMatch = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const mins = ampmMatch[2] ? ampmMatch[2] : "00";
    const period = ampmMatch[3].toLowerCase();

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${mins}`;
  }

  // Check 24-hour "18:00" format
  const militaryMatch = cleaned.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (militaryMatch) {
    return `${militaryMatch[1].padStart(2, "0")}:${militaryMatch[2]}`;
  }

  return null;
}

/**
 * High-speed built-in NLP & Regex parser.
 * Works 100% locally with zero external API dependencies.
 */
export function parseBookingTextLocally(rawText: string): ExtractedBookingFields {
  const result: ExtractedBookingFields = {};
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Phone number (Indian 10-digit mobile, +91, with spaces/dashes)
  const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b/);
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/[\s-+]/g, "").slice(-10);
  }

  // 2. Email Address
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  // 3. Guest count (e.g. "350 guests", "around 200 people", "500 pax")
  const guestMatch = text.match(
    /(?:around|approx(?:\.|imately)?|about|for)?\s*(\d{1,5})\s*(?:guests?|people|pax|attendees|persons?|members?)\b/i
  ) || text.match(/\b(?:guests?|pax|attendance)\s*(?:is|of|:)?\s*(\d{1,5})\b/i);
  if (guestMatch) {
    result.guests = guestMatch[1];
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

  // 6. Event Type
  if (/wedding|marriage|shaadi|reception|sangeet|mehendi|baraat/i.test(lower)) {
    result.eventType = "Wedding";
  } else if (/birthday|bday|turning\s+\d+|sweet\s+16/i.test(lower)) {
    result.eventType = "Birthday Celebration";
  } else if (/corporate|gala|annual\s+meet|business|townhall|award/i.test(lower)) {
    result.eventType = "Corporate Gala";
  } else if (/conference|seminar|summit|symposium/i.test(lower)) {
    result.eventType = "Conference";
  } else if (/concert|festival|musical|live\s+band/i.test(lower)) {
    result.eventType = "Concert / Festival";
  } else if (/product\s+launch|launch\s+party/i.test(lower)) {
    result.eventType = "Product Launch";
  } else if (/dinner|private\s+party|cocktail/i.test(lower)) {
    result.eventType = "Private Dinner";
  }

  // 7. Client Name extraction
  // Patterns like: "client Rahul Verma", "client is Rahul Verma", "contact Rahul", "name is Priya", "book for Rahul and Priya"
  const clientMatch =
    text.match(/(?:client(?:\s+name)?(?:\s+is)?|contact(?:\s+person)?(?:\s+is)?|name(?:\s+is)?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) ||
    text.match(/(?:for|with)\s+([A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+|\s+[A-Z][a-z]+)?)\b/);

  if (clientMatch && clientMatch[1]) {
    const rawName = clientMatch[1].trim();
    // Exclude false positive words
    if (!/^(the|our|this|next|event|venue|grand|hotel|palace)$/i.test(rawName)) {
      result.name = rawName;
    }
  }

  // 8. Event Name
  // If specific event name is stated: "wedding reception for Rahul and Priya" or "Tech Summit 2026"
  const eventNameMatch = text.match(
    /(?:named|titled|event\s+name(?:\s+is)?|booking\s+a|book\s+a)\s+([A-Za-z0-9\s&'-]{4,40}?)(?=\s+(?:on|at|for|with|dated|\.|$))/i
  );
  if (eventNameMatch && eventNameMatch[1]) {
    result.eventName = eventNameMatch[1].trim();
  } else if (result.name && result.eventType) {
    result.eventName = `${result.name}'s ${result.eventType}`;
  } else if (result.eventType) {
    result.eventName = `${result.eventType} Celebration`;
  }

  // 9. Location / Venue
  // e.g. "at Grand Palace Hall, Bangalore", "venue is Taj Gateway", "at Leela Palace"
  const venueMatch =
    text.match(/(?:at|venue(?:\s+is)?|location(?:\s+is)?|held\s+at)\s+([A-Z][A-Za-z0-9\s&',.-]{3,50}?)(?=\s+(?:on|for|with|from|around|\.|$))/i) ||
    text.match(/(?:at\s+)([A-Za-z0-9\s&',.-]+(?:Hall|Palace|Hotel|Resort|Convention|Center|Centre|Banquet|Gardens?|Grounds?)[^,.\n]*)/i);

  if (venueMatch && venueMatch[1]) {
    result.location = venueMatch[1].trim().replace(/[.,]$/, "");
  }

  // 10. Services Detection
  const servicesDetected: string[] = [];
  if (/photo|photography|camera|videography|drone|cinematography/i.test(lower)) {
    servicesDetected.push("Photography & Videography");
  }
  if (/lighting|stage\s+lights|led\s+wall|ambient\s+lights|spotlight/i.test(lower)) {
    servicesDetected.push("Stage & Ambient Lighting");
  }
  if (/sound|audio|speakers?|microphones?|mic|dj|music|pa\s+system/i.test(lower)) {
    servicesDetected.push("Pro Sound System & DJ");
  }
  if (/decor|decoration|flowers?|floral|mandap|stage\s+decor|backdrop/i.test(lower)) {
    servicesDetected.push("Stage & Floral Decoration");
  }
  if (/anchor|emcee|host|mc/i.test(lower)) {
    servicesDetected.push("Event Anchor & Host");
  }
  if (/catering|food|buffet|lunch|dinner|beverages?|snack/i.test(lower)) {
    result.cateringIncluded = true;
    servicesDetected.push("Catering & Food Experience");
    if (/buffet|per\s+guest|per\s+person/i.test(lower)) {
      result.cateringServingType = "PER_GUEST";
    } else if (/per\s+plate|plated/i.test(lower)) {
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
      summary: "No voice or text input received.",
      source: "local_nlp",
    };
  }

  // Always run local parser as baseline
  const localFields = parseBookingTextLocally(cleanTranscript);

  // If Gemini or OpenAI API key is present in environment, we enhance it with LLM
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const llmResult = await extractWithGemini(cleanTranscript, geminiKey);
      if (llmResult) {
        // Merge with local parser so we never miss high-precision regex fields (like 10-digit phones)
        const merged: ExtractedBookingFields = {
          ...localFields,
          ...llmResult,
          phone: localFields.phone || llmResult.phone,
          email: localFields.email || llmResult.email,
          eventDate: llmResult.eventDate || localFields.eventDate,
          eventTime: llmResult.eventTime || localFields.eventTime,
        };

        const detected = getDetectedFieldNames(merged);
        return {
          success: true,
          data: merged,
          confidence: 0.95,
          detectedFields: detected,
          summary: generateParseSummary(merged),
          source: "llm",
        };
      }
    } catch (llmError) {
      console.warn("LLM extraction failed, using robust local NLP fallback:", llmError);
    }
  } else if (openAiKey) {
    try {
      const llmResult = await extractWithOpenAI(cleanTranscript, openAiKey);
      if (llmResult) {
        const merged: ExtractedBookingFields = {
          ...localFields,
          ...llmResult,
          phone: localFields.phone || llmResult.phone,
          email: localFields.email || llmResult.email,
        };
        const detected = getDetectedFieldNames(merged);
        return {
          success: true,
          data: merged,
          confidence: 0.95,
          detectedFields: detected,
          summary: generateParseSummary(merged),
          source: "llm",
        };
      }
    } catch (llmError) {
      console.warn("OpenAI extraction failed, using robust local NLP fallback:", llmError);
    }
  }

  // Return local NLP result
  const detected = getDetectedFieldNames(localFields);
  return {
    success: detected.length > 0,
    data: localFields,
    confidence: detected.length > 3 ? 0.85 : 0.65,
    detectedFields: detected,
    summary: generateParseSummary(localFields),
    source: "local_nlp",
  };
}

/**
 * Gemini LLM Structured Extractor
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

Return STRICT valid JSON ONLY with these fields (omit fields not mentioned):
{
  "eventName": "Event title or name",
  "eventType": "Corporate Gala" | "Wedding" | "Birthday Celebration" | "Conference" | "Concert / Festival" | "Product Launch" | "Private Dinner" | "Other",
  "eventDate": "YYYY-MM-DD",
  "eventTime": "HH:MM",
  "guests": "guest count as string number e.g. '300'",
  "location": "venue or city name",
  "name": "client contact person name",
  "phone": "client phone number",
  "email": "client email address",
  "address": "client address if given",
  "requestedServices": ["list of requested services like Photography, Lighting, Sound, Decor"],
  "cateringIncluded": boolean,
  "cateringServingType": "PER_GUEST" | "PER_PLATE" | "FIXED",
  "description": "brief clean summary"
}
`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) return null;
  const json = await response.json();
  const rawContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) return null;

  return JSON.parse(rawContent) as ExtractedBookingFields;
}

/**
 * OpenAI LLM Structured Extractor
 */
async function extractWithOpenAI(
  text: string,
  apiKey: string
): Promise<ExtractedBookingFields | null> {
  const url = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
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

  if (!response.ok) return null;
  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return null;

  return JSON.parse(content) as ExtractedBookingFields;
}

function getDetectedFieldNames(fields: ExtractedBookingFields): string[] {
  const list: string[] = [];
  if (fields.eventName) list.push("Event Name");
  if (fields.eventType) list.push("Event Type");
  if (fields.eventDate) list.push("Event Date");
  if (fields.eventTime) list.push("Time");
  if (fields.guests) list.push("Guest Count");
  if (fields.location) list.push("Venue / Location");
  if (fields.name) list.push("Client Name");
  if (fields.phone) list.push("Phone");
  if (fields.email) list.push("Email");
  if (fields.requestedServices && fields.requestedServices.length > 0) {
    list.push(`Services (${fields.requestedServices.length})`);
  }
  if (fields.cateringIncluded) list.push("Catering");
  return list;
}

function generateParseSummary(fields: ExtractedBookingFields): string {
  const parts: string[] = [];
  if (fields.eventName) parts.push(fields.eventName);
  if (fields.eventDate) parts.push(`on ${fields.eventDate}`);
  if (fields.guests) parts.push(`for ${fields.guests} guests`);
  if (fields.location) parts.push(`at ${fields.location}`);
  if (fields.name) parts.push(`(Client: ${fields.name})`);
  return parts.length > 0 ? parts.join(" ") : "Details extracted from voice note.";
}
