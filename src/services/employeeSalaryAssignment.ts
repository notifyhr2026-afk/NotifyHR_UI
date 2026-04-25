import axiosInstance from '../api/axiosPayrollInstance';

const employeeSalaryAssignment = {
  
  GetEmployeeSalaryAssignmentByEmployeeID: async (employeeID: number,organizationID: number) => {
    const response = await axiosInstance.get(`EmployeeSalaryAssignment?employeeID=${employeeID}&organizationID=${organizationID}`);
    return response.data;
  },
  PostEmployeeSalaryAssignmentAsync: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeSalaryAssignment", payload);
    return res.data[0];
   },
  DeleteEmployeeSalaryAssignmentAsync: async (salaryAssignmentID:number) => {   
      const { data } = await axiosInstance.delete(`EmployeeSalaryAssignment?salaryAssignmentID=${salaryAssignmentID}`);
      return data;   
  },
  GetEmployeeSalaryBreakupByEmployeeID: async (employeeID: number) => {
    const response = await axiosInstance.get(`EmployeeSalaryAssignment/GetEmployeeSalaryBreakup?employeeID=${employeeID}`);
    return response.data;
  },
 GetEmployeeMonthlyPayslipByEmployeeID: async (
  employeeID: number,
  month: number,
  year: number
) => {
  const response = await axiosInstance.get(
    `EmployeeSalaryAssignment/GetEmployeeMonthlyPayslip?employeeID=${employeeID}&month=${month}&year=${year}`
  );
  return response.data;
},
};
export default employeeSalaryAssignment;