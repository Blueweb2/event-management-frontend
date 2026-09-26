import { getServices } from "./services.api";

export const STANDARD_DEPARTMENTS = [
  "Food & Catering",
  "Food",
  "Catering",
  "Decoration",
  "Sound & Lighting",
  "Photography & Media",
  "Security",
  "Logistics",
  "Hospitality",
  "General Operations",
];

export async function getDepartmentAndServiceOptions(
  currentValue?: string
): Promise<string[]> {
  const optionsList: string[] = [...STANDARD_DEPARTMENTS];

  try {
    const services = await getServices();
    if (Array.isArray(services) && services.length > 0) {
      services.forEach((s) => {
        if (s.name?.trim()) {
          optionsList.push(s.name.trim());
        }
        if (s.category?.trim()) {
          // Format category neatly (e.g., "sound & lighting" -> "Sound & Lighting")
          const formattedCategory = s.category
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          optionsList.push(formattedCategory);
        }
      });
    }
  } catch (err) {
    console.warn("Could not load dynamic services for department list", err);
  }

  if (currentValue?.trim()) {
    optionsList.push(currentValue.trim());
  }

  return Array.from(new Set(optionsList)).filter(Boolean).sort();
}
