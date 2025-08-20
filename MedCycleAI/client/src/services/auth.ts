import { apiRequest } from '@/lib/queryClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  organizationName: string;
  ownerName: string;
  mobile: string;
  pinCode: string;
  userType: string;
  govIdNumber: string;
  aadhaarNumber: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export const authService = {
  async login(data: LoginRequest) {
    const response = await apiRequest('POST', '/api/auth/login', data);
    return await response.json();
  },

  async register(data: RegisterRequest) {
    const response = await apiRequest('POST', '/api/auth/register', data);
    return await response.json();
  },

  async adminLogin(data: AdminLoginRequest) {
    const response = await apiRequest('POST', '/api/auth/admin-login', data);
    return await response.json();
  },

  async getMe() {
    const response = await apiRequest('GET', '/api/auth/me');
    return await response.json();
  }
};
