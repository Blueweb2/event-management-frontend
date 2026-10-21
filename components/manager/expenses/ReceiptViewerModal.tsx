"use client";

import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Receipt,
  FileQuestion,
} from "lucide-react";
import type { Expense } from "./constants";
import { fetchExpenseReceiptBlob } from "@/lib/expense.api";

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export default function ReceiptViewerModal({
  isOpen,
  onClose,
  expense,
}: ReceiptViewerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !expense) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobUrl(null);
      setError(null);
      setMimeType("");
      setFileName("");
      return;
    }

    if (!expense.hasReceipt && !expense.receiptPath) {
      setError("No receipt attached to this expense record.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchExpenseReceiptBlob(expense.id)
      .then((res) => {
        if (!isMounted) return;
        setBlobUrl(res.blobUrl);
        setMimeType(res.mimeType);
        setFileName(res.filename || expense.receiptOriginalName || "receipt");
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load receipt file.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, expense]);

  if (!isOpen || !expense) return null;

  const isPdf =
    mimeType.includes("pdf") ||
    fileName.toLowerCase().endsWith(".pdf") ||
    expense.receiptMimeType?.includes("pdf") ||
    expense.receiptOriginalName?.toLowerCase().endsWith(".pdf");

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(expense.amount);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className="flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl border border-[#e8e1d8] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee8e1] bg-[#fdfbf8] px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7efe4] text-[#a7773f]">
              <Receipt size={20} />
            </div>
            <div className="min-w-0">
              <h3
                id="receipt-modal-title"
                className="text-base font-bold text-[#29241f] truncate"
              >
                {expense.title}
              </h3>
              <p className="text-xs text-[#756d64] truncate">
                {expense.category} • {formattedAmount} • {expense.date}
                {expense.vendorName ? ` • Vendor: ${expense.vendorName}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {blobUrl && (
              <a
                href={blobUrl}
                download={fileName || "expense-receipt"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#ded5cb] bg-white px-3 text-xs font-semibold text-[#403a34] transition hover:bg-[#f7f2ec]"
                title="Download receipt"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close receipt modal"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#756d64] hover:bg-[#f2ece4] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 overflow-auto bg-[#faf8f5] p-4 sm:p-6 min-h-[320px] max-h-[70vh] flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Loader2 size={32} className="animate-spin text-[#b8894b]" />
              <p className="text-sm font-medium text-[#756d64]">
                Loading receipt document...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-14 text-center max-w-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                <FileQuestion size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#29241f]">
                Receipt Unavailable
              </h4>
              <p className="text-xs text-[#756d64] leading-relaxed">{error}</p>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {isPdf ? (
                <div className="w-full h-[60vh] flex flex-col rounded-2xl overflow-hidden border border-[#e8e1d8] bg-white">
                  <iframe
                    src={blobUrl}
                    title="PDF Receipt Viewer"
                    className="w-full h-full border-0"
                  />
                  <div className="flex items-center justify-between border-t border-[#eee8e1] bg-white px-4 py-2 text-xs text-[#756d64]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FileText size={14} className="text-[#a7773f]" />
                      {fileName}
                    </span>
                    <a
                      href={blobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#a7773f] hover:underline"
                    >
                      Open in new tab <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center max-h-[62vh]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blobUrl}
                    alt={expense.title || "Receipt attachment"}
                    className="max-h-[56vh] max-w-full rounded-2xl object-contain shadow-md border border-[#eee8e1]"
                  />
                  <p className="mt-2 text-xs text-[#756d64] font-medium">
                    {fileName}
                    {expense.receiptSize
                      ? ` (${Math.round(expense.receiptSize / 1024)} KB)`
                      : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-[#eee8e1] bg-white px-5 py-3 text-xs text-[#756d64] gap-2">
          <div>
            <span>Recorded by: </span>
            <strong className="text-[#29241f]">
              {expense.createdByName || "Staff/Manager"}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            <span>Ref: #{expense.id}</span>
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-lg bg-[#29241f] px-4 text-xs font-semibold text-white hover:bg-black transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
