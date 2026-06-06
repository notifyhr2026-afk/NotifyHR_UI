import axiosInstance from '../api/axiosAttendanceInstance';

const employeeshiftService = {
  
 GetEmployeeShiftByEmployeeID: async (employeeID: number) => {
    const response = await axiosInstance.get(`EmployeeShift?employeeID=${employeeID}`);
    const data = response.data;
    return Array.isArray(data?.Table) ? data.Table : data || [];
  },
  PostEmployeeShiftAsync: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeShift", payload);
    return res.data[0];
   },
  DeleteEmployeeShiftAsync: async (employeeShiftID:number) => {   
      const { data } = await axiosInstance.delete(`EmployeeShift?employeeShiftID=${employeeShiftID}`);
      return data;   
  }
};
export default employeeshiftService;
