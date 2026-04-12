import api from "../api/axiosIdentityInstance";

export interface LoginResponse {
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

export const loginService = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post("Auth/login", { username, password });
    return response.data;
  } catch (error: any) {
    console.error("Login API error:", error);

    // 🔴 Handle 403 → Redirect مباشرة
    if (error.response?.status === 403) {
      const userId = error.response.data?.userID;
      const orgId = error.response.data?.organizationID;

      // ✅ Redirect without React hook
      window.location.href = `/ResetPassword/${userId}/${orgId}`;

      return {
        isValid: false,
        isPasswordResetRequired: true,
        message: "Redirecting to reset password...",
      };
    }

    throw error.response?.data || {
      message: "An error occurred during login.",
    };
  }
};