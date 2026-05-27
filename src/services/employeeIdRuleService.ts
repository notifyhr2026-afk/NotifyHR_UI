import axiosInstance from '../api/axiosHRInstance';

const employeeIdRuleService = {
  
 GetEmployeeIdRules: async (organizationID: number) => {
    const response = await axiosInstance.get(`EmployeeIdRules?organizationID=${organizationID}`);
    return response.data;
  },
  PostEmployeeIdRulesAsync: async (payload: any) => {
    const res = await axiosInstance.post("EmployeeIdRules", payload);
    return res.data[0];
   },
  DeleteEmployeeIdRulesAsync: async (id:number) => {   
      const { data } = await axiosInstance.delete(`EmployeeIdRules?id=${id}`);
      return data;   
  }
};
export default employeeIdRuleService;
