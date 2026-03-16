import axiosInstance from '../api/axiosHRInstance';

const employeeProjectService = {
  
 GetEmployeeProjectsByOrganization: async (employeeId: number) => {
    const response = await axiosInstance.get(`EmployeeProject?employeeId=${employeeId}`);
    return response.data;
  },
  PostEmployeeProjectByAsync: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeProject", payload);
    return res.data[0];
   },
  DeleteEmployeeProjectByAsync: async (employeeProjectId:number) => {   
      const { data } = await axiosInstance.delete(`EmployeeProject?employeeProjectId=${employeeProjectId}`);
      return data;   
  }
};
export default employeeProjectService;
