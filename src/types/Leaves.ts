export interface Leave {
  id: number;
  employeeID: string;
  leaveTypeID: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
  reason: string;
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
