/**
 * Client Document & WhatsApp Message Formatting Utilities
 */
import { formatTime24to12 } from "./time-utils";

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
  id?: string;
  foodItemId?: string | null;
  name: string;
  category?: string;
  dietary?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number | null;
  rate?: number | null;
  totalPrice?: number | null;
  amount?: number | null;
}

export interface DocumentCateringData {
  included: boolean;
  servingType?: string;
  ratePerGuest?: number;
  totalFoodAmount: number;
  guestCount: number;
  notes?: string;
  items?: DocumentCateringItem[];
  subtotal?: number;
  discount?: number;
  gstEnabled?: boolean;
  gstRate?: number;
  gstAmount?: number;
  total?: number;
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
  gstEnabled?: boolean;
  gstRate: number; // e.g. 18
  gstAmount: number;
  total: number;
  currency: string;
  advancePayment?: number;
  paidAmount?: number;
  balanceDue?: number;
  paymentStatus?: string;
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

export function generateWhatsAppMessage(
  doc: ClientDocumentData,
  showItemizedPrices: boolean = false
): string {
  const isInvoice = doc.documentType === "INVOICE";
  const docHeader = isInvoice
    ? ` *TAX INVOICE: ${doc.documentNumber}*`
    : ` *EVENT Proposal & QUOTATION: ${doc.documentNumber}*`;

  const dateFormatted = doc.date ? doc.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const eventDateFormatted = doc.event.date ? doc.event.date.slice(0, 10) : "";

  let message = `${docHeader}\n`;
  message += ` *${doc.company.name}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += ` *Client:* ${doc.client.name}\n`;
  if (doc.client.phone) message += ` *Phone:* ${doc.client.phone}\n`;
  message += ` *Event:* ${doc.event.name} (${doc.event.type})\n`;
  message += ` *Date:* ${eventDateFormatted} ${doc.event.time ? `at ${formatTime24to12(doc.event.time)}` : ""}\n`;
  message += ` *Guests:* ${doc.event.guests} Attendees\n`;
  message += ` *Venue:* ${doc.event.location}\n\n`;

  // Services Scope
  if (doc.services && doc.services.length > 0) {
    message += ` *INCLUDED SERVICES & PRODUCTION:*\n`;
    doc.services.forEach((item) => {
      const qtyStr = item.quantity > 1 ? ` (${item.quantity} ${item.unitLabel || "units"})` : "";
      if (showItemizedPrices) {
        message += `• ${item.name}${qtyStr} — *${formatINR(item.total, doc.currency)}*\n`;
      } else {
        message += `• ${item.name}${qtyStr}\n`;
      }
    });
    message += `\n`;
  }

  // Catering
  if (doc.catering && doc.catering.included) {
    message += ` *CATERING & FOOD MENU:*\n`;
    const rateText = doc.catering.ratePerGuest
      ? `${doc.catering.guestCount} guests × ${formatINR(doc.catering.ratePerGuest, doc.currency)}`
      : `${doc.catering.guestCount} guests (${doc.catering.servingType || "Buffet"})`;

    if (showItemizedPrices) {
      message += `• Catering Package (${rateText}) — *${formatINR(doc.catering.totalFoodAmount, doc.currency)}*\n`;
    } else {
      message += `• Custom Catering Experience (${rateText})\n`;
    }

    if (doc.catering.items && doc.catering.items.length > 0) {
      message += `  _Itemized Food Menu & Quantities:_\n`;
      doc.catering.items.forEach((item, idx) => {
        const unitLabel = item.unit || "Units";
        const qtyStr = `${item.quantity ? item.quantity.toLocaleString("en-IN") : "1"} ${unitLabel}`;
        const priceStr =
          showItemizedPrices && item.totalPrice !== null && item.totalPrice !== undefined
            ? ` — *${formatINR(item.totalPrice, doc.currency)}* (${item.unitPrice ? formatINR(item.unitPrice, doc.currency) + "/" + unitLabel : ""})`
            : "";
        message += `  ${idx + 1}. ${item.name} [${item.category || "Menu"}] (${qtyStr})${priceStr}\n`;
      });
    }
    message += `\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  if (showItemizedPrices) {
    message += ` *Subtotal:* ${formatINR(doc.subtotal, doc.currency)}\n`;
    if (doc.discount > 0) {
      message += ` *Discount:* -${formatINR(doc.discount, doc.currency)}\n`;
    }
    if (doc.gstEnabled !== false && doc.gstAmount > 0) {
      message += ` *GST (${doc.gstRate || 18}%):* +${formatINR(doc.gstAmount, doc.currency)}\n`;
    } else {
      message += ` *GST:* Not Applicable / Excluded (0%)\n`;
    }
    if (doc.additionalCharges > 0) {
      message += ` *Additional Charges:* +${formatINR(doc.additionalCharges, doc.currency)}\n`;
    }
  }

  message += ` *FINAL ESTIMATE AMOUNT: ${formatINR(doc.total, doc.currency)}*\n`;
  message += ` *Status:* ${doc.status.toUpperCase()}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (isInvoice) {
    message += ` *PAYMENT INSTRUCTIONS:*\n`;
    if (doc.company.upiId) message += `• UPI ID: \`${doc.company.upiId}\`\n`;
    if (doc.company.bankDetails) {
      message += `• Bank: ${doc.company.bankDetails.bankName}\n`;
      message += `• A/C: \`${doc.company.bankDetails.accountNumber}\` (IFSC: \`${doc.company.bankDetails.ifsc}\`)\n`;
    }
    message += `\n`;
  } else {
    message += ` *Quote Validity:* 15 Days from ${dateFormatted}\n\n`;
  }

  message += `Thank you for choosing *${doc.company.name}*!\n`;
  message += ` *Contact:* ${doc.company.phone} |  ${doc.company.email}`;

  return message;
}

export function createWhatsAppUrl(phone: string, text: string): string {
  const clean = sanitizePhone(phone);
  const encoded = encodeURIComponent(text);
  return clean
    ? `https://wa.me/${clean}?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}

export function formatCateringItems(
  rawItems: any[] | undefined,
  servingType: string = "Buffet",
  guestCount: number = 0
): DocumentCateringItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return [];
  }

  const isPerGuest = servingType === "PER_GUEST";
  const isPerPlate = servingType === "PER_PLATE";

  return rawItems.map((item: any, idx: number) => {
    const rawRate = item.rate ?? item.unitPrice;
    const hasConfiguredRate =
      rawRate !== undefined &&
      rawRate !== null &&
      rawRate !== "" &&
      !isNaN(Number(rawRate)) &&
      Number(rawRate) > 0;

    const rate = hasConfiguredRate ? Number(rawRate) : null;

    // Quantity resolution
    let quantity = Number(item.quantity || 0);
    if (!quantity || quantity <= 0) {
      if (isPerGuest && guestCount > 0) {
        quantity = guestCount;
      } else {
        quantity = 1;
      }
    } else if (isPerGuest && guestCount > 0 && quantity === 1 && item.amount) {
      if (rate && Math.round(Number(item.amount) / rate) === guestCount) {
        quantity = guestCount;
      }
    }

    // Unit resolution
    let unit = item.unit || item.unitLabel;
    if (!unit) {
      if (isPerGuest) {
        unit = "Guests";
      } else if (isPerPlate) {
        unit = "Plates";
      } else {
        unit = quantity > 1 ? "Units" : "Fixed";
      }
    }

    // Total price / amount resolution
    let amount: number | null = null;
    if (
      item.amount !== undefined &&
      item.amount !== null &&
      item.amount !== "" &&
      !isNaN(Number(item.amount)) &&
      Number(item.amount) > 0
    ) {
      amount = Number(item.amount);
    } else if (rate !== null) {
      amount = rate * quantity;
    }

    return {
      id: item._id || item.foodItemId || String(idx + 1),
      foodItemId: item.foodItemId || null,
      name: item.name || "Menu Item",
      category: item.category || "General",
      dietary: item.dietary || "veg",
      quantity,
      unit,
      rate,
      unitPrice: rate,
      amount,
      totalPrice: amount,
    };
  });
}

export function buildCateringData(
  foodMenu: any,
  guestCount: number,
  eventSubtotal: number = 0,
  eventDiscount: number = 0,
  eventGstEnabled: boolean = true,
  eventGstRate: number = 18
): DocumentCateringData | undefined {
  if (!foodMenu || (!foodMenu.included && (!foodMenu.items || foodMenu.items.length === 0))) {
    return undefined;
  }

  const servingType = foodMenu.servingType || "Buffet";
  const items = formatCateringItems(foodMenu.items, servingType, guestCount);
  const totalFoodAmount = Number(
    foodMenu.totalFoodAmount ??
      items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  );

  // Proportional discount if applicable
  const discountRatio =
    eventSubtotal > 0 && eventDiscount > 0
      ? Math.min(1, eventDiscount / eventSubtotal)
      : 0;
  const cateringDiscount = Math.round(totalFoodAmount * discountRatio);

  const taxableCatering = Math.max(0, totalFoodAmount - cateringDiscount);
  const gstAmount = eventGstEnabled
    ? Math.round(taxableCatering * (eventGstRate / 100))
    : 0;
  const total = taxableCatering + gstAmount;

  return {
    included: true,
    servingType,
    ratePerGuest: foodMenu.ratePerGuest ? Number(foodMenu.ratePerGuest) : undefined,
    totalFoodAmount,
    guestCount,
    notes: foodMenu.notes,
    items,
    subtotal: totalFoodAmount,
    discount: cateringDiscount,
    gstEnabled: eventGstEnabled,
    gstRate: eventGstRate,
    gstAmount,
    total,
  };
}

export function buildDocumentDataFromEvent(event: any): ClientDocumentData {
  const bookingObj =
    typeof event.booking === "object" && event.booking !== null
      ? event.booking
      : null;
  const eventTotal = bookingObj?.total || event.total || 0;
  const eventPaid =
    event.paidAmount ??
    event.advancePayment ??
    bookingObj?.paidAmount ??
    bookingObj?.advancePayment ??
    0;
  const eventBalance = Math.max(0, eventTotal - eventPaid);

  const gstEnabled =
    bookingObj?.gstEnabled !== undefined
      ? bookingObj.gstEnabled
      : (bookingObj?.gstAmount !== undefined ? bookingObj.gstAmount > 0 : false);

  const gstRate = bookingObj?.gstRate || 0;

  return {
    documentType:
      event.status === "Completed" ||
      event.status === "Settled" ||
      event.paymentStatus === "PAID"
        ? "INVOICE"
        : "ESTIMATE",
    documentNumber: `DOC-${String(event._id || "").slice(-6).toUpperCase()}`,
    date: new Date().toISOString().slice(0, 10),
    status:
      event.status === "Completed" ||
      event.status === "Settled" ||
      event.paymentStatus === "PAID"
        ? "PAID"
        : "CONFIRMED",
    company: defaultCompanyDetails,
    client: {
      name:
        typeof event.client === "object" && event.client?.name
          ? event.client.name
          : "Valued Client",
      phone: typeof event.client === "object" ? event.client?.phone || "" : "",
      email: typeof event.client === "object" ? event.client?.email || "" : "",
      address:
        typeof event.client === "object" ? event.client?.address : undefined,
    },
    event: {
      name: event.eventName || "Event",
      type: event.eventType || "Event",
      date: event.eventDate || new Date().toISOString(),
      time: formatTime24to12(event.eventTime) || event.eventTime || "",
      guests: event.guests || 0,
      location: event.location || "",
      description: event.description || event.notes || "",
    },
    services:
      bookingObj &&
      Array.isArray(bookingObj.services) &&
      bookingObj.services.length > 0
        ? bookingObj.services.map((s: any, idx: number) => ({
            id: s._id || String(idx),
            name: s.serviceName,
            category: s.category,
            quantity: s.quantity,
            unitLabel: s.unitLabel,
            unitPrice: s.unitPrice,
            total: s.total,
          }))
        : [
            {
              id: "1",
              name: `${event.eventType || "Event"} Management Package`,
              category: "Production",
              quantity: 1,
              unitLabel: "Package",
              unitPrice: bookingObj?.subtotal || eventTotal,
              total: bookingObj?.subtotal || eventTotal,
            },
          ],
    catering: buildCateringData(
      bookingObj?.foodMenu || event.foodMenu,
      Number(event.guests || bookingObj?.guests || 0),
      Number(bookingObj?.subtotal || eventTotal),
      Number(bookingObj?.discountAmount || 0),
      gstEnabled,
      gstRate
    ),
    subtotal: bookingObj?.subtotal || eventTotal,
    discount: bookingObj?.discountAmount || 0,
    additionalCharges: bookingObj?.additionalCharges || 0,
    gstEnabled,
    gstRate,
    gstAmount: bookingObj?.gstAmount || 0,
    total: eventTotal,
    currency: bookingObj?.currency || "INR",
    paidAmount: eventPaid,
    balanceDue: eventBalance,
  };
}

export function buildDocumentDataFromEstimate(estimate: any): ClientDocumentData {
  const estTotal = Number(estimate.total || 0);

  const gstEnabled =
    estimate.gstEnabled !== undefined
      ? estimate.gstEnabled
      : (estimate.gstAmount !== undefined ? Number(estimate.gstAmount) > 0 : true);

  const gstRate = Number(estimate.gstRate || 0);

  return {
    documentType: "ESTIMATE",
    documentNumber:
      estimate.estimateNumber ||
      `EST-${String(estimate._id || "").slice(-6).toUpperCase()}`,
    date: estimate.createdAt
      ? new Date(estimate.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    status: estimate.status || "DRAFT",
    company: defaultCompanyDetails,
    client: {
      name: estimate.client?.name || "Valued Client",
      phone: estimate.client?.phone || "",
      email: estimate.client?.email || "",
      address: estimate.client?.address,
    },
    event: {
      name: estimate.eventName || "Event",
      type: estimate.eventType || "Event",
      date: estimate.eventDate || new Date().toISOString(),
      time: formatTime24to12(estimate.eventTime) || estimate.eventTime || "",
      guests: Number(estimate.guests || 0),
      location: estimate.location || "",
      description: estimate.description || "",
    },
    services:
      Array.isArray(estimate.items) && estimate.items.length > 0
        ? estimate.items.map((item: any, idx: number) => ({
            id: item._id || item.serviceId || String(idx),
            name: item.serviceName || item.name || "Service",
            category: item.category,
            quantity: item.quantity || 1,
            unitLabel: item.unitLabel,
            unitPrice: Number(item.unitPrice || 0),
            total: Number(item.total || 0),
          }))
        : [],
    catering: buildCateringData(
      estimate.foodMenu,
      Number(estimate.guests || 0),
      Number(estimate.subtotal || estTotal),
      Number(estimate.discount || estimate.discountAmount || 0),
      gstEnabled,
      gstRate
    ),
    subtotal: Number(estimate.subtotal || estTotal),
    discount: Number(estimate.discount || estimate.discountAmount || 0),
    additionalCharges: Number(estimate.additionalCharges || 0),
    gstEnabled,
    gstRate,
    gstAmount: Number(estimate.gstAmount || 0),
    total: estTotal,
    currency: estimate.currency || "INR",
    paidAmount: 0,
    balanceDue: estTotal,
  };
}

