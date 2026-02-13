export interface ChangePasswordRequest {
  organizationID: number;
  userID:number,
  oldPassword: string;
  password: string;
  modifiedBy: string;
}
