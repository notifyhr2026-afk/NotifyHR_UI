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
};
export default leaveService;