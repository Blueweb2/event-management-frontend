export interface LibraryImageItem {
  id: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
  source?: "preset" | "uploaded";
}

export const PRESET_SERVICE_LIBRARY: LibraryImageItem[] = [
  // ==========================================
  // CATERING & DINING
  // ==========================================
  {
    id: "cat-1",
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80",
    title: "Luxury Banquet Buffet Spread",
    category: "catering",
    tags: ["buffet", "catering", "food", "banquet", "dinner", "reception"],
    source: "preset",
  },
  {
    id: "cat-2",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    title: "Fine Dining Gourmet Plating",
    category: "catering",
    tags: ["fine dining", "chef", "plating", "gourmet", "dinner", "culinary"],
    source: "preset",
  },
  {
    id: "cat-3",
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
    title: "Cocktails & Mocktails Beverage Bar",
    category: "catering",
    tags: ["drinks", "bar", "cocktails", "beverages", "welcome drinks", "mocktails"],
    source: "preset",
  },
  {
    id: "cat-4",
    url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80",
    title: "Artisanal Dessert & Pastry Counter",
    category: "catering",
    tags: ["dessert", "pastry", "sweets", "bakery", "cake", "confectionery"],
    source: "preset",
  },
  {
    id: "cat-5",
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
    title: "Live Cooking Station & Appetizers",
    category: "catering",
    tags: ["live counter", "appetizers", "starters", "hot food", "snacks"],
    source: "preset",
  },
  {
    id: "cat-6",
    url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
    title: "Royal Traditional Indian Thali & Curries",
    category: "catering",
    tags: ["indian", "thali", "curry", "rice", "traditional", "feast"],
    source: "preset",
  },

  // ==========================================
  // DECORATION & FLORAL
  // ==========================================
  {
    id: "dec-1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    title: "Grand Stage Backdrop & Floral Arch",
    category: "decoration",
    tags: ["flowers", "stage", "wedding", "backdrop", "arch", "roses", "mandap"],
    source: "preset",
  },
  {
    id: "dec-2",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
    title: "Candlelight Centerpieces & Table Setting",
    category: "decoration",
    tags: ["centerpiece", "candles", "table decor", "luxury", "dinner table"],
    source: "preset",
  },
  {
    id: "dec-3",
    url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&auto=format&fit=crop&q=80",
    title: "Royal Welcome Entrance Gate & Pathway",
    category: "decoration",
    tags: ["entrance", "welcome", "archway", "flowers", "curtain", "lanterns"],
    source: "preset",
  },
  {
    id: "dec-4",
    url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80",
    title: "Fairy Lights Ceiling Canopy & Drapery",
    category: "decoration",
    tags: ["fairy lights", "ceiling", "canopy", "draping", "lights", "night decor"],
    source: "preset",
  },
  {
    id: "dec-5",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80",
    title: "Bohemian Chic Floral Ring & Lounge",
    category: "decoration",
    tags: ["boho", "lounge", "outdoor", "modern decor", "succulents", "pampas"],
    source: "preset",
  },

  // ==========================================
  // LIGHTING & AUDIO VISUAL (AV) / SOUND
  // ==========================================
  {
    id: "av-1",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
    title: "Concert Moving Head Stage Lighting",
    category: "lighting",
    tags: ["stage lighting", "beams", "spotlight", "moving head", "av", "concert"],
    source: "preset",
  },
  {
    id: "av-2",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    title: "Professional DJ Console & Dance Floor",
    category: "sound",
    tags: ["dj", "music", "dance floor", "sound system", "club", "party"],
    source: "preset",
  },
  {
    id: "av-3",
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
    title: "High-Power PA Speakers & Sound Engineering",
    category: "sound",
    tags: ["speakers", "audio", "microphones", "sound engineer", "concert sound"],
    source: "preset",
  },
  {
    id: "av-4",
    url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80",
    title: "LED Video Wall & Backdrop Visuals",
    category: "lighting",
    tags: ["led screen", "projector", "visuals", "presentation", "conference av"],
    source: "preset",
  },

  // ==========================================
  // PHOTOGRAPHY & VIDEOGRAPHY
  // ==========================================
  {
    id: "photo-1",
    url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop&q=80",
    title: "Candid Wedding & Event Photography",
    category: "photography",
    tags: ["camera", "wedding photo", "candid", "portraits", "photographer"],
    source: "preset",
  },
  {
    id: "photo-2",
    url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    title: "Aerial 4K Drone Filming & Coverage",
    category: "videography",
    tags: ["drone", "aerial", "video", "4k", "cinematography", "videographer"],
    source: "preset",
  },
  {
    id: "photo-3",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    title: "Cinematic Gimbal Film Production",
    category: "videography",
    tags: ["cinematic", "video recording", "gimbal", "camera rig", "highlights"],
    source: "preset",
  },
  {
    id: "photo-4",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
    title: "Interactive Photo Booth with Props",
    category: "photography",
    tags: ["photobooth", "instant print", "props", "selfie booth", "fun"],
    source: "preset",
  },

  // ==========================================
  // ENTERTAINMENT & PERFORMANCES
  // ==========================================
  {
    id: "ent-1",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    title: "Live Band & Vocalist Performance",
    category: "entertainment",
    tags: ["live band", "singer", "guitar", "music", "stage act", "concert"],
    source: "preset",
  },
  {
    id: "ent-2",
    url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80",
    title: "Classical Symphony Orchestra",
    category: "entertainment",
    tags: ["orchestra", "violin", "classical music", "instrumental", "acoustic"],
    source: "preset",
  },
  {
    id: "ent-3",
    url: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=800&auto=format&fit=crop&q=80",
    title: "Grand Fireworks & Pyrotechnics Show",
    category: "entertainment",
    tags: ["fireworks", "pyro", "cold sparks", "celebration", "entry"],
    source: "preset",
  },
  {
    id: "ent-4",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    title: "Master of Ceremonies (MC / Emcee)",
    category: "entertainment",
    tags: ["anchor", "host", "emcee", "mc", "speech", "moderator"],
    source: "preset",
  },

  // ==========================================
  // HOSPITALITY, STAFF & LOGISTICS
  // ==========================================
  {
    id: "staff-1",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    title: "VIP Welcome & Guest Reception Hostesses",
    category: "hospitality",
    tags: ["hostess", "welcome", "greeting", "reception", "guest management"],
    source: "preset",
  },
  {
    id: "staff-2",
    url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80",
    title: "Uniformed Stewards & Banquet Waiters",
    category: "staff",
    tags: ["waiters", "stewards", "service staff", "catering staff", "table service"],
    source: "preset",
  },
  {
    id: "staff-3",
    url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&auto=format&fit=crop&q=80",
    title: "Valet Parking & Chauffeur Fleet",
    category: "logistics",
    tags: ["valet", "parking", "cars", "chauffeur", "transport", "logistics"],
    source: "preset",
  },
  {
    id: "staff-4",
    url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80",
    title: "Event Security & Crowd Control Bouncers",
    category: "security",
    tags: ["security", "bouncers", "guard", "vip protection", "safety"],
    source: "preset",
  },

  // ==========================================
  // VENUE, TENT & CANOPY
  // ==========================================
  {
    id: "venue-1",
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80",
    title: "Crystal Chandelier Grand Ballroom",
    category: "venue",
    tags: ["ballroom", "indoor", "chandelier", "hall", "luxury venue"],
    source: "preset",
  },
  {
    id: "venue-2",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
    title: "Open-Air Garden Lawn & Marquee Tent",
    category: "venue",
    tags: ["garden", "lawn", "marquee", "outdoor", "canopy", "tent"],
    source: "preset",
  },
  {
    id: "venue-3",
    url: "https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?w=800&auto=format&fit=crop&q=80",
    title: "Royal Palace Courtyard Heritage Venue",
    category: "venue",
    tags: ["heritage", "palace", "royal", "courtyard", "fort"],
    source: "preset",
  },
];

export const SERVICE_LIBRARY_CATEGORIES = [
  { id: "all", label: "All Assets" },
  { id: "catering", label: "Catering & Bar" },
  { id: "decoration", label: "Decoration & Floral" },
  { id: "lighting", label: "Lighting & AV" },
  { id: "sound", label: "Sound & DJ" },
  { id: "photography", label: "Photography" },
  { id: "videography", label: "Videography" },
  { id: "entertainment", label: "Entertainment" },
  { id: "hospitality", label: "Hospitality & Staff" },
  { id: "venue", label: "Venue & Tent" },
];

export function getFallbackServiceImage(category?: string): string {
  if (!category) return PRESET_SERVICE_LIBRARY[0].url;
  const normalized = category.toLowerCase().trim();
  const match = PRESET_SERVICE_LIBRARY.find((item) =>
    item.category.toLowerCase().includes(normalized) ||
    normalized.includes(item.category.toLowerCase())
  );
  return match ? match.url : PRESET_SERVICE_LIBRARY[0].url;
}

