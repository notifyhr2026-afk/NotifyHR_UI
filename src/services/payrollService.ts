import axiosInstance from '../api/axiosPayrollInstance';

const payrollService = {
    GetTaxSectionsAsync: async () => {
    try {
      const { data } = await axiosInstance.get(`Payroll/GetTaxSections`);
      return data;
    } catch (error) {
      console.error('Error fetching GetTaxSections:', error);
      throw error;
    }
  },
   PostSalaryStructurecomponentMappingByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Payroll/CreateOrUpdateTaxSection", payload);
    return res.data[0];
},
DeleteSalaryStructurecomponentMappingByAsync: async (payload:any) => {   
      const res = await axiosInstance.delete("Payroll/DeleteTaxSection",{ data: payload });
      return res.data[0]; 
  },
};

export default payrollService;