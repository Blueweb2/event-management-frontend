"use client";

import React, { useState } from "react";
import { Printer, Share2, Mail, MessageSquare, Sparkles } from "lucide-react";
import ClientDocumentModal from "@/components/manager/documents/ClientDocumentModal";
import {
  ClientDocumentData,
  defaultCompanyDetails,
  createWhatsAppUrl,
  generateWhatsAppMessage,
} from "@/lib/document-formatter";

interface EstimateExportActionsProps {
  estimateNumber: string;
  eventName: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  eventDate: string;
  total: number;
  currency?: string;
  documentData?: ClientDocumentData;
  onPrint?: () => void;
}

export default function EstimateExportActions({
  estimateNumber,
  eventName,
  clientName,
  clientPhone,
  clientEmail,
  eventDate,
  total,
  currency = "INR",
  documentData,
  onPrint,
}: EstimateExportActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(total);

  // Synthesize Document Data if not provided
  const fallbackDocData: ClientDocumentData = documentData || {
    documentType: "ESTIMATE",
    documentNumber: estimateNumber,
    date: new Date().toISOString().slice(0, 10),
    status: "PROPOSED",
    company: defaultCompanyDetails,
    client: {
      name: clientName,
      phone: clientPhone || "",
      email: clientEmail || "",
    },
    event: {
      name: eventName,
      type: "Celebration",
      date: eventDate,
      guests: 100,
      location: "Client Designated Venue",
    },
    services: [
      {
        id: "1",
        name: "Full Event Management & Production",
        quantity: 1,
        unitPrice: total,
        total: total,
      },
    ],
    subtotal: total,
    discount: 0,
    additionalCharges: 0,
    gstRate: 18,
    gstAmount: 0,
    total: total,
    currency: currency,
  };

  const richWhatsAppMessage = generateWhatsAppMessage(fallbackDocData);
  const whatsappUrl = createWhatsAppUrl(
    clientPhone || "",
    richWhatsAppMessage
  );

  const emailSubject = encodeURIComponent(`Estimate / Invoice #${estimateNumber} for ${eventName}`);
  const emailBody = encodeURIComponent(
    `Dear ${clientName},\n\nPlease find the quotation & details for your upcoming event "${eventName}":\n\n` +
      `Reference: ${estimateNumber}\n` +
      `Event Date: ${eventDate.slice(0, 10)}\n` +
      `Total: ${formattedTotal}\n\n` +
      `Best regards,\n${defaultCompanyDetails.name}`
  );
  const mailtoUrl = `mailto:${clientEmail || ""}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Export Studio Modal Trigger */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#29241F] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black transition active:scale-[0.98]"
        >
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Export Studio (PDF / Invoice)</span>
        </button>

        {/* WhatsApp Share Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98]"
        >
          <MessageSquare size={14} />
          <span>WhatsApp</span>
        </a>

        {/* Print / Save as PDF Button */}
        <button
          type="button"
          onClick={() => {
            if (onPrint) onPrint();
            else setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition active:scale-[0.98]"
        >
          <Printer size={14} className="text-gray-600" />
          <span>Print</span>
        </button>

        {/* Email Share */}
        <a
          href={mailtoUrl}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition active:scale-[0.98]"
        >
          <Mail size={14} className="text-gray-600" />
          <span>Email</span>
        </a>
      </div>

      {modalOpen && (
        <ClientDocumentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          documentData={fallbackDocData}
        />
      )}
    </>
  );
}
