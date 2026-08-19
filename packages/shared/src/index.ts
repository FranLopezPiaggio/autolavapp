export * from './auth.js';

// --- TIPOS DE ENUMERADOS Y ESTADOS ---
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type VehicleType = 'CAR' | 'SUV' | 'PICKUP' | 'MOTORCYCLE' | 'VAN';
export type VehicleSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

// --- ENTIDADES PRINCIPALES (DTOs) ---

export interface CustomerDTO {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface VehicleDTO {
  id: string;
  customerId?: string;
  plates: string;
  vehicleType: VehicleType;
  vehicleSize: VehicleSize;
  notes?: string;
  createdAt?: string;
}

export interface WorkingHoursDTO {
  id: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ...
  startTime: string; // "08:00:00"
  endTime: string;   // "18:00:00"
  slotDurationMinutes: number;
}

export interface ServiceDTO {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface OrderServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface OrderDTO {
  id: string;
  customerId?: string;
  vehicleId?: string;
  customerName: string;
  customerPhone?: string;
  vehiclePlate: string;
  services: OrderServiceItem[];
  status: OrderStatus;
  totalAmount: number;
  estimatedMinutes: number;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
}

// --- DTOs PARA CREACIÓN Y MIGRACIÓN DE RESERVAS ---

export interface CheckAvailabilityDTO {
  date: string; // YYYY-MM-DD
  serviceIds: string[];
}

export interface AvailableSlotDTO {
  startTime: string; // ISO string
  endTime: string;
}

export interface CheckAvailabilityResponseDTO {
  date: string;
  availableSlots: AvailableSlotDTO[];
}

export interface CreateBookingDTO {
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  vehicleSize: VehicleSize;
  serviceIds: string[];
  scheduledAt: string; // Formato ISO 8601
  notes?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}

export interface OrderFilterDTO {
  startDate?: string;
  endDate?: string;
  status?: OrderStatus;
  vehiclePlate?: string;
  customerId?: string;
}