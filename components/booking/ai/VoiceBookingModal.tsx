"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Check,
  RefreshCw,
  Volume2,
  Calendar,
  Users,
  MapPin,
  Phone,
  FileText,
  Layers,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Globe,
} from "lucide-react";

import { useVoiceBooking, type VoiceLanguage } from "@/hooks/useVoiceBooking";
import type { ExtractedBookingFields, ParseBookingResult } from "@/lib/ai-booking-parser";
import { formatTime24to12, formatTime12to24 } from "@/lib/time-utils";

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ExtractedBookingFields) => void;
}

const PROMPTS_BY_LANG: Record<VoiceLanguage, Array<{ label: string; text: string }>> = {
  "en-IN": [
    {
      label: "Luxury Wedding (English)",
      text: "Book a luxury wedding for Rahul and Priya on 25th November 2026 at Grand Palace, Bangalore. Around 350 guests from 6 PM. Client phone 9876543210, email rahul@gmail.com. We need stage lighting, floral decor, photography, and buffet catering.",
    },
    {
      label: "Annual Conference (English)",
      text: "Corporate annual conference for TechNova Corp on December 15th 2026 at Leela Palace. 200 attendees from 9 AM. Contact person Amit Sharma, phone 9811223344. Needs sound system and LED wall.",
    },
    {
      label: "Manglish Mixed Request",
      text: "Rahul and Priya wedding on 25 November 2026 at Grand Palace, Bangalore. Around 350 perkk vaikittu 6 manikku. Contact phone 9876543210, email rahul@gmail.com. Need stage lighting, floral decoration, photography and buffet catering.",
    },
  ],
  "ml-IN": [
    {
      label: "കല്യാണം (Malayalam Wedding)",
      text: "2026 നവംബർ 25-ന് ബാംഗ്ലൂർ ഗ്രാൻഡ് പാലസിൽ വെച്ച് രാഹുലിന്റെയും പ്രിയയുടെയും കല്യാണം. വൈകുന്നേരം 6 മണി മുതൽ ഏകദേശം 350 ആളുകൾ. ക്ലയന്റ് ഫോൺ 9876543210, ഇമെയിൽ rahul@gmail.com. സ്റ്റേജ് ലൈറ്റിംഗ്, ഫ്ലോറൽ ഡെക്കറേഷൻ, ഫോട്ടോഗ്രാഫി, ബുഫെ കാറ്ററിംഗ് വേണം.",
    },
    {
      label: "സമ്മേളനം (Malayalam Conference)",
      text: "2026 ഡിസംബർ 15-ന് ലീല പാലസിൽ വെച്ച് വാർഷിക സമ്മേളനം. രാവിലെ 9 മണിക്ക് 200 പേർ പങ്കെടുക്കും. ബന്ധപ്പെടേണ്ട വ്യക്തി ജോൺ, ഫോൺ 9845012345, ഇമെയിൽ john@corp.com. സൗണ്ട് സിസ്റ്റം വേണം.",
    },
    {
      label: "പിറന്നാൾ ആഘോഷം (Malayalam Birthday)",
      text: "2027 ജനുവരി 5-ന് കമ്മ്യൂണിറ്റി ഹാളിൽ വെച്ച് പിറന്നാൾ ആഘോഷം. വൈകുന്നേരം 4 മണിക്ക് അമ്പത് ആളുകൾ. ക്ലയന്റ് ആരവ്.",
    },
  ],
};

