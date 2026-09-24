import { getServices } from "./services.api";

export const STANDARD_DEPARTMENTS = [
  "Catering",
  "Decoration",
  "Sound & Lighting",
  "Photography & Media",
  "Security",
  "Logistics",
  "Hospitality",
  "General Operations",
];

export async function getDepartmentAndServiceOptions(): Promise<string[]> {
  try {
    const services = await getServices();
    const serviceNames = Array.isArray(services) ? services.map((s) => s.name) : [];
    const combined = Array.from(
      new Set([...STANDARD_DEPARTMENTS, ...serviceNames])
    ).filter(Boolean).sort();
    return combined;
  } catch (err) {
    console.warn("Could not load dynamic services for department list", err);
    return STANDARD_DEPARTMENTS;
  }
}
