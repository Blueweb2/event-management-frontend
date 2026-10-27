"use client";

import React from "react";
import StickyAiAssistant from "./StickyAiAssistant";
import type { ExtractedBookingFields } from "@/lib/ai-booking-parser";

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ExtractedBookingFields) => void;
}

/**
 * Backward compatibility wrapper forwarding to modern StickyAiAssistant.
 */
export default function VoiceBookingModal({
  isOpen,
  onClose,
  onApply,
}: VoiceBookingModalProps) {
  return (
    <StickyAiAssistant
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onApply={onApply}
    />
  );
}
