export default interface OrgLeavePolicy {
  OrgLeavePolicyID: number;
  OrganizationID: number;
  LeavePolicyID: number;
  PolicyName:string;
  LeaveTypeID:Number;
  TotalAnnualLeaves: number | null;
  MaxCarryForward: number | null;
  AllowNegativeBalance: boolean;
  Encashable: boolean;
  IsActive: boolean;
  EffectiveFrom: string | null;
  EffectiveTo: string | null;
  IsPolicyChanged: number;
  PolicyChanged: string;
}