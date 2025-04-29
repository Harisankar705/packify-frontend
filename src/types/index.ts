
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  address?: string;
  role: 'user' | 'admin';
}

export interface TravelPackage {
  _id: string;
  from: string;
  to: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  services: {
    food: boolean;
    accommodation: boolean;
  };
}

export interface Booking {
  _id: string;
  userId: string;
  packageId: string;
  packageDetails?: TravelPackage;
  selectedServices: {
    food: boolean;
    accommodation: boolean;
  };
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface SearchParams {
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'price' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface FormattedBooking extends Booking {
  status: 'upcoming' | 'active' | 'completed';
}