export default function VoiceBookingModal({
  isOpen,
  onClose,
  onApply,
}: VoiceBookingModalProps) {
  const [mounted] = useState<boolean>(() => typeof window !== "undefined");
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseBookingResult | null>(null);

  const {
    isSupported,
    language,
    setLanguage,
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceBooking();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const currentDisplay = (transcript + (interimTranscript ? " " + interimTranscript : "")).trim();

  const handleParse = async (textToParse?: string) => {
    const raw = (textToParse !== undefined ? textToParse : transcript).trim();
    if (!raw) return;

    if (isListening) {
      stopListening();
    }

    setIsParsing(true);
    setParseResult(null);

    try {
      const response = await fetch("/api/ai/parse-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: raw }),
      });

      const json: ParseBookingResult = await response.json();
      if (json.data?.eventTime) {
        json.data.eventTime = formatTime24to12(json.data.eventTime);
      }
      setParseResult(json);
    } catch (err) {
      console.error("Failed to parse booking note:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    if (parseResult?.data) {
      const dataToApply = { ...parseResult.data };
      if (dataToApply.eventTime) {
        dataToApply.eventTime =
          formatTime12to24(dataToApply.eventTime) || dataToApply.eventTime;
      }
      onApply(dataToApply);
      onClose();
    }
  };

  const handleUsePrompt = (prompt: string) => {
    resetTranscript();
    setTranscript(prompt);
    handleParse(prompt);
  };

  const handleResetAll = () => {
    resetTranscript();
    setParseResult(null);
  };

  const updatePreviewField = (field: keyof ExtractedBookingFields, val: string) => {
    setParseResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: val,
        },
      };
    });
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FAF8F5] border border-[#E8E1D8] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E8E1D8] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9A6C37] to-[#B8894B] text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#29241F]">
                  AI Voice Booking Assistant
                </h2>
                <span className="rounded-full bg-[#B8894B]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#9A6C37] uppercase tracking-wider">
                  Auto-Fill
                </span>
              </div>
              <p className="text-xs text-[#756D64]">
                Speak or paste event notes in English or മലയാളം to fill proposals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#756D64] hover:bg-[#F0ECE4] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Unsupported Browser Alert Notice */}
          {!isSupported && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Live voice recording is not supported in this browser</p>
                <p className="text-[11px] text-amber-800">
                  You can type or paste customer inquiry messages directly in the text box below to auto-fill.
                </p>
              </div>
            </div>
          )}

          {/* Main Voice Control Center */}
          <div className="rounded-3xl border border-[#E8E1D8] bg-white p-5 sm:p-6 text-center space-y-4 shadow-xs relative overflow-hidden">
            {/* Animated Wave Background while listening */}
            {isListening && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 animate-pulse pointer-events-none" />
            )}

            {/* Language Selector */}
            <div className="flex items-center justify-center gap-2 relative z-10">
              <span className="text-xs font-bold text-[#756D64] flex items-center gap-1.5">
                <Globe size={13} className="text-[#9A6C37]" />
                Language:
              </span>
              <div className="inline-flex rounded-2xl bg-[#F0ECE4] p-1 border border-[#E8E1D8]">
                <button
                  type="button"
                  onClick={() => setLanguage("en-IN")}
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    language === "en-IN"
                      ? "bg-white text-[#29241F] shadow-xs"
                      : "text-[#756D64] hover:text-[#29241F]"
                  }`}
                >
                  English (en-IN)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ml-IN")}
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    language === "ml-IN"
                      ? "bg-white text-[#9A6C37] shadow-xs"
                      : "text-[#756D64] hover:text-[#29241F]"
                  }`}
                >
                  മലയാളം (ml-IN)
                </button>
              </div>
            </div>

            {/* Microphone Button */}
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!isSupported}
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                  !isSupported
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                    : isListening
                    ? "bg-red-500 text-white ring-8 ring-red-100 scale-105 animate-pulse cursor-pointer"
                    : "bg-gradient-to-br from-[#29241F] to-[#403932] text-white hover:scale-105 active:scale-95 hover:shadow-2xl cursor-pointer"
                }`}
                title={
                  !isSupported
                    ? "Speech recognition not supported in this browser"
                    : isListening
                    ? "Click to stop listening"
                    : `Click to speak (${language === "ml-IN" ? "മലയാളം" : "English"})`
                }
              >
                {isListening ? (
                  <MicOff size={32} className="animate-bounce" />
                ) : (
                  <Mic size={32} className="text-[#D4AF37]" />
                )}
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
                  </span>
                )}
              </button>
            </div>

            {/* State Status Text */}
            <div>
              <p className="text-sm font-bold text-[#29241F]">
                {isListening
                  ? language === "ml-IN"
                    ? "നിങ്ങളുടെ ശബ്ദം കേൾക്കുന്നു..."
                    : "Listening to your voice..."
                  : isParsing
                  ? "വിവരങ്ങൾ പരിശോധിക്കുന്നു..."
                  : parseResult?.success
                  ? "Event details extracted successfully!"
                  : parseResult && !parseResult.success
                  ? "No event details recognized"
                  : isSupported
                  ? language === "ml-IN"
                    ? "മൈക്രോഫോൺ അമർത്തി മലയാളത്തിലോ ഇംഗ്ലീഷിലോ പറയുക"
                    : "Tap the microphone and describe your event"
                  : "Type or paste your event details below"}
              </p>
              <p className="text-xs text-[#756D64] mt-0.5">
                {isListening
                  ? language === "ml-IN"
                    ? "തീയതി, വേദി, സമയം, അതിഥികളുടെ എണ്ണം, ഫോൺ നമ്പർ എന്നിവ പറയുക"
                    : "Speak naturally about the event name, date, guests, location, and client info"
                  : "Supports English, മലയാളം, and Manglish WhatsApp/voice messages"}
              </p>
            </div>

            {/* Speech error notice */}
            {speechError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                {speechError}
              </div>
            )}

            {/* Live Voice Transcript or Textarea */}
            <div className="relative text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9A6C37] mb-1.5">
                Transcript / Inquiry Text ({language === "ml-IN" ? "മലയാളം / English" : "English"}):
              </label>
              <textarea
                rows={3}
                value={currentDisplay}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={
                  language === "ml-IN"
                    ? "ഉദാ: 2026 നവംബർ 25-ന് ബാംഗ്ലൂർ ഗ്രാൻഡ് പാലസിൽ വെച്ച് രാഹുലിന്റെ കല്യാണം, 350 പേർ, വൈകുന്നേരം 6 മണി, ഫോൺ 9876543210..."
                    : "e.g. Wedding for Rahul and Priya on 25th Nov 2026 with 350 guests at Grand Palace, client phone 9876543210..."
                }
                className="w-full rounded-2xl border border-[#E8E1D8] bg-[#FAF8F5] p-3 text-xs text-[#29241F] outline-none focus:border-[#B8894B] focus:bg-white transition resize-none leading-relaxed"
              />

              {interimTranscript && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-700 italic">
                  <Volume2 size={13} className="shrink-0 animate-pulse" />
                  <span>Hearing: &quot;{interimTranscript}&quot;</span>
                </div>
              )}
            </div>

            {/* Action Bar for Voice Input */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F0ECE4]">
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#756D64] hover:text-[#29241F] transition cursor-pointer px-2 py-1"
              >
                <RefreshCw size={12} />
                <span>Clear</span>
              </button>

              <button
                type="button"
                disabled={!transcript.trim() || isParsing}
                onClick={() => handleParse()}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                  !transcript.trim() || isParsing
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#9A6C37] to-[#B8894B] text-white hover:brightness-105 active:scale-95"
                }`}
              >
                {isParsing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing Details...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-[#FFE58F]" />
                    <span>Extract & Preview Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Example Prompts */}
          {!parseResult && !isParsing && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#756D64]">
                ✨ Or Click a Sample Scenario to Test ({language === "ml-IN" ? "മലയാളം" : "English"}):
              </p>
              <div className="grid gap-2">
                {PROMPTS_BY_LANG[language].map((promptItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUsePrompt(promptItem.text)}
                    className="text-left rounded-2xl border border-[#E8E1D8] bg-white p-3 text-xs text-[#29241F] hover:border-[#B8894B] hover:bg-[#FAF8F5] transition shadow-2xs group flex items-start gap-2.5 cursor-pointer"
                  >
                    <span className="shrink-0 text-sm">💡</span>
                    <div className="flex-1 space-y-0.5">
                      <span className="text-[10px] font-bold text-[#9A6C37] uppercase tracking-wider block">
                        {promptItem.label}
                      </span>
                      <span className="leading-relaxed text-[#756D64] group-hover:text-[#29241F] block">
                        &quot;{promptItem.text}&quot;
                      </span>
                    </div>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-[#B8894B] opacity-0 group-hover:opacity-100 transition mt-0.5"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Fields Preview Box (Editable to keep uncertain fields flexible) */}
          {parseResult && (
            <div
              className={`rounded-3xl border p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 ${
                parseResult.success
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-amber-200 bg-amber-50/50"
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#E8E1D8]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${
                      parseResult.success ? "bg-emerald-600" : "bg-amber-600"
                    }`}
                  >
                    {parseResult.success ? <Check size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#29241F]">
                      {parseResult.success
                        ? `Detected ${parseResult.detectedFields.length} Fields (Editable in preview)`
                        : "No Recognizable Booking Details Found"}
                    </h3>
                    <p className="text-[11px] text-[#756D64]">
                      {parseResult.success
                        ? "EventOps Smart Bilingual Parser (English / മലയാളം)"
                        : "Try mentioning date, guest count, or venue"}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full border text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider ${
                    parseResult.success
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  {(parseResult.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>

              {parseResult.success ? (
                <>
                  {/* Grid of Extracted Info (Directly editable inputs for uncertain fields) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Event Name */}
                    <div className="rounded-xl bg-white p-2.5 border border-[#E8E1D8] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                        <FileText size={11} className="text-[#9A6C37]" /> Event Name
                      </span>
                      <input
                        type="text"
                        value={parseResult.data.eventName || ""}
                        onChange={(e) => updatePreviewField("eventName", e.target.value)}
                        placeholder="e.g. Rahul & Priya Wedding"
                        className="mt-1 w-full font-bold text-xs text-[#29241F] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                      />
                    </div>

                    {/* Event Type */}
                    <div className="rounded-xl bg-white p-2.5 border border-[#E8E1D8] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} className="text-[#9A6C37]" /> Event Type
                      </span>
                      <input
                        type="text"
                        value={parseResult.data.eventType || ""}
                        onChange={(e) => updatePreviewField("eventType", e.target.value)}
                        placeholder="e.g. Wedding, Conference"
                        className="mt-1 w-full font-bold text-xs text-[#29241F] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="rounded-xl bg-white p-2.5 border border-[#E8E1D8] shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={11} className="text-[#9A6C37]" /> Date & Time
                        </span>
                        {parseResult.data.eventTime && (
                          <span className="text-[10px] font-extrabold text-[#9A6C37] bg-[#B8894B]/10 px-2 py-0.5 rounded-full">
                            {formatTime24to12(parseResult.data.eventTime)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={parseResult.data.eventDate || ""}
                          onChange={(e) => updatePreviewField("eventDate", e.target.value)}
                          placeholder="YYYY-MM-DD"
                          className="w-1/2 font-bold text-xs text-[#29241F] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                        />
                        <span className="text-[#756D64]">·</span>
                        <input
                          type="text"
                          value={parseResult.data.eventTime || ""}
                          onChange={(e) => updatePreviewField("eventTime", e.target.value)}
                          placeholder="e.g. 6:00 PM"
                          title="Enter time in 12-hour (e.g. 6:00 PM) or 24-hour format"
                          className="w-1/2 font-bold text-xs text-[#29241F] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                        />
                      </div>
                    </div>

                    {/* Guest Count */}
                    <div className="rounded-xl bg-white p-2.5 border border-[#E8E1D8] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                        <Users size={11} className="text-[#9A6C37]" /> Guests
                      </span>
                      <input
                        type="text"
                        value={parseResult.data.guests || ""}
                        onChange={(e) => updatePreviewField("guests", e.target.value)}
                        placeholder="e.g. 350"
                        className="mt-1 w-full font-bold text-xs text-[#29241F] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                      />
                    </div>

                    {/* Location */}
                    <div className="rounded-xl bg-white p-2.5 border border-[#E8E1D8] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={11} className="text-[#9A6C37]" /> Location / Venue
                      </span>
                      <input
                        type="text"
                        value={parseResult.data.location || ""}
                        onChange={(e) => updatePreviewField("location", e.target.value)}
                        placeholder="e.g. Grand Palace, Bangalore"
                        className="mt-1 w-full font-bold text-xs text-[#29241F] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                      />
                    </div>

                    {/* Client Contact */}
                    <div className="rounded-xl bg-white p-2.5 border border-[#E8E1D8] shadow-2xs">
                      <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                        <Phone size={11} className="text-[#9A6C37]" /> Client Info
                      </span>
                      <input
                        type="text"
                        value={parseResult.data.name || ""}
                        onChange={(e) => updatePreviewField("name", e.target.value)}
                        placeholder="Client name"
                        className="mt-1 w-full font-bold text-xs text-[#29241F] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                      />
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={parseResult.data.phone || ""}
                          onChange={(e) => updatePreviewField("phone", e.target.value)}
                          placeholder="Phone (10-digit)"
                          className="w-1/2 text-[11px] text-[#756D64] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                        />
                        <input
                          type="text"
                          value={parseResult.data.email || ""}
                          onChange={(e) => updatePreviewField("email", e.target.value)}
                          placeholder="Email"
                          className="w-1/2 text-[11px] text-[#756D64] bg-transparent border-b border-[#E8E1D8]/60 focus:border-[#B8894B] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Matched Services Tags */}
                  {parseResult.data.requestedServices && parseResult.data.requestedServices.length > 0 && (
                    <div className="rounded-xl bg-white p-3 border border-[#E8E1D8]">
                      <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <Layers size={11} className="text-[#9A6C37]" /> Requested Services Deliverables:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {parseResult.data.requestedServices.map((svc, sIdx) => (
                          <span
                            key={sIdx}
                            className="rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-1 text-[11px] font-semibold"
                          >
                            ✓ {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Fields Notice */}
                  {parseResult.missingFields && parseResult.missingFields.length > 0 && (
                    <div className="rounded-xl bg-white/70 p-3 border border-[#E8E1D8] text-[11px] text-[#756D64]">
                      <span className="font-bold text-[#29241F]">Not mentioned in inquiry: </span>
                      {parseResult.missingFields.join(", ")} (you can edit them above or in the proposal steps).
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-amber-800">
                  We could not detect standard event details like a date, guest count, or venue. Please rephrase or type additional details.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E8E1D8] bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#E8E1D8] bg-white px-4 py-2 text-xs font-semibold text-[#756D64] hover:bg-[#F0ECE4] transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parseResult?.success}
            onClick={handleApply}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
              !parseResult?.success
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
            }`}
          >
            <Check size={14} />
            <span>Apply to Booking Form</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
