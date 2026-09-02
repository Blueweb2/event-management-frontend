import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import type { BookingFormData } from "../types";

interface CustomerDetailsStepProps {
  formData: BookingFormData;
  updateField: (
    field: keyof BookingFormData,
    value: string,
  ) => void;
}

export default function CustomerDetailsStep({
  formData,
  updateField,
}: CustomerDetailsStepProps) {
  return (
    <Card
      title="Your Details"
      description="We'll use these details to contact you about your event."
      className="border-[#e8e1d8] shadow-sm"
    >
      <div className="space-y-6">
        <Input
          id="name"
          label="Full Name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(event) =>
            updateField(
              "name",
              event.target.value,
            )
          }
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChange={(event) =>
              updateField(
                "phone",
                event.target.value,
              )
            }
            required
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value,
              )
            }
          />
        </div>

        <Input
          id="message"
          label="Additional Message"
          placeholder="Anything else you'd like our team to know?"
          value={formData.message}
          onChange={(event) =>
            updateField(
              "message",
              event.target.value,
            )
          }
        />
      </div>
    </Card>
  );
}