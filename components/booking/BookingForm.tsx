"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trash2, Sparkles } from "lucide-react";

import BookingProgress from "./BookingProgress";
import BookingNavigation from "./BookingNavigation";

import EventDetailsStep from "./steps/EventDetailsStep";
import ClientDetailsStep from "./steps/ClientDetailsStep";
import FoodMenuStep from "./steps/FoodMenuStep";
import ServicesItemsStep from "./steps/ServicesItemsStep";
import EstimatePreviewStep from "./steps/EstimatePreviewStep";
import type { BookingFormData } from "./types";
import { createEstimate, type Estimate } from "@/lib/estimates.api";

// ==========================================
// DRAFT STORAGE CONSTANTS (7 DAYS EXPIRY)
// ==========================================

const DRAFT_STORAGE_KEY = "pircello_booking_draft_v1";
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface BookingDraft {
  formData: BookingFormData;
  currentStep: number;
  savedAt: number;
}

// ==========================================
// INITIAL FORM DATA
// ==========================================

const initialFormData: BookingFormData = {
  // ========================================
  // Event Details
  // ========================================

  eventType: "",
  eventDate: "",
  eventTime: "",
  guests: "",
  location: "",
  eventName: "",
  description: "",

  // ========================================
  // Client Details
  // ========================================

  name: "",
  phone: "",
  email: "",
  message: "",
  address: "",
  referralSource: "",
  customReferral: "",

  // ========================================
  // Food & Catering Menu
  // ========================================

  foodMenu: {
    included: true,
    servingType: "FIXED",
    ratePerGuest: 0,
    totalFoodAmount: 0,
    notes: "",
    items: [],
  },

  // ========================================
  // Services & Items
  // ========================================

  services: [],

  // ========================================
  // Pricing
  // ========================================

  discountType: "percentage",
  discountValue: "0",
  additionalCharges: "0",
};

// ==========================================
// COMPONENT
// ==========================================

export default function BookingForm() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [error, setError] = useState("");
  const [createdEstimate, setCreatedEstimate] = useState<Estimate | null>(null);
  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false);
  const [draftRestoredInfo, setDraftRestoredInfo] = useState<{
    savedAt: number;
    daysLeft: number;
  } | null>(null);

  // Restore draft on mount if within 7 days; auto-delete if expired
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;

      const draft: BookingDraft = JSON.parse(raw);
      const now = Date.now();
      const age = now - (draft.savedAt || 0);

      // If draft is older than 7 days, delete automatically
      if (age > DRAFT_EXPIRY_MS || !draft.formData) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }

      // Check if draft has user-entered content to restore
      const hasContent =
        Boolean(draft.formData.eventName?.trim()) ||
        Boolean(draft.formData.name?.trim()) ||
        Boolean(draft.formData.phone?.trim()) ||
        Boolean(draft.formData.email?.trim()) ||
        Boolean(draft.formData.eventType) ||
        (Array.isArray(draft.formData.services) && draft.formData.services.length > 0) ||
        (draft.formData.foodMenu?.items && draft.formData.foodMenu.items.length > 0);

      if (hasContent) {
        setFormData(draft.formData);
        if (draft.currentStep && draft.currentStep >= 1 && draft.currentStep <= 5) {
          setCurrentStep(draft.currentStep);
        }
        const daysLeft = Math.max(1, Math.ceil((DRAFT_EXPIRY_MS - age) / (24 * 60 * 60 * 1000)));
        setDraftRestoredInfo({
          savedAt: draft.savedAt,
          daysLeft,
        });
      }
    } catch (err) {
      console.warn("Could not parse booking draft from localStorage", err);
    }
  }, []);

  // Auto-save draft on changes (held for 7 days)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasData =
      Boolean(formData.eventName.trim()) ||
      Boolean(formData.name.trim()) ||
      Boolean(formData.phone.trim()) ||
      Boolean(formData.email.trim()) ||
      Boolean(formData.eventType) ||
      formData.services.length > 0 ||
      (formData.foodMenu.items && formData.foodMenu.items.length > 0);

    if (hasData) {
      const draft: BookingDraft = {
        formData,
        currentStep,
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
        console.warn("Could not save booking draft to localStorage", err);
      }
    }
  }, [formData, currentStep]);

  // Discard draft & start fresh
  const handleDiscardDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setFormData(initialFormData);
    setCurrentStep(1);
    setDraftRestoredInfo(null);
    setError("");
  };

  // Update Field
  const updateField = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // Update Services
  const updateServices = (services: BookingFormData["services"]) => {
    setFormData((previous) => ({
      ...previous,
      services,
    }));

    if (error) {
      setError("");
    }
  };

  // VALIDATE STEP
  const validateStep = () => {
    setError("");

    // STEP 1 - EVENT DETAILS
    if (currentStep === 1) {
      if (!formData.eventName.trim()) {
        setError(
          "Please enter the event name.",
        );

        return false;
      }

      if (!formData.eventType.trim()) {
        setError(
          "Please select an event type.",
        );

        return false;
      }

      if (!formData.eventDate) {
        setError(
          "Please select the event date.",
        );

        return false;
      }

      if (!formData.eventTime) {
        setError(
          "Please select the event time.",
        );

        return false;
      }

      if (!formData.guests.trim()) {
        setError(
          "Please enter the number of guests.",
        );

        return false;
      }

      const guestCount = Number(
        formData.guests,
      );

      if (
        !Number.isInteger(guestCount) ||
        guestCount <= 0
      ) {
        setError(
          "Please enter a valid number of guests.",
        );

        return false;
      }

      if (!formData.location.trim()) {
        setError(
          "Please enter the event location.",
        );

        return false;
      }

      if (!formData.description.trim()) {
        setError(
          "Please enter event notes or setup requirements.",
        );

        return false;
      }
    }

    // STEP 2 - CLIENT DETAILS
    if (currentStep === 2) {
      if (!formData.name.trim()) {
        setError(
          "Please enter the client name.",
        );

        return false;
      }

      if (!formData.phone.trim()) {
        setError(
          "Please enter the client phone number.",
        );

        return false;
      }

      if (!formData.email.trim()) {
        setError(
          "Please enter the client email address.",
        );

        return false;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email.trim(),
        )
      ) {
        setError(
          "Please enter a valid email address.",
        );

        return false;
      }
    }

    // STEP 3 - FOOD MENU
    if (currentStep === 3) {
      if (formData.foodMenu?.included) {
        const invalidFoodItem = formData.foodMenu.items.some((item) => {
          const quantity = Number(item.quantity);
          const rate = Number(item.rate);
          return (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            !Number.isFinite(rate) ||
            rate < 0
          );
        });

        if (invalidFoodItem) {
          setError("Please check the quantity and rate for each food item.");
          return false;
        }
      }
    }

    // STEP 4 - SERVICES & ITEMS
    if (currentStep === 4) {
      if (
        formData.services.length === 0
      ) {
        setError(
          "Please select at least one service or equipment item.",
        );

        return false;
      }

      const invalidService =
        formData.services.find(
          (service) => {
            const quantity = Number(
              service.quantity,
            );

            const unitPrice = Number(
              service.unitPrice,
            );

            return (
              !service.serviceId ||
              !service.name.trim() ||
              !Number.isFinite(
                quantity,
              ) ||
              quantity <= 0 ||
              !Number.isFinite(
                unitPrice,
              ) ||
              unitPrice < 0
            );
          },
        );

      if (invalidService) {
        setError(
          "Please check the quantity and selected services.",
        );

        return false;
      }
    }

    // STEP 5 - ESTIMATE PREVIEW
    if (currentStep === 5) {
      const discount = Number(
        formData.discountValue,
      );

      const additionalCharges =
        Number(
          formData.additionalCharges,
        );

      if (
        !Number.isFinite(discount) ||
        discount < 0
      ) {
        setError(
          "Please enter a valid discount.",
        );

        return false;
      }

      if (
        !Number.isFinite(
          additionalCharges,
        ) ||
        additionalCharges < 0
      ) {
        setError(
          "Please enter valid additional charges.",
        );

        return false;
      }

      if (
        formData.discountType ===
          "percentage" &&
        discount > 100
      ) {
        setError(
          "Percentage discount cannot exceed 100%.",
        );

        return false;
      }
    }

    return true;
  };

  // NEXT STEP
  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep >= 5) {
      return;
    }

    setCurrentStep(
      (previous) => previous + 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // PREVIOUS STEP
  const previousStep = () => {
    setError("");

    if (currentStep <= 1) {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
      return;
    }

    setCurrentStep(
      (previous) => previous - 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // CREATE ESTIMATE
  const handleCreateEstimate = async () => {
    if (isCreatingEstimate || createdEstimate) {
      return;
    }

    if (!validateStep()) {
      return;
    }

    setError("");
    setIsCreatingEstimate(true);

    try {
      const result = await createEstimate({
        eventName: formData.eventName.trim(),
        eventType: formData.eventType.trim(),
        eventDate: formData.eventDate,
        eventTime: formData.eventTime.trim(),
        guests: Number(formData.guests),
        location: formData.location.trim(),
        description: formData.description.trim(),
        client: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          message: formData.message?.trim() || "",
          referralSource:
            formData.customReferral && formData.customReferral.trim()
              ? `${formData.referralSource || "Referral"} (${formData.customReferral.trim()})`
              : formData.referralSource || "",
        },
        services: formData.services.map((item) => ({
          serviceId: item.serviceId,
          optionId: item.optionId ?? null,
          quantity: Number(item.quantity || 1),
        })),
        foodMenu: formData.foodMenu,
        discountType: formData.discountType || "percentage",
        discountValue: Number(formData.discountValue || 0),
        additionalCharges: Number(formData.additionalCharges || 0),
      });

      setCreatedEstimate(result);
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setDraftRestoredInfo(null);
    } catch (err) {
      console.error("Failed to create estimate:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create estimate. Please try again."
      );
    } finally {
      setIsCreatingEstimate(false);
    }
  };

  // SUBMIT
  const submitBooking = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep === 5) {
      if (createdEstimate) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }

        // ======================================
        // Redirect to customer success page
        // ======================================

        const params = new URLSearchParams({
          ref: createdEstimate.estimateNumber || "",
          event: createdEstimate.eventName || "",
          date: createdEstimate.eventDate || "",
          time: createdEstimate.eventTime || "",
          guests: String(createdEstimate.guests || ""),
          location: createdEstimate.location || "",
          name: createdEstimate.client?.name || "",
          email: createdEstimate.client?.email || "",
          phone: createdEstimate.client?.phone || "",
          total: String(createdEstimate.total || ""),
        });

        router.push(`/booking/success?${params.toString()}`);
        return;
      }

      handleCreateEstimate();
      return;
    }

    nextStep();
  };

  // Direct step jump (only for previously validated/completed steps)
  const handleStepJump = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // RENDER
  return (
    <div className="pb-24 sm:pb-12">
      {/* Progress */}
      <BookingProgress
        currentStep={currentStep}
        onStepClick={handleStepJump}
      />

      {/* Main Content */}
      <section className="mt-4 sm:mt-8">
        <div className={`mx-auto transition-all duration-300 ${currentStep === 4 ? "max-w-6xl" : "max-w-4xl"}`}>
          {/* Draft Restored Banner */}
          {draftRestoredInfo && (
            <div className="mb-4 sm:mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 sm:p-4 text-xs text-amber-900 shadow-2xs backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-amber-700 shrink-0" />
                <span>
                  <strong>Draft Restored:</strong> We recovered your in-progress proposal from{" "}
                  {new Date(draftRestoredInfo.savedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({draftRestoredInfo.daysLeft} days remaining before automatic cleanup).
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs active:scale-95"
                  title="Discard this draft and start a blank proposal"
                >
                  <Trash2 size={12} />
                  Start Fresh
                </button>
                <button
                  type="button"
                  onClick={() => setDraftRestoredInfo(null)}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 px-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 - EVENT DETAILS */}
          {currentStep === 1 && (
            <EventDetailsStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* STEP 2 - CLIENT DETAILS */}
          {currentStep === 2 && (
            <ClientDetailsStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* ====================================
              STEP 3 - FOOD & CATERING MENU
          ==================================== */}

          {currentStep === 3 && (
            <FoodMenuStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* ====================================
              STEP 4 - SERVICES & ITEMS
          ==================================== */}

          {currentStep === 4 && (
            <ServicesItemsStep
              formData={formData}
              updateServices={
                updateServices
              }
            />
          )}

          {/* ====================================
              STEP 5 - ESTIMATE PREVIEW
          ==================================== */}

          {currentStep === 5 && (
            <EstimatePreviewStep
              formData={formData}
              updateField={updateField}
              estimate={createdEstimate}
              onEstimateCreated={setCreatedEstimate}
              isCreating={isCreatingEstimate}
              onCreateEstimate={handleCreateEstimate}
            />
          )}

          {/* ====================================
              ERROR
          ==================================== */}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2"
            >
              <p className="text-xs sm:text-sm font-semibold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* ====================================
              NAVIGATION
          ==================================== */}

          <BookingNavigation
            currentStep={currentStep}
            totalSteps={5}
            onBack={previousStep}
            onNext={nextStep}
            onSubmit={submitBooking}
            loading={isCreatingEstimate}
            submitLabel={
              currentStep === 5
                ? createdEstimate
                  ? "View Confirmation"
                  : "Create Estimate"
                : undefined
            }
          />
        </div>
      </section>
    </div>
  );
}