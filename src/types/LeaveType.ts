 export default interface LeaveType {
  LeaveTypeID: number;
  LeaveTypeName: string;
  Description: string;
}

 export default interface OrgLeaveType {
  OrgLeaveTypeID:number;
  OrganizationID:number;
  LeaveTypeID: number;
  LeaveTypeName: string;
  Description: string;
  IsActive: boolean;
  CreatedBy:string;
}