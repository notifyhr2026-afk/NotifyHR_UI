export interface HolidayRequest {
  holidayID: number;
  organizationID: number;
  branchID: number;
  holidayName: string;
  holidayDate: string; // YYYY-MM-DD
  isOptional: boolean;
  isActive: boolean;
  createdBy: string;
}