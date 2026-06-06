import axiosInstance from '../api/axiosPayrollInstance';

const timesheetService = {
  GetTimesheetStatusMaster: async () => {
    const response = await axiosInstance.get(`TimesheetEntry/GetTimesheetStatusMasterAsync`);
    return response.data;
  },
  GetTimesheetEntriesByEmployeeID: async (employeeID: number) => {
    const response = await axiosInstance.get(`TimesheetEntry/GetTimesheetEntriesByEmployeeID?employeeID=${employeeID}`);
    return response.data;
  },
 createTimesheetEntries: async (TimesheetEntries: any) => {
    const { data } = await axiosInstance.post('TimesheetEntry/SaveOrUpdateTimesheetEntries', TimesheetEntries);
    return Array.isArray(data?.Table) ? data.Table : [];
  },
  GetTimesheetForApproveByAsync: async (employeeIDs: number[]) => {
  const res = await axiosInstance.post(
    "TimesheetEntry/GetTimesheetForApprove",
    {
      employeeIDs: "[" + employeeIDs.join(",") + "]" // ✅ convert to string
    }
  );
  return res.data;
},
 ApproveTimesheetEntries: async (TimesheetEntries: any) => {
    const { data } = await axiosInstance.put('TimesheetEntry/ApproveTimesheetEntries', TimesheetEntries);
    return Array.isArray(data?.Table) ? data.Table : [];
  },
 GetTimesheetSummaryReport: async (employeeID: number, month: number) => {
    const response = await axiosInstance.get(`TimesheetEntry/GetTimesheetSummaryReport?employeeID=${employeeID}&month=${month}`);
    return response.data;
    },
};

export default timesheetService;