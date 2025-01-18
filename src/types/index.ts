export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  qualifications: string[];
  startDate: string;
  workingHours: WorkingHours[];
}

export interface WorkingHours {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  project?: string;
}

export interface Customer {
  id: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  customPricing?: Record<string, number>;
}

export interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Project {
  id: string;
  customerId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  plannedDate: string;
  executionDate?: string;
  estimatedDuration: number;
  location: {
    address: Address;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  materials: Material[];
  notes: Note[];
  photos: Photo[];
}

export type ProjectStatus = 'new' | 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}