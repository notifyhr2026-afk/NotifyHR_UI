export default interface LeavePolicy {
  LeavePolicyID: number;
  PolicyName: string;
  LeaveTypeName: string;
  LeaveTypeID: number;
  TotalAnnualLeaves: number;
  MaxCarryForward: number;
  Encashable: boolean;
  AllowNegativeBalance: boolean;
  IsActive: boolean;
}

