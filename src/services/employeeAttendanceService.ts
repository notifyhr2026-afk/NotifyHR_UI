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
    getEmployeeAttendance: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeAttendance/GetEmployeeAttendance", payload);
    return res.data;
   },
};
export default employeeAttendanceService;
