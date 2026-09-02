export interface BookingFormData {
  // Event details
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: string;
  location: string;

  // Package
  package: string;

  // Food
  foodType: string;
  meals: string[];
  foodRequirements: string;

  // Additional requirements
  requirements: string[];
  otherRequirements: string;

  // Customer details
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface BookingStep {
  id: number;
  title: string;
  shortTitle: string;
}