"use client";

import { useState } from "react";

import BookingProgress from "./BookingProgress";
import BookingNavigation from "./BookingNavigation";
import BookingSummary from "./BookingSummary";

import EventDetailsStep from "./steps/EventDetailsStep";
import PackageStep from "./steps/PackageStep";
import FoodRequirementsStep from "./steps/FoodRequirementsStep";
import CustomerDetailsStep from "./steps/CustomerDetailsStep";

import type { BookingFormData } from "./types";

const initialFormData: BookingFormData = {
  eventType: "",
  eventDate: "",
  eventTime: "",
  guests: "",
  location: "",

  package: "",

  foodType: "",
  meals: [],
  foodRequirements: "",

  requirements: [],
  otherRequirements: "",

  name: "",
  phone: "",
  email: "",
  message: "",
};

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] =
    useState<BookingFormData>(initialFormData);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  /**
   * Update normal string fields
   */
  const updateField = (
    field: keyof BookingFormData,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Clear validation message when user edits
    if (error) {
      setError("");
    }
  };

  /**
   * Toggle checkbox / multi-select values
   */
  const toggleArrayValue = (
    field: "meals" | "requirements",
    value: string,
  ) => {
    setFormData((previous) => {
      const current = previous[field];

      return {
        ...previous,
        [field]: current.includes(value)
          ? current.filter(
              (item) => item !== value,
            )
          : [...current, value],
      };
    });

    if (error) {
      setError("");
    }
  };

  /**
   * Validate the current step
   */
  const validateStep = () => {
    setError("");

    // --------------------------------
    // STEP 1 - EVENT DETAILS
    // --------------------------------
    if (currentStep === 1) {
      if (!formData.eventType.trim()) {
        setError("Please select an event type.");
        return false;
      }

      if (!formData.eventDate) {
        setError("Please select your event date.");
        return false;
      }

      if (!formData.eventTime) {
        setError("Please select your event time.");
        return false;
      }

      if (!formData.guests.trim()) {
        setError(
          "Please enter the number of guests.",
        );
        return false;
      }

      const guestCount = Number(formData.guests);

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
    }

    // --------------------------------
    // STEP 2 - PACKAGE
    // --------------------------------
    if (currentStep === 2) {
      if (!formData.package) {
        setError(
          "Please select an event package.",
        );
        return false;
      }
    }

    // --------------------------------
    // STEP 3 - FOOD
    // --------------------------------
    if (currentStep === 3) {
      if (!formData.foodType) {
        setError(
          "Please select your food preference.",
        );
        return false;
      }

      if (formData.meals.length === 0) {
        setError(
          "Please select at least one meal.",
        );
        return false;
      }
    }

    // --------------------------------
    // STEP 4 - CUSTOMER DETAILS
    // --------------------------------
    if (currentStep === 4) {
      if (!formData.name.trim()) {
        setError("Please enter your name.");
        return false;
      }

      if (!formData.phone.trim()) {
        setError(
          "Please enter your phone number.",
        );
        return false;
      }

      const phone = formData.phone.replace(
        /\D/g,
        "",
      );

      if (phone.length < 10) {
        setError(
          "Please enter a valid phone number.",
        );
        return false;
      }

      if (!formData.email.trim()) {
        setError(
          "Please enter your email address.",
        );
        return false;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        setError(
          "Please enter a valid email address.",
        );
        return false;
      }
    }

    return true;
  };

  /**
   * Go to next step
   */
  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep >= 4) {
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

  /**
   * Go back
   */
  const previousStep = () => {
    setError("");

    if (currentStep <= 1) {
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

  /**
   * Submit booking
   *
   * For now this only simulates submission.
   * Later this will call our backend API.
   */
  const submitBooking = async () => {
    if (!validateStep()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      /*
       * Temporary delay to simulate API request.
       *
       * Later:
       *
       * await fetch("/api/bookings", {
       *   method: "POST",
       *   headers: {
       *     "Content-Type": "application/json",
       *   },
       *   body: JSON.stringify(formData),
       * });
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );

      console.log(
        "Booking submitted:",
        formData,
      );

      setSubmitted(true);
    } catch (submitError) {
      console.error(
        "Booking submission failed:",
        submitError,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Booking submitted successfully
   */
  if (submitted) {
    return (
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-[var(--sage)]/20 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sage-light)] text-[var(--sage-dark)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
              Booking Request Submitted
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
              Thank you for choosing us for your event.
              Our event manager will review your
              requirements and contact you shortly.
            </p>

            <div className="mt-6 rounded-xl bg-[var(--sage-light)] p-4 text-left">
              <p className="text-sm font-medium text-[var(--sage-dark)]">
                Event
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {formData.eventType}
              </p>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">
                    Date
                  </p>

                  <p className="font-medium text-gray-900">
                    {formData.eventDate}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Guests
                  </p>

                  <p className="font-medium text-gray-900">
                    {formData.guests}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Progress */}
      <BookingProgress
        currentStep={currentStep}
      />

      <section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Step Content */}
          {currentStep === 1 && (
            <EventDetailsStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {currentStep === 2 && (
            <PackageStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {currentStep === 3 && (
            <FoodRequirementsStep
              formData={formData}
              updateField={updateField}
              toggleArrayValue={
                toggleArrayValue
              }
            />
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <CustomerDetailsStep
                formData={formData}
                updateField={updateField}
              />

              <BookingSummary
                formData={formData}
              />
            </div>
          )}

          {/* Validation Error */}
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-[var(--rose)]/30 bg-[var(--rose)]/10 px-4 py-3"
            >
              <p className="text-sm font-medium text-[var(--rose)]">
                {error}
              </p>
            </div>
          )}

          {/* Navigation */}
          <BookingNavigation
            currentStep={currentStep}
            totalSteps={4}
            onBack={previousStep}
            onNext={nextStep}
            onSubmit={submitBooking}
            loading={isSubmitting}
          />
        </div>
      </section>
    </>
  );
}