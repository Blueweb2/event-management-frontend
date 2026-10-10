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
  Mail,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

import { useVoiceBooking } from "@/hooks/useVoiceBooking";
import type { ExtractedBookingFields, ParseBookingResult } from "@/lib/ai-booking-parser";

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ExtractedBookingFields) => void;
}

const SAMPLE_PROMPTS = [
  "Book a luxury wedding for Rahul and Priya on 25th November at Grand Palace, Bangalore. Around 350 guests from 6 PM. Client phone 9876543210, email rahul@gmail.com. We need stage lighting, floral decor, and photography.",
  "Corporate annual conference for TechNova Corp on December 15th at Leela Palace. 200 attendees from 9 AM. Contact person Amit Sharma, phone 9811223344. Needs sound system and LED wall.",
  "Birthday celebration for Aarav turning 10 on October 28th at Palm Gardens. 80 guests at 5 PM. Client Priya Patel, phone 9898765432. Include buffet catering and DJ.",
];

export default function VoiceBookingModal({
  isOpen,
  onClose,
  onApply,
}: VoiceBookingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseBookingResult | null>(null);
  const [manualText, setManualText] = useState("");
  const [activeTab, setActiveTab] = useState<"voice" | "text">("voice");

  const {
    isSupported,
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceBooking();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update manualText if speech transcript changes
  useEffect(() => {
    if (transcript) {
      setManualText(transcript);
    }
  }, [transcript]);

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

  const currentText = (transcript + (interimTranscript ? " " + interimTranscript : "")).trim() || manualText;

  const handleParse = async (textToParse?: string) => {
    const raw = textToParse || currentText;
    if (!raw.trim()) return;

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
      setParseResult(json);
    } catch (err) {
      console.error("Failed to parse booking note:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    if (parseResult?.data) {
      onApply(parseResult.data);
      onClose();
    }
  };

  const handleUsePrompt = (prompt: string) => {
    resetTranscript();
    setManualText(prompt);
    setTranscript(prompt);
    handleParse(prompt);
  };

  const handleResetAll = () => {
    resetTranscript();
    setManualText("");
    setParseResult(null);
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
                Speak or paste event notes to fill the proposal in seconds.
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
          {/* Main Voice Control Center */}
          <div className="rounded-3xl border border-[#E8E1D8] bg-white p-5 sm:p-6 text-center space-y-4 shadow-xs relative overflow-hidden">
            {/* Animated Wave Background while listening */}
            {isListening && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 animate-pulse pointer-events-none" />
            )}

            {/* Giant Microphone Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white ring-8 ring-red-100 scale-105 animate-pulse"
                    : "bg-gradient-to-br from-[#29241F] to-[#403932] text-white hover:scale-105 active:scale-95 hover:shadow-2xl"
                }`}
                title={isListening ? "Click to stop listening" : "Click to speak"}
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
                  ? "Listening to your voice..."
                  : isParsing
                  ? "AI is extracting event details..."
                  : parseResult
                  ? "Event details extracted successfully!"
                  : "Tap the microphone and describe your event"}
              </p>
              <p className="text-xs text-[#756D64] mt-0.5">
                {isListening
                  ? "Speak naturally about the event name, date, guests, location, and client info"
                  : "Or type/paste a WhatsApp message or client inquiry below"}
              </p>
            </div>

            {/* Speech error notice (if any) */}
            {speechError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                {speechError}
              </div>
            )}

            {/* Live Voice Transcript or Textarea */}
            <div className="relative text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9A6C37] mb-1.5">
                Spoken / Pasted Transcript:
              </label>
              <textarea
                rows={3}
                value={currentText}
                onChange={(e) => {
                  setManualText(e.target.value);
                  setTranscript(e.target.value);
                }}
                placeholder="e.g. Wedding for Rahul and Priya on 25th Nov with 350 guests at Grand Palace, client phone 9876543210..."
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
                disabled={!currentText.trim() || isParsing}
                onClick={() => handleParse()}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                  !currentText.trim() || isParsing
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#9A6C37] to-[#B8894B] text-white hover:brightness-105 active:scale-95"
                }`}
              >
                {isParsing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing with AI...</span>
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
                ✨ Or Click a Quick Sample Scenario to Test:
              </p>
              <div className="grid gap-2">
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUsePrompt(prompt)}
                    className="text-left rounded-2xl border border-[#E8E1D8] bg-white p-3 text-xs text-[#29241F] hover:border-[#B8894B] hover:bg-[#FAF8F5] transition shadow-2xs group flex items-start gap-2.5 cursor-pointer"
                  >
                    <span className="shrink-0 text-sm">💡</span>
                    <span className="flex-1 leading-relaxed text-[#756D64] group-hover:text-[#29241F]">
                      &quot;{prompt}&quot;
                    </span>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-[#B8894B] opacity-0 group-hover:opacity-100 transition mt-0.5"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Fields Preview Box */}
          {parseResult && parseResult.data && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950">
                      AI Detected {parseResult.detectedFields.length} Fields
                    </h3>
                    <p className="text-[11px] text-emerald-700">
                      Powered by {parseResult.source === "llm" ? "Gemini AI" : "EventOps Smart NLP"} · Ready to populate form
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  {(parseResult.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>

              {/* Grid of Extracted Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Event Name */}
                <div className="rounded-xl bg-white p-3 border border-[#E8E1D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                    <FileText size={11} className="text-[#9A6C37]" /> Event Name
                  </span>
                  <p className="mt-1 font-bold text-[#29241F]">
                    {parseResult.data.eventName || "—"}
                  </p>
                </div>

                {/* Event Type */}
                <div className="rounded-xl bg-white p-3 border border-[#E8E1D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="text-[#9A6C37]" /> Event Type
                  </span>
                  <p className="mt-1 font-bold text-[#29241F]">
                    {parseResult.data.eventType || "—"}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="rounded-xl bg-white p-3 border border-[#E8E1D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={11} className="text-[#9A6C37]" /> Date & Time
                  </span>
                  <p className="mt-1 font-bold text-[#29241F]">
                    {parseResult.data.eventDate || "—"}{" "}
                    {parseResult.data.eventTime ? `· ${parseResult.data.eventTime}` : ""}
                  </p>
                </div>

                {/* Guest Count */}
                <div className="rounded-xl bg-white p-3 border border-[#E8E1D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                    <Users size={11} className="text-[#9A6C37]" /> Guests
                  </span>
                  <p className="mt-1 font-bold text-[#29241F]">
                    {parseResult.data.guests ? `${parseResult.data.guests} Guests` : "—"}
                  </p>
                </div>

                {/* Location */}
                <div className="rounded-xl bg-white p-3 border border-[#E8E1D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={11} className="text-[#9A6C37]" /> Location / Venue
                  </span>
                  <p className="mt-1 font-bold text-[#29241F]">
                    {parseResult.data.location || "—"}
                  </p>
                </div>

                {/* Client Contact */}
                <div className="rounded-xl bg-white p-3 border border-[#E8E1D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#756D64] uppercase tracking-wider flex items-center gap-1">
                    <Phone size={11} className="text-[#9A6C37]" /> Client Info
                  </span>
                  <p className="mt-1 font-bold text-[#29241F]">
                    {parseResult.data.name || "Client"}
                  </p>
                  <p className="text-[11px] text-[#756D64] mt-0.5">
                    {parseResult.data.phone || "No phone"} · {parseResult.data.email || "No email"}
                  </p>
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
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E8E1D8] bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#E8E1D8] bg-white px-4 py-2 text-xs font-semibold text-[#756D64] hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parseResult?.data}
            onClick={handleApply}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
              !parseResult?.data
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
