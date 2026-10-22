import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCateringItems,
  buildCateringData,
  buildDocumentDataFromEvent,
  buildDocumentDataFromEstimate,
  generateWhatsAppMessage,
} from "./document-formatter.ts";

test("1. Itemized menu with 1000 guests and per-guest items (Kesar Pista Thandai example)", () => {
  const rawItems = [
    {
      name: "Kesar Pista Thandai",
      category: "Beverages",
      dietary: "veg",
      rate: 45,
      quantity: 1000,
      amount: 45000,
    },
    {
      name: "Paneer Tikka Shashlik",
      category: "Starters / Appetizers",
      dietary: "veg",
      rate: 80,
      quantity: 1000,
      amount: 80000,
    },
  ];

  const formatted = formatCateringItems(rawItems, "PER_GUEST", 1000);
  assert.equal(formatted.length, 2);

  const thandai = formatted[0];
  assert.equal(thandai.name, "Kesar Pista Thandai");
  assert.equal(thandai.category, "Beverages");
  assert.equal(thandai.quantity, 1000);
  assert.equal(thandai.unit, "Guests");
  assert.equal(thandai.unitPrice, 45);
  assert.equal(thandai.totalPrice, 45000);
});

test("2. Mixed per-guest and fixed-price catering items", () => {
  const rawItems = [
    {
      name: "Welcome Mocktail",
      category: "Beverages",
      rate: 50,
      quantity: 500,
      amount: 25000,
    },
    {
      name: "Chef Ice Sculpture Station",
      category: "Live Counters",
      rate: 15000,
      quantity: 1,
      unit: "Fixed",
      amount: 15000,
    },
  ];

  const formatted = formatCateringItems(rawItems, "PER_GUEST", 500);
  assert.equal(formatted[0].quantity, 500);
  assert.equal(formatted[0].unit, "Guests");
  assert.equal(formatted[0].unitPrice, 50);
  assert.equal(formatted[0].totalPrice, 25000);

  assert.equal(formatted[1].quantity, 1);
  assert.equal(formatted[1].unit, "Fixed");
  assert.equal(formatted[1].unitPrice, 15000);
  assert.equal(formatted[1].totalPrice, 15000);
});

test("3. Items with missing individual prices display null (rendered as —) without fabricating breakdown", () => {
  const rawItems = [
    {
      name: "Deluxe Assorted Sweets",
      category: "Desserts & Sweets",
      dietary: "veg",
      rate: 0,
      quantity: 200,
      amount: 0,
    },
  ];

  const formatted = formatCateringItems(rawItems, "PER_GUEST", 200);
  assert.equal(formatted.length, 1);
  assert.equal(formatted[0].name, "Deluxe Assorted Sweets");
  assert.equal(formatted[0].unitPrice, null, "Missing price must be null rather than 0 or invented");
  assert.equal(formatted[0].totalPrice, null);
  assert.equal(formatted[0].quantity, 200);
});

test("4. Catering financial summary with GST ON vs GST OFF", () => {
  const foodMenu = {
    included: true,
    servingType: "PER_GUEST",
    totalFoodAmount: 100000,
    items: [
      {
        name: "Buffet Spread",
        category: "Main Course",
        rate: 100,
        quantity: 1000,
        amount: 100000,
      },
    ],
  };

  // With GST ON (18%) and 10% proportional discount on subtotal 200,000, discount 20,000
  const cateringWithGst = buildCateringData(foodMenu, 1000, 200000, 20000, true, 18);
  assert.ok(cateringWithGst);
  assert.equal(cateringWithGst.subtotal, 100000);
  assert.equal(cateringWithGst.discount, 10000); // 10% proportional
  // Taxable: 90,000; GST: 90,000 * 0.18 = 16,200; Total: 106,200
  assert.equal(cateringWithGst.gstAmount, 16200);
  assert.equal(cateringWithGst.total, 106200);

  // With GST OFF
  const cateringWithoutGst = buildCateringData(foodMenu, 1000, 200000, 20000, false, 18);
  assert.ok(cateringWithoutGst);
  assert.equal(cateringWithoutGst.subtotal, 100000);
  assert.equal(cateringWithoutGst.discount, 10000);
  assert.equal(cateringWithoutGst.gstAmount, 0);
  assert.equal(cateringWithoutGst.total, 90000);
});

test("5. buildDocumentDataFromEstimate formats full catering table data", () => {
  const estimate = {
    _id: "603d2bbf1c4ae61234567890",
    estimateNumber: "EST-2026-001",
    eventName: "Grand Wedding",
    eventType: "Wedding",
    eventDate: "2026-11-20T00:00:00.000Z",
    eventTime: "18:00",
    guests: 1000,
    location: "Palace Hall",
    subtotal: 145000,
    discount: 5000,
    gstEnabled: true,
    gstRate: 18,
    gstAmount: 25200,
    total: 165200,
    foodMenu: {
      included: true,
      servingType: "PER_GUEST",
      totalFoodAmount: 45000,
      items: [
        {
          name: "Kesar Pista Thandai",
          category: "Beverages",
          rate: 45,
          quantity: 1000,
          amount: 45000,
        },
      ],
    },
    items: [],
  };

  const doc = buildDocumentDataFromEstimate(estimate);
  assert.equal(doc.documentNumber, "EST-2026-001");
  assert.ok(doc.catering);
  assert.equal(doc.catering.included, true);
  assert.equal(doc.catering.guestCount, 1000);
  assert.equal(doc.catering.items?.length, 1);
  assert.equal(doc.catering.items?.[0].unitPrice, 45);
  assert.equal(doc.catering.items?.[0].totalPrice, 45000);
});

test("6. buildDocumentDataFromEvent with populated booking foodMenu", () => {
  const event = {
    _id: "evt-12345",
    eventName: "Annual Meet",
    eventType: "Conference",
    eventDate: "2026-12-05",
    eventTime: "10:00",
    guests: 500,
    location: "Expo Center",
    status: "Upcoming",
    booking: {
      _id: "bkg-12345",
      subtotal: 100000,
      discountAmount: 0,
      gstEnabled: false,
      gstRate: 0,
      gstAmount: 0,
      total: 100000,
      foodMenu: {
        included: true,
        servingType: "PER_PLATE",
        totalFoodAmount: 50000,
        items: [
          {
            name: "High Tea Snacks",
            category: "Starters / Appetizers",
            rate: 100,
            quantity: 500,
            amount: 50000,
          },
        ],
      },
    },
  };

  const doc = buildDocumentDataFromEvent(event);
  assert.ok(doc.catering);
  assert.equal(doc.catering.servingType, "PER_PLATE");
  assert.equal(doc.catering.items?.[0].unit, "Plates");
  assert.equal(doc.catering.items?.[0].totalPrice, 50000);
  assert.equal(doc.catering.gstEnabled, false);
});
