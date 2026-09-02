export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Elegant Wedding Celebration",
    category: "Wedding",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 2,
    title: "Beautiful Wedding Reception",
    category: "Wedding",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 3,
    title: "Birthday Celebration",
    category: "Birthday",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 4,
    title: "Beautiful Event Setup",
    category: "Decoration",
    image:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 5,
    title: "Engagement Celebration",
    category: "Engagement",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 6,
    title: "Reception Setup",
    category: "Decoration",
    image:
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 7,
    title: "Corporate Gathering",
    category: "Corporate",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 8,
    title: "Private Celebration",
    category: "Private",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
  },
];

export const galleryCategories = [
  "All",
  "Wedding",
  "Birthday",
  "Engagement",
  "Corporate",
  "Decoration",
  "Private",
];