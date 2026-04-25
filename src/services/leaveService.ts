import axiosInstance from "../api/axiosAttendanceInstance";
const leaveService = {
     GetEmployeeLeavesByAsync: async (EmployeeID:number) => {   
      const { data } = await axiosInstance.get(`EmployeeLeave?employeeID=${EmployeeID}`);
      return data;   
  },
   PostApplyLeaveByAsync: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeLeave", payload);
    return res.data[0];
  },
  GetEmployeeLeaveBalanceAsync: async (organizationId: number, employeeID: number  ) => {
      const { data } = await axiosInstance.get(`EmployeeLeave/GetEmployeeLeaveBalanceAsync?organizationID=${organizationId}&employeeID=${employeeID}`);
      return data;
   },
   GetEmployeeLeavesForApproveByAsync: async (employeeIDs: number[]) => {
  const res = await axiosInstance.post(
    "EmployeeLeave/GetEmployeeLeavesForApproveAsync",
    {
      employeeIDs: "[" + employeeIDs.join(",") + "]" // ✅ convert to string
    }
  );
  return res.data;
},
ApproveOrRejectEmployeeLeaveAsync: async (payload: any) => {
    const res = await axiosInstance.put("EmployeeLeave/ApproveOrRejectEmployeeLeaveAsync", payload);
    return res.data[0];
  },
  GetEmployeeLeavesReportAsync: async (
  organizationID: number,
  employeeID?: number,
  fromDate?: string,
  toDate?: string
) => {
  const { data } = await axiosInstance.get(
    `EmployeeLeave/GetEmployeeLeavesReportAsync`,
    {
      params: {
        organizationID,
        employeeID,
        fromDate,
        toDate
      }
    }
  );

  return data;
},
};
export default leaveService;