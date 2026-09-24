/**
 * Client Document & WhatsApp Message Formatting Utilities
 */

export interface DocumentLineItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unitLabel?: string;
  unitPrice: number;
  total: number;
}

export interface DocumentCateringItem {
  name: string;
  category?: string;
  dietary?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
}

export interface DocumentCateringData {
  included: boolean;
  servingType?: string;
  ratePerGuest?: number;
  totalFoodAmount: number;
  guestCount: number;
  notes?: string;
  items?: DocumentCateringItem[];
}

export interface ClientDocumentData {
  documentType: "ESTIMATE" | "INVOICE";
  documentNumber: string;
  date: string;
  dueDate?: string;
  status: string;

  // Company Details
  company: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
    gstin?: string;
    upiId?: string;
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      ifsc: string;
    };
  };

  // Client Details
  client: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };

  // Event Details
  event: {
    name: string;
    type: string;
    date: string;
    time?: string;
    guests: number;
    location: string;
    description?: string;
  };

  // Financials & Items
  services: DocumentLineItem[];
  catering?: DocumentCateringData;

  subtotal: number;
  discount: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  additionalCharges: number;
  gstRate: number; // e.g. 18
  gstAmount: number;
  total: number;
  currency: string;
  notes?: string;
}

export const defaultCompanyDetails = {
  name: "Eventeo Events & Celebrations",
  tagline: "Luxury Event Planning, Bespoke Production & Catering",
  phone: "+91 98765 43210",
  email: "events@eventeo.luxury",
  address: "Grand Central Plaza, 4th Floor, Bangalore, Karnataka 560001",
  gstin: "29AABCU9603R1ZM",
  upiId: "eventeoevents@okhdfcbank",
  bankDetails: {
    accountName: "Eventeo Luxury Events Pvt Ltd",
    accountNumber: "50200098765432",
    bankName: "HDFC Bank",
    ifsc: "HDFC0001234",
  },
};

export function formatINR(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function sanitizePhone(phone?: string): string {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.length === 10) {
    clean = "91" + clean;
  }
  return clean;
}

export function generateWhatsAppMessage(doc: ClientDocumentData): string {
  const isInvoice = doc.documentType === "INVOICE";
  const docHeader = isInvoice
    ? `✨ *TAX INVOICE: ${doc.documentNumber}*`
    : `🎉 *EVENT ESTIMATE & QUOTATION: ${doc.documentNumber}*`;

  const dateFormatted = doc.date ? doc.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const eventDateFormatted = doc.event.date ? doc.event.date.slice(0, 10) : "";

  let message = `${docHeader}\n`;
  message += `🏢 *${doc.company.name}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `👤 *Client:* ${doc.client.name}\n`;
  if (doc.client.phone) message += `📞 *Phone:* ${doc.client.phone}\n`;
  message += `🎪 *Event:* ${doc.event.name} (${doc.event.type})\n`;
  message += `📅 *Date:* ${eventDateFormatted} ${doc.event.time ? `at ${doc.event.time}` : ""}\n`;
  message += `👥 *Guests:* ${doc.event.guests} Attendees\n`;
  message += `📍 *Venue:* ${doc.event.location}\n\n`;

  // Services
  if (doc.services && doc.services.length > 0) {
    message += `📋 *SERVICES & PRODUCTION:*\n`;
    doc.services.forEach((item) => {
      const qtyStr = item.quantity > 1 ? ` (${item.quantity} ${item.unitLabel || "units"})` : "";
      message += `• ${item.name}${qtyStr} — *${formatINR(item.total, doc.currency)}*\n`;
    });
    message += `\n`;
  }

  // Catering
  if (doc.catering && doc.catering.included) {
    message += `🍽️ *CATERING & FOOD MENU:*\n`;
    const rateText = doc.catering.ratePerGuest
      ? `${doc.catering.guestCount} guests × ${formatINR(doc.catering.ratePerGuest, doc.currency)}`
      : `${doc.catering.guestCount} guests`;
    message += `• Custom Catering Package (${rateText}) — *${formatINR(doc.catering.totalFoodAmount, doc.currency)}*\n`;

    if (doc.catering.items && doc.catering.items.length > 0) {
      const itemNames = doc.catering.items.map((i) => i.name).slice(0, 6).join(", ");
      const extra = doc.catering.items.length > 6 ? ` +${doc.catering.items.length - 6} more` : "";
      message += `  _Items:_ ${itemNames}${extra}\n`;
    }
    message += `\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Subtotal:* ${formatINR(doc.subtotal, doc.currency)}\n`;

  if (doc.discount > 0) {
    message += `🎁 *Discount:* -${formatINR(doc.discount, doc.currency)}\n`;
  }

  if (doc.gstAmount > 0) {
    message += `🏛️ *GST (${doc.gstRate || 18}%):* +${formatINR(doc.gstAmount, doc.currency)}\n`;
  }

  if (doc.additionalCharges > 0) {
    message += `➕ *Additional Charges:* +${formatINR(doc.additionalCharges, doc.currency)}\n`;
  }

  message += `⭐ *TOTAL AMOUNT: ${formatINR(doc.total, doc.currency)}*\n`;
  message += `📌 *Status:* ${doc.status.toUpperCase()}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (isInvoice) {
    message += `💳 *PAYMENT INSTRUCTIONS:*\n`;
    if (doc.company.upiId) message += `• UPI ID: \`${doc.company.upiId}\`\n`;
    if (doc.company.bankDetails) {
      message += `• Bank: ${doc.company.bankDetails.bankName}\n`;
      message += `• A/C: \`${doc.company.bankDetails.accountNumber}\` (IFSC: \`${doc.company.bankDetails.ifsc}\`)\n`;
    }
    message += `\n`;
  } else {
    message += `⏳ *Quote Validity:* 15 Days from ${dateFormatted}\n\n`;
  }

  message += `Thank you for choosing *${doc.company.name}*!\n`;
  message += `📞 *Contact:* ${doc.company.phone} | ✉️ ${doc.company.email}`;

  return message;
}

export function createWhatsAppUrl(phone: string, text: string): string {
  const clean = sanitizePhone(phone);
  const encoded = encodeURIComponent(text);
  return clean
    ? `https://wa.me/${clean}?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}
