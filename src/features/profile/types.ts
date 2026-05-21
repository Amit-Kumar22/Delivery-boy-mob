export type DocumentType = 'AADHAR_CARD' | 'DRIVING_LICENSE' | 'PAN_CARD';

export type DeliveryStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'BLOCKED' | 'DELETED';

export type AvailabilityStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

export interface State {
  id: number;
  name: string;
  code: string;
}

export interface City {
  id: number;
  name: string;
  code: string;
  state: State;
  popular: boolean;
}

export interface ServiceArea {
  id: number;
  pinCode: string;
  active: boolean;
  city: City;
}

export interface ServiceAreaMapping {
  id: number;
  created: string;
  updated: string;
  serviceArea: ServiceArea;
  active: boolean;
}

export interface DeliveryBoyDocument {
  id: number;
  created: string;
  updated: string;
  type: DocumentType | null;
  frontImage: string | null;
  backImage: string | null;
  verified: boolean;
  active: boolean;
}

export interface Vehicle {
  id: number;
  created: string;
  updated: string;
  vehicleType: string;
  vehicleNumber: string;
  model: string;
  image: string | null;
  verified: boolean;
  active: boolean;
}

export interface DeliveryBoyProfile {
  id: number;
  created: string;
  updated: string;
  profileImage: string | null;
  name: string;
  phone: string;
  email: string;
  status: DeliveryStatus;
  availability: AvailabilityStatus;
  rating: number | null;
  totalDeliveries: number | null;
  verified: boolean;
  serviceAreaMappings: ServiceAreaMapping[] | null;
  deliveryBoyDocuments: DeliveryBoyDocument[] | null;
  vehicle: Vehicle | null;
  active: boolean;
}

export interface VehicleDetailRequest {
  vehicleType: string;
  vehicleNumber: string;
  model: string;
  image: string;
}

export interface DocumentRequest {
  type: DocumentType;
  frontImage: string;
  backImage: string;
}

export interface UpdateStatusRequest {
  status: DeliveryStatus;
}
