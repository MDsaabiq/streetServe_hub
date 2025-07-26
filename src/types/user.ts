export type UserRole = 'buyer' | 'vendor' | 'landowner';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  image?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  businessName?: string;
  businessType?: string;
  description?: string;
  website?: string;
  gst?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: UserRole;
}