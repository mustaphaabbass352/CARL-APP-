
export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  BOLT_PAYOUT = 'BOLT_PAYOUT'
}

export enum ExpenseType {
  FUEL = 'FUEL',
  MAINTENANCE = 'MAINTENANCE',
  CAR_WASH = 'CAR_WASH',
  COMMISSION = 'COMMISSION',
  OTHER = 'OTHER'
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Trip {
  id: string;
  startTime: number;
  endTime: number | null;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  distance: number; // in km
  paymentType: PaymentType;
  customerId?: string;
  notes: string;
  route: LatLng[];
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Customer {
  id: string;
  name: string;
  nickname: string;
  notes: string;
  phone?: string;
}

export interface Expense {
  id: string;
  date: number;
  amount: number;
  type: ExpenseType;
  notes: string;
}

export interface AppData {
  trips: Trip[];
  customers: Customer[];
  expenses: Expense[];
}
