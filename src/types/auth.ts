export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'staff';
  addresses?: any[];
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
}
