export default interface AdminResetPasswordRequest {
  userID: number;
  organizationID: number;
  modifiedBy: string;
}
export interface ChangePasswordRequest {
  organizationID: number;
  userID:number,
  oldPassword: string;
  password: string;
  modifiedBy: string;
}