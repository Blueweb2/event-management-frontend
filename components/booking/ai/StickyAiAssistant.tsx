"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Wand2,
  X,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Check,
  ShieldAlert,
} from "lucide-react";
import { useVoiceBooking, type VoiceLanguage } from "@/hooks/useVoiceBooking";
import type { ExtractedBookingFields, ParseBookingResult } from "@/lib/ai-booking-parser";
import type { BookingFormData } from "../types";
import { formatTime24to12, formatTime12to24 } from "@/lib/time-utils";

interface StickyAiAssistantProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onApply: (data: ExtractedBookingFields, overwriteConfirmed?: boolean) => void;
  currentFormData?: BookingFormData;
}



const PROCESSING_STEPS = [
  "Reading your message...",
  "Finding event details...",
  "Filling in the form...",
];

export default function StickyAiAssistant({
  isOpen: controlledIsOpen,
  onOpenChange,
  onApply,
  currentFormData,
}: StickyAiAssistantProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isPanelOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setPanelOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStepIndex, setProcessingStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [lowInfoWarning, setLowInfoWarning] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [pendingConflictData, setPendingConflictData] = useState<{
    extracted: ExtractedBookingFields;
    conflictingFields: string[];
  } | null>(null);

  // Voice dictation hook (defaults to auto speech recognition)
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceBooking("en-IN");

  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize live speech transcript with the textarea
  useEffect(() => {
    if (transcript) {
      setInputText((prev) => {
        // Avoid duplicating if text already ends with transcript
        if (prev.endsWith(transcript.trim())) return prev;
        return prev ? `${prev} ${transcript.trim()}` : transcript.trim();
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Cycle through progressive processing messages
  useEffect(() => {
    if (isProcessing) {
      setProcessingStepIndex(0);
      const interval = setInterval(() => {
        setProcessingStepIndex((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
      }, 750);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPanelOpen) {
        setPanelOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPanelOpen]);

  // Listen for external trigger events (e.g. from header) and auto start dictation
  useEffect(() => {
    const handleOpenTrigger = () => {
      setPanelOpen(true);
      if (isSpeechSupported) {
        startListening();
      }
    };
    window.addEventListener("open-ai-booking-assistant", handleOpenTrigger);
    return () => window.removeEventListener("open-ai-booking-assistant", handleOpenTrigger);
  }, [isSpeechSupported, startListening]);

  // Focus textarea when panel opens and automatically start voice dictation
  useEffect(() => {
    if (isPanelOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);

      // Auto dictate voice immediately upon opening
      if (isSpeechSupported && !isListening) {
        startListening();
      }
    } else {
      if (isListening) stopListening();
      setPendingConflictData(null);
      setErrorMessage("");
      setLowInfoWarning("");
    }
  }, [isPanelOpen, isSpeechSupported]);

  // Check for conflicts with existing form data
  const detectConflicts = (extracted: ExtractedBookingFields): string[] => {
    if (!currentFormData) return [];
    const conflicts: string[] = [];

    if (currentFormData.eventName?.trim() && extracted.eventName && currentFormData.eventName.trim() !== extracted.eventName.trim()) {
      conflicts.push("Event Name");
    }
    if (currentFormData.eventType?.trim() && extracted.eventType && currentFormData.eventType.trim() !== extracted.eventType.trim()) {
      conflicts.push("Event Type");
    }
    if (currentFormData.eventDate?.trim() && extracted.eventDate && currentFormData.eventDate.trim() !== extracted.eventDate.trim()) {
      conflicts.push("Event Date");
    }
    if (currentFormData.eventTime?.trim() && extracted.eventTime) {
      const extracted24 = formatTime12to24(extracted.eventTime) || extracted.eventTime;
      if (currentFormData.eventTime.trim() !== extracted24.trim()) {
        conflicts.push("Event Time");
      }
    }
    if (currentFormData.guests?.trim() && extracted.guests && currentFormData.guests.trim() !== extracted.guests.trim()) {
      conflicts.push("Number of Guests");
    }
    if (currentFormData.location?.trim() && extracted.location && currentFormData.location.trim() !== extracted.location.trim()) {
      conflicts.push("Place / Venue");
    }
    if (currentFormData.name?.trim() && extracted.name && currentFormData.name.trim() !== extracted.name.trim()) {
      conflicts.push("Customer Name");
    }
    if (currentFormData.phone?.trim() && extracted.phone && currentFormData.phone.trim() !== extracted.phone.trim()) {
      conflicts.push("Phone Number");
    }

    return conflicts;
  };

  const handleApplyDirect = (dataToApply: ExtractedBookingFields, overwrite = true) => {
    const finalData = { ...dataToApply };
    if (finalData.eventTime) {
      finalData.eventTime = formatTime12to24(finalData.eventTime) || finalData.eventTime;
    }

    onApply(finalData, overwrite);

    setSuccessToast("Event details added to form successfully!");
    setTimeout(() => setSuccessToast(""), 4500);

    setPendingConflictData(null);
    setPanelOpen(false);
  };

  // Main Submit handler
  const handleParseAndApply = async () => {
    const textToParse = inputText.trim();
    if (!textToParse) {
      setLowInfoWarning("Please type or speak a few words about your event.");
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsProcessing(true);
    setErrorMessage("");
    setLowInfoWarning("");
    setPendingConflictData(null);

    try {
      const response = await fetch("/api/ai/parse-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: textToParse }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const json: ParseBookingResult = await response.json();

      if (!json || !json.data) {
        throw new Error("Invalid response received from parser.");
      }

      const extracted = json.data;

      // Count meaningful fields detected
      const meaningfulCount = [
        extracted.eventName,
        extracted.eventType,
        extracted.eventDate,
        extracted.eventTime,
        extracted.guests,
        extracted.location,
        extracted.name,
        extracted.phone,
        extracted.email,
        extracted.cateringIncluded,
        extracted.requestedServices?.length,
      ].filter(Boolean).length;

      if (meaningfulCount === 0) {
        setLowInfoWarning("Please give a few more details (like the date, place, or number of guests).");
        return;
      }

      // Check for conflicts
      const conflicts = detectConflicts(extracted);
      if (conflicts.length > 0) {
        setPendingConflictData({
          extracted,
          conflictingFields: conflicts,
        });
        return;
      }

      // No conflicts -> apply immediately
      handleApplyDirect(extracted, true);
    } catch (err) {
      console.error("AI Parse failed:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not read event details. Please check your internet connection and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      {/* ========================================================
          1. STICKY FLOATING AI ASSISTANT BUTTON
          - Desktop: Fixed on right-center edge (always visible on scroll)
          - Mobile: Fixed on right side, safely above mobile bottom bar
      ======================================================== */}
      <div
        className="fixed z-40 transition-all duration-300 pointer-events-auto
          right-3.5 bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:right-5"
        style={{
          // Respect iOS safe-area-inset
          marginBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            const nextOpen = !isPanelOpen;
            setPanelOpen(nextOpen);
            if (nextOpen && isSpeechSupported && !isListening) {
              startListening();
            } else if (!nextOpen && isListening) {
              stopListening();
            }
          }}
          aria-expanded={isPanelOpen}
          aria-label="AI Voice Helper"
          className={`group relative flex items-center gap-2.5 rounded-full p-2.5 sm:px-4 sm:py-3 text-white transition-all duration-300 active:scale-95 cursor-pointer select-none ${
            isPanelOpen
              ? "bg-[#29241f] border-2 border-[#D4AF37] shadow-xl shadow-black/40 ring-4 ring-[#D4AF37]/20"
              : "bg-[#1E1B18] border border-[#D4AF37]/40 shadow-xl shadow-black/35 hover:shadow-2xl hover:border-[#D4AF37] hover:scale-105"
          }`}
          title="AI Voice Booking Helper (Auto Dictate)"
        >
          {/* Subtle Ambient Pulse Aura */}
          {!isPanelOpen && (
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#D4AF37]/20 via-amber-500/10 to-[#D4AF37]/20 blur-xs animate-pulse opacity-75 group-hover:opacity-100" />
          )}

          {/* Microphone Icon */}
          <div className="relative flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#9A6C37] text-white shadow-xs">
            <Mic size={16} className={isPanelOpen || isListening ? "scale-110 transition-transform text-[#FFE58F]" : "animate-pulse"} />
          </div>

          {/* Label (Always visible on desktop, compact on mobile) */}
          <div className="relative hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-black tracking-wide text-white">AI Voice</span>
            </div>
            <span className="text-[10px] text-[#FFE58F] font-bold mt-0.5">
              Auto Voice
            </span>
          </div>

          {/* Mobile Badge Label (Shown next to icon for touch clarity) */}
          <span className="sm:hidden text-[11px] font-extrabold text-[#FFE58F] pr-1">
            Voice
          </span>
        </button>
      </div>

      {/* ========================================================
          2. FLOATING SUCCESS TOAST
      ======================================================== */}
      {successToast && (
        <div className="fixed top-5 right-5 z-[70] flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-white px-4 py-3 text-xs font-bold text-emerald-900 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check size={14} />
          </div>
          <span>{successToast}</span>
        </div>
      )}

      {/* ========================================================
          3. INLINE COMPACT AI INPUT PANEL
          - NOT a full-screen modal!
          - Positioned docked beside button on desktop
          - Pinned neatly above bottom bar on mobile
      ======================================================== */}
      {isPanelOpen && (
        <>
          {/* Subtle Mobile Backdrop (Touch outside dismiss on small screens) */}
          <div
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity sm:bg-transparent sm:backdrop-blur-none"
            aria-hidden="true"
          />

          <div
            ref={panelRef}
            className="fixed z-50 flex flex-col rounded-3xl border border-[#E8E1D8] bg-white/98 shadow-2xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 overflow-hidden
              inset-x-3 bottom-24 max-h-[82vh]
              sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2 sm:w-[420px] sm:max-h-[88vh]"
            style={{
              marginBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0EAE1] bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF8F5] px-4 sm:px-5 py-3.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#9A6C37]/20 text-[#9A6C37] border border-[#D4AF37]/40">
                  <Mic size={16} className={isListening ? "text-rose-600 animate-pulse" : ""} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-[#29241F]">
                      AI Booking Helper
                    </h3>
                    {isListening && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-rose-700 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                        Listening...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Speak or type in English, Manglish, or മലയാളം
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 no-scrollbar">
              {/* Conflict Resolution Banner (if fields already have values) */}
              {pendingConflictData && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 space-y-2.5 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-900">
                        {pendingConflictData.conflictingFields.length} detail{pendingConflictData.conflictingFields.length > 1 ? "s are" : " is"} already filled in the form
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Do you want to update:{" "}
                        <strong>{pendingConflictData.conflictingFields.join(", ")}</strong>?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyDirect(pendingConflictData.extracted, true)}
                      className="flex-1 rounded-xl bg-amber-900 px-3 py-1.5 font-bold text-white hover:bg-black transition active:scale-95 text-center cursor-pointer shadow-2xs"
                    >
                      Update All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyDirect(pendingConflictData.extracted, false)}
                      className="flex-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 font-bold text-amber-900 hover:bg-amber-100 transition active:scale-95 text-center cursor-pointer"
                    >
                      Keep Existing (Fill Blank Only)
                    </button>
                  </div>
                </div>
              )}


              {/* Multiline Textarea with embedded Voice Dictation toggle */}
              <div className="relative rounded-2xl border border-gray-200 bg-white transition-all focus-within:border-[#9A6C37] focus-within:ring-2 focus-within:ring-[#9A6C37]/20 shadow-2xs">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (lowInfoWarning) setLowInfoWarning("");
                    if (errorMessage) setErrorMessage("");
                  }}
                  rows={4}
                  placeholder={`Speak or type your event details here...\n\nManglish Example:\n"500 perkk kalyanam Nov 15-nu vaikittu 6 manikku Nilamburil vechu, biriyani catering venam"\n\nEnglish Example:\n"Wedding for 500 guests on 15 November at 6 PM in Calicut"\n\n(Auto voice works - speak naturally in any language)`}
                  className="w-full resize-none rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm text-[#29241F] placeholder:text-gray-400 placeholder:text-xs leading-relaxed outline-none border-0 focus:ring-0"
                />

                {/* Bottom Bar inside Textarea: Auto Dictation status + Voice controls */}
                <div className="flex items-center justify-between border-t border-gray-100 bg-[#FAF8F5]/60 px-3 py-2 rounded-b-2xl">
                  {/* Auto Voice indicator */}
                  <div className="flex items-center gap-1.5">
                    {isListening ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 animate-pulse">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                        </span>
                        Listening now...
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Auto voice ready</span>
                    )}
                  </div>

                  {/* Microphone controls */}
                  <div className="flex items-center gap-2">
                    {isSpeechSupported && (
                      <button
                        type="button"
                        onClick={toggleVoiceRecording}
                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer active:scale-95 ${
                          isListening
                            ? "bg-rose-600 text-white shadow-xs animate-pulse"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs"
                        }`}
                        title={isListening ? "Stop listening" : "Tap to speak"}
                      >
                        {isListening ? (
                          <>
                            <MicOff size={13} />
                            <span className="text-[11px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <Mic size={13} className="text-[#9A6C37]" />
                            <span className="text-[11px]">Speak</span>
                          </>
                        )}
                      </button>
                    )}

                    {inputText && (
                      <button
                        type="button"
                        onClick={() => {
                          setInputText("");
                          setLowInfoWarning("");
                          setErrorMessage("");
                        }}
                        className="text-[11px] font-medium text-gray-400 hover:text-gray-700 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Live voice listening indicator */}
              {isListening && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-950 border border-rose-200 animate-pulse">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <span className="font-bold text-rose-700 shrink-0">Listening...</span>
                  {interimTranscript ? (
                    <span className="italic truncate text-rose-900 font-medium">"{interimTranscript}"</span>
                  ) : (
                    <span className="text-rose-600 text-[11px]">Speak now, your voice will appear here automatically</span>
                  )}
                </div>
              )}

              {/* Helper tip */}
              <div className="flex items-start gap-2 rounded-xl bg-[#FAF8F5] p-2.5 text-[11px] text-gray-500 border border-[#EFE8DE]">
                <Info size={14} className="text-[#9A6C37] shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> You can dictate in Manglish, English, or Malayalam. Mention the date, place, number of guests, and food or services you need.
                </span>
              </div>

              {/* Low information message */}
              {lowInfoWarning && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-900 border border-amber-200 animate-in fade-in">
                  <AlertCircle size={15} className="text-amber-700 shrink-0" />
                  <span>{lowInfoWarning}</span>
                </div>
              )}

              {/* Error message with retry */}
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-900 border border-rose-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleParseAndApply}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Try Again</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="border-t border-[#F0EAE1] bg-[#FAF8F5] p-3.5 sm:p-4 shrink-0">
              <button
                type="button"
                disabled={isProcessing || !inputText.trim()}
                onClick={handleParseAndApply}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#29241F] hover:bg-black px-4 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:shadow-lg transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin text-[#D4AF37]" />
                    <span className="text-[#FFE58F]">
                      {PROCESSING_STEPS[processingStepIndex] || "Reading your message..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-[#D4AF37]" />
                    <span> Fill Form Details</span>
                    <ArrowRight size={14} className="text-gray-400" />
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
