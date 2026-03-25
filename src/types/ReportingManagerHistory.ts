export interface ReportingManagerHistory {
  managerHistoryID: number; // 0 = Insert, >0 = Update
  employeeID: number;
  positionID: number;
  reportingManagerID: number;
  effectiveFrom: string; // ISO date string
  effectiveTo?: string | null;
  reason?: string | null;
  notes?: string | null;
  isCurrent: boolean;
  createdBy: string;
  employmentTypeID?: number | null;
  departmentID?: number | null;
  divisionID?: number | null;
  branchID?: number | null;
  changeStatusID?: number | null;
}