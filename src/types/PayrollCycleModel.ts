export default interface PayrollCycleModel {
  PayrollCycleID?: number; // optional for insert
  OrganizationID: number;
  PayrollCycleTemplateID: number;
  BranchID?: number | null; // nullable
  CycleName: string;
  StartDate: string; // ISO date string (YYYY-MM-DD)
  EndDate: string;
  PaymentDate: string;
  Status: number;
}