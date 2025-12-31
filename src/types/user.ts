export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  passwordHash: string;
  isPasswordReset: boolean;
  passwordResetDate: string;
  isActive: boolean;
  isDeleted: boolean;
}
