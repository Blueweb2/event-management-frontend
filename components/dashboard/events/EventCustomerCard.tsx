import {
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

import Card from "@/components/ui/Card";

interface EventCustomerCardProps {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export default function EventCustomerCard({
  name,
  phone,
  email,
  message,
}: EventCustomerCardProps) {
  return (
    <Card
      title="Customer Details"
      description="Contact information and additional notes."
      className="border-[#e8e1d8] shadow-sm"
    >
      <div className="space-y-5">
        {/* Customer */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <User size={19} />
          </div>

          <div>
            <p className="text-xs text-[#9b938a]">
              Customer
            </p>

            <p className="mt-1 text-sm font-semibold text-[#29241f]">
              {name}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <Phone size={19} />
          </div>

          <div>
            <p className="text-xs text-[#9b938a]">
              Phone Number
            </p>

            <a
              href={`tel:${phone}`}
              className="mt-1 block text-sm font-semibold text-[#29241f] transition hover:text-[#9a6c37]"
            >
              {phone}
            </a>
          </div>
        </div>

        {/* Email */}
        {email && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
              <Mail size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-[#9b938a]">
                Email Address
              </p>

              <a
                href={`mailto:${email}`}
                className="mt-1 block truncate text-sm font-semibold text-[#29241f] transition hover:text-[#9a6c37]"
              >
                {email}
              </a>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="border-t border-[#eee8e1] pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
                <MessageSquare size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-[#9b938a]">
                  Additional Message
                </p>

                <p className="mt-2 text-sm leading-6 text-[#5f574f]">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}