import type { CustomerActivity } from "./CustomerActivityTimeline";

export const customerActivities: CustomerActivity[] = [
  {
    id: "ACT-001",
    type: "booking",
    title: "New booking created",
    description:
      "Wedding Celebration booking was created with the Premium package.",
    date: "Sep 5, 2026",
    time: "11:30 AM",
    user: "Manager",
  },
  {
    id: "ACT-002",
    type: "payment",
    title: "Payment received",
    description:
      "Advance payment of ₹40,000 was received for BK-001.",
    date: "Sep 5, 2026",
    time: "12:15 PM",
    user: "Manager",
  },
  {
    id: "ACT-003",
    type: "note",
    title: "Customer note added",
    description:
      "Customer prefers traditional Kerala-style decoration.",
    date: "Sep 5, 2026",
    time: "1:20 PM",
    user: "Manager",
  },
  {
    id: "ACT-004",
    type: "contact",
    title: "Customer contacted",
    description:
      "Customer was contacted regarding the upcoming event requirements.",
    date: "Sep 4, 2026",
    time: "4:10 PM",
    user: "Staff",
  },
  {
    id: "ACT-005",
    type: "completed",
    title: "Previous event completed",
    description:
      "Engagement Ceremony was successfully completed.",
    date: "Jun 20, 2026",
    time: "9:30 PM",
    user: "Staff",
  },
];