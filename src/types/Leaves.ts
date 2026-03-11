export interface Leave {
  id: number;
  employeeID: string;
  leaveTypeID: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
  reason: string;
  isHalfDay?: boolean;      // ✅ optional
  halfDayType?: string;     // ✅ optional
}
export interface LeaveTypeOption {
  value: string;
  label: string;
  totalLeaves: number;
}

export interface EmployeeOption {
  value: string;
  label: string;
}

