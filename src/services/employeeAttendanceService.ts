import axiosInstance from '../api/axiosAttendanceInstance';

const employeeAttendanceService = {

  getEmployeeAttendanceByEmployeeId: async (employeeId: number) => {
    const response = await axiosInstance.get(
      `EmployeeAttendance?employeeId=${employeeId}`
    );
    return response.data;
  },
  CreateOrUpdateEmployeeAttendanceByemployeeId: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/CreateOrUpdateEmployeeAttendanceAsync", payload);
    return res.data;
   },
  CreateOrUpdateAttendanceCorrectionByAsync: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/CreateOrUpdateAttendanceCorrectionAsync", payload);
    return res.data;
   },
  submitAttendanceCorrection: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/SubmitAttendanceCorrection", payload);
    return res.data;
   },
    getEmployeeAttendance: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/GetEmployeeAttendance", payload);
    return res.data;
   },
  getAttendanceCorrectionRequests: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/GetAttendanceCorrectionRequests", payload);
    return res.data;
   },
  approveRejectAttendanceCorrection: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/ApproveRejectAttendanceCorrection", payload);
    return res.data;
   },
   GetEmployeeTimeActivities: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/GetEmployeeTimeActivities", payload);
    return res.data;
   },
};
export default employeeAttendanceService;
