"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Share2,
  Check,
  Copy,
  FileText,
  MessageSquare,
  Sparkles,
  Building2,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Send,
  ExternalLink,
} from "lucide-react";

import {
  ClientDocumentData,
  formatINR,
  generateWhatsAppMessage,
  createWhatsAppUrl,
  defaultCompanyDetails,
} from "@/lib/document-formatter";

interface ClientDocumentModalProps {
  open: boolean;
  onClose: () => void;
  documentData: ClientDocumentData;
}

export default function ClientDocumentModal({
  open,
  onClose,
  documentData,
}: ClientDocumentModalProps) {
  const [docType, setDocType] = useState<"ESTIMATE" | "INVOICE">(
    documentData.documentType || "INVOICE"
  );
  const [activeTab, setActiveTab] = useState<"preview" | "whatsapp">("preview");
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState("");

  if (!open) return null;

  // Active document data reflecting current mode (ESTIMATE vs INVOICE)
  const isInvoice = docType === "INVOICE";
  const docNumber = isInvoice
    ? documentData.documentNumber.startsWith("INV")
      ? documentData.documentNumber
      : `INV-${documentData.documentNumber.replace(/^(EST-|EST)/, "")}`
    : documentData.documentNumber.startsWith("EST")
    ? documentData.documentNumber
    : `EST-${documentData.documentNumber.replace(/^(INV-|INV)/, "")}`;

  const currentDoc: ClientDocumentData = {
    ...documentData,
    documentType: docType,
    documentNumber: docNumber,
    notes: customNote || documentData.notes,
  };

  const whatsappMessage = generateWhatsAppMessage(currentDoc);

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handlePrint = () => {
    if (activeTab !== "preview") {
      setActiveTab("preview");
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  const whatsappUrl = createWhatsAppUrl(
    currentDoc.client.phone,
    whatsappMessage
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      {/* Print-specific style block to cleanly print ONLY the document container */}
      <style jsx global>{`
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-client-document,
          #printable-client-document * {
            visibility: visible !important;
          }
          .fixed,
          .overflow-hidden,
          .overflow-y-auto,
          [class*="max-h-"],
          [class*="backdrop-blur"] {
            position: static !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            width: 100% !important;
            box-shadow: none !important;
            background: transparent !important;
            border: none !important;
            transform: none !important;
          }
          #printable-client-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #29241f !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-[#FAF8F5] border border-[#E8E1D8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ==========================================
            Modal Control Header (Screen Only)
        ========================================== */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E1D8] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A6C37]">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#29241F]">
                  Client Export Studio
                </h2>
                <span className="rounded-full bg-[#B8894B]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#9A6C37] uppercase tracking-wider">
                  {docType}
                </span>
              </div>
              <p className="text-xs text-[#756D64]">
                Ref: {docNumber} · {currentDoc.client.name}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2">
            {/* Document Mode Toggle */}
            <div className="inline-flex rounded-xl bg-[#F0ECE4] p-1 text-xs font-semibold text-[#756D64]">
              <button
                type="button"
                onClick={() => setDocType("ESTIMATE")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  docType === "ESTIMATE"
                    ? "bg-white text-[#29241F] shadow-sm"
                    : "hover:text-[#29241F]"
                }`}
              >
                Quotation / Estimate
              </button>
              <button
                type="button"
                onClick={() => setDocType("INVOICE")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  docType === "INVOICE"
                    ? "bg-white text-[#29241F] shadow-sm"
                    : "hover:text-[#29241F]"
                }`}
              >
                Tax Invoice
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#756D64] hover:bg-[#F0ECE4] transition"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ==========================================
            Tab Navigation Bar (Screen Only)
        ========================================== */}
        <div className="no-print flex items-center justify-between border-b border-[#E8E1D8] bg-[#F7F4EE] px-6 py-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "preview"
                  ? "bg-white text-[#29241F] shadow-sm"
                  : "text-[#756D64] hover:text-[#29241F]"
              }`}
            >
              <Printer size={15} />
              Print & PDF Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("whatsapp")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <MessageSquare size={15} />
              WhatsApp Dispatcher
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "preview" ? (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241F] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black transition active:scale-95"
              >
                <Printer size={14} />
                <span>Save as PDF / Print</span>
              </button>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
              >
                <Send size={14} />
                <span>Open in WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* ==========================================
            Scrollable Content Area
        ========================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "preview" ? (
            /* ==========================================
                Live Branded Printable Document Container
            ========================================== */
            <div
              id="printable-client-document"
              className="mx-auto max-w-3xl rounded-2xl bg-white p-8 sm:p-10 border border-[#E8E1D8] shadow-sm text-[#29241F]"
            >
              {/* Document Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#E8E1D8] pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h1 className="text-xl font-black tracking-tight text-[#29241F]">
                      {currentDoc.company.name}
                    </h1>
                  </div>
                  <p className="mt-1 text-xs text-[#756D64]">
                    {currentDoc.company.tagline}
                  </p>
                  <p className="mt-2 text-xs text-[#756D64] max-w-sm leading-relaxed">
                    {currentDoc.company.address}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#756D64]">
                    <span>📞 {currentDoc.company.phone}</span>
                    <span>✉️ {currentDoc.company.email}</span>
                  </div>
                  {currentDoc.company.gstin && (
                    <p className="mt-1 text-[11px] font-mono text-[#9A6C37]">
                      GSTIN: {currentDoc.company.gstin}
                    </p>
                  )}
                </div>

                <div className="sm:text-right">
                  <div className="inline-block rounded-xl bg-[#FAF8F5] border border-[#E8E1D8] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A6C37]">
                      {isInvoice ? "TAX INVOICE" : "ESTIMATE / QUOTE"}
                    </p>
                    <p className="mt-1 text-base font-black font-mono text-[#29241F]">
                      {docNumber}
                    </p>
                    <div className="mt-2 text-xs text-[#756D64] space-y-0.5">
                      <p>Date: {currentDoc.date ? currentDoc.date.slice(0, 10) : new Date().toISOString().slice(0, 10)}</p>
                      {isInvoice ? (
                        <p>Due: On Receipt</p>
                      ) : (
                        <p>Valid Until: 15 Days</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client & Event Meta Row */}
              <div className="grid sm:grid-cols-2 gap-6 border-b border-[#E8E1D8] py-6">
                {/* Billed To */}
                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#E8E1D8]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A6C37]">
                    Billed To
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#29241F]">
                    {currentDoc.client.name}
                  </p>
                  <p className="mt-1 text-xs text-[#756D64]">
                    📞 {currentDoc.client.phone || "N/A"}
                  </p>
                  <p className="text-xs text-[#756D64]">
                    ✉️ {currentDoc.client.email || "N/A"}
                  </p>
                  {currentDoc.client.address && (
                    <p className="mt-1 text-xs text-[#756D64]">
                      📍 {currentDoc.client.address}
                    </p>
                  )}
                </div>

                {/* Event Scope */}
                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#E8E1D8]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A6C37]">
                    Event Details
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#29241F]">
                    {currentDoc.event.name}
                  </p>
                  <p className="mt-1 text-xs text-[#756D64]">
                    📅 {currentDoc.event.date ? currentDoc.event.date.slice(0, 10) : "TBD"}{" "}
                    {currentDoc.event.time ? `· ${currentDoc.event.time}` : ""}
                  </p>
                  <p className="text-xs text-[#756D64]">
                    👥 {currentDoc.event.guests} Guests · {currentDoc.event.type}
                  </p>
                  <p className="mt-1 text-xs text-[#756D64] truncate">
                    📍 {currentDoc.event.location}
                  </p>
                </div>
              </div>

              {/* Itemized Services Table */}
              <div className="py-6 border-b border-[#E8E1D8]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A6C37] mb-3">
                  Production & Event Services
                </h3>
                {currentDoc.services && currentDoc.services.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8E1D8] text-[11px] font-bold uppercase tracking-wider text-[#756D64]">
                        <th className="pb-2.5">Service Description</th>
                        <th className="pb-2.5 text-center">Category</th>
                        <th className="pb-2.5 text-center">Qty / Units</th>
                        <th className="pb-2.5 text-right">Rate</th>
                        <th className="pb-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E1D8]/60 text-xs">
                      {currentDoc.services.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-3 pr-2">
                            <p className="font-bold text-[#29241F]">{item.name}</p>
                          </td>
                          <td className="py-3 text-center capitalize text-[#756D64]">
                            {item.category || "Service"}
                          </td>
                          <td className="py-3 text-center font-medium text-[#29241F]">
                            {item.quantity} {item.unitLabel || ""}
                          </td>
                          <td className="py-3 text-right text-[#756D64]">
                            {formatINR(item.unitPrice, currentDoc.currency)}
                          </td>
                          <td className="py-3 text-right font-bold text-[#29241F]">
                            {formatINR(item.total, currentDoc.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-gray-400 italic">No additional services listed.</p>
                )}
              </div>

              {/* Catering Package Details (If included) */}
              {currentDoc.catering && currentDoc.catering.included && (
                <div className="py-6 border-b border-[#E8E1D8]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A6C37]">
                      Catering & Culinary Experience
                    </h3>
                    <span className="text-xs font-bold text-[#29241F]">
                      {formatINR(currentDoc.catering.totalFoodAmount, currentDoc.currency)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#E8E1D8] text-xs space-y-2">
                    <div className="flex justify-between font-semibold text-[#29241F]">
                      <span>
                        Package ({currentDoc.catering.guestCount} Guests · {currentDoc.catering.servingType || "Buffet"})
                      </span>
                      {currentDoc.catering.ratePerGuest ? (
                        <span>{formatINR(currentDoc.catering.ratePerGuest, currentDoc.currency)} / guest</span>
                      ) : null}
                    </div>

                    {currentDoc.catering.items && currentDoc.catering.items.length > 0 && (
                      <div className="pt-2 border-t border-[#E8E1D8]/60">
                        <p className="text-[11px] font-bold text-[#756D64] uppercase tracking-wider mb-1.5">
                          Selected Food & Beverage Menu:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {currentDoc.catering.items.map((food, fIdx) => (
                            <span
                              key={fIdx}
                              className="rounded-lg bg-white border border-[#E8E1D8] px-2 py-1 text-[11px] text-[#29241F]"
                            >
                              {food.dietary === "non-veg" ? "🍗" : "🥗"} {food.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Calculation Summary */}
              <div className="py-6 flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#E8E1D8]">
                {/* Payment Instructions / Notes */}
                <div className="max-w-sm text-xs text-[#756D64] space-y-2">
                  <p className="font-bold uppercase tracking-wider text-[#9A6C37]">
                    Payment Instructions
                  </p>
                  {currentDoc.company.upiId && (
                    <p className="font-mono text-[#29241F]">
                      UPI: <span className="font-bold">{currentDoc.company.upiId}</span>
                    </p>
                  )}
                  {currentDoc.company.bankDetails && (
                    <div className="font-mono text-[11px] text-[#756D64] space-y-0.5">
                      <p>Bank: {currentDoc.company.bankDetails.bankName}</p>
                      <p>Account: {currentDoc.company.bankDetails.accountNumber}</p>
                      <p>IFSC: {currentDoc.company.bankDetails.ifsc}</p>
                    </div>
                  )}
                  <p className="text-[11px] pt-1 leading-relaxed italic text-gray-500">
                    {isInvoice
                      ? "Payment is due immediately upon event completion or advance receipt schedule."
                      : "Quotation rates are valid for 15 days from issue date. Subject to date availability."}
                  </p>
                </div>

                {/* Totals Breakdown */}
                <div className="w-full sm:w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-[#756D64]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#29241F]">
                      {formatINR(currentDoc.subtotal, currentDoc.currency)}
                    </span>
                  </div>

                  {currentDoc.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount</span>
                      <span>-{formatINR(currentDoc.discount, currentDoc.currency)}</span>
                    </div>
                  )}

                  {currentDoc.gstAmount > 0 && (
                    <div className="flex justify-between text-[#756D64]">
                      <span>GST ({currentDoc.gstRate || 18}%)</span>
                      <span className="font-medium text-[#29241F]">
                        +{formatINR(currentDoc.gstAmount, currentDoc.currency)}
                      </span>
                    </div>
                  )}

                  {currentDoc.additionalCharges > 0 && (
                    <div className="flex justify-between text-[#756D64]">
                      <span>Additional Charges</span>
                      <span className="font-medium text-[#29241F]">
                        +{formatINR(currentDoc.additionalCharges, currentDoc.currency)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t-2 border-[#29241F] flex justify-between items-baseline">
                    <span className="text-sm font-black uppercase tracking-wider text-[#29241F]">
                      Grand Total
                    </span>
                    <span className="text-lg font-black text-[#29241F]">
                      {formatINR(currentDoc.total, currentDoc.currency)}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[11px]">
                    <span className="text-[#756D64]">Payment Status:</span>
                    <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider text-[10px]">
                      {currentDoc.status || (isInvoice ? "PAID" : "PROPOSED")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Signoff Footer */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#756D64]">
                <p>Authorized Signature · {currentDoc.company.name}</p>
                <p className="text-[11px] text-gray-400">
                  Generated automatically by EventOps Management System
                </p>
              </div>
            </div>
          ) : (
            /* ==========================================
                WhatsApp Message Generator & Dispatcher Tab
            ========================================== */
            <div className="mx-auto max-w-2xl space-y-5">
              {/* Quick Action Banner */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-900">
                        1-Click WhatsApp Client Share
                      </h3>
                      <p className="text-xs text-emerald-700">
                        Sending directly to: <span className="font-bold">{currentDoc.client.name}</span> ({currentDoc.client.phone || "No phone recorded"})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-sm hover:bg-emerald-50 transition active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
                    >
                      <ExternalLink size={14} />
                      <span>Send Now</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Message Live Preview Card */}
              <div className="rounded-2xl border border-[#E8E1D8] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E8E1D8] pb-3 mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#9A6C37]">
                    WhatsApp Message Preview
                  </p>
                  <span className="text-[11px] text-[#756D64]">
                    Markdown formatted · Ready to paste
                  </span>
                </div>

                <div className="rounded-xl bg-[#FAF8F5] p-4 font-mono text-xs text-[#29241F] whitespace-pre-wrap leading-relaxed border border-[#E8E1D8]">
                  {whatsappMessage}
                </div>
              </div>

              {/* Custom Additions / Instructions */}
              <div className="rounded-2xl border border-[#E8E1D8] bg-white p-4">
                <label className="block text-xs font-bold text-[#29241F] mb-1.5">
                  Append Note to Client (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Please review the attached quote and let us know your confirmation by Friday."
                  className="h-10 w-full rounded-xl border border-[#E8E1D8] bg-[#FAF8F5] px-3 text-xs outline-none focus:border-[#B8894B]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
