
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dateFnsFormat } from 'date-fns';
import { TravelPackage, Booking } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    return dateFnsFormat(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function getPackageStatus(travelPackage: TravelPackage): 'completed' | 'active' | 'upcoming' {
  const today = new Date();
  const startDate = new Date(travelPackage.startDate);
  const endDate = new Date(travelPackage.endDate);

  if (endDate < today) {
    return 'completed';
  } else if (startDate <= today && today <= endDate) {
    return 'active';
  } else {
    return 'upcoming';
  }
}

export function getBookingStatus(booking: Booking): 'completed' | 'active' | 'upcoming' {
  if (!booking.packageDetails) return 'upcoming';
  
  return getPackageStatus(booking.packageDetails);
}

export function calculateTotalPrice(
  basePrice: number,
  services: { food: boolean; accommodation: boolean }
): number {
  let total = basePrice;
  
  if (services.food) {
    total += basePrice * 0.2;
  }
  
  if (services.accommodation) {
    total += basePrice * 0.3;
  }
  
  return total;
}
