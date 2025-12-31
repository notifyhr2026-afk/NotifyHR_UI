import api from "../api/axiosInstance";

interface LoginResponse {
  isValid?: boolean;
  isPasswordResetRequired?: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    userID: number;
    fullName: string;
    email: string;
    username: string;
    organizationID: number;
    organizationName: string;
  };
  roles?: Array<{ roleID: number; roleName: string }>;
  permissions?: any[];
}

export const loginService = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('Auth/login', { username, password });
    return response.data;
  } catch (error: any) {
    if(error.status === 403){
      window.location.href = '/ResetPassword';
      return false as any;
    }
    console.error('Login API error:', error);
    throw error.response?.data || { message: 'An error occurred during login.' };
  }
};
