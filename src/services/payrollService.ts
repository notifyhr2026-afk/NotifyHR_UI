import axiosInstance from '../api/axiosPayrollInstance';

const payrollService = {
    GetTaxSectionsAsync: async () => {
      const { data } = await axiosInstance.get(`Payroll/GetTaxSections`);
      return data;
   },
   PostSalaryStructurecomponentMappingByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Payroll/CreateOrUpdateTaxSection", payload);
    return res.data[0];
   },
   DeleteSalaryStructurecomponentMappingByAsync: async (payload:any) => {   
      const res = await axiosInstance.delete("Payroll/DeleteTaxSection",{ data: payload });
      return res.data[0]; 
   },
   GetPayrollCycleTemplates: async () => {
      const { data } = await axiosInstance.get(`Payroll/GetPayrollCycleTemplates`);
      return data;
   },
   PostPayrollCycleByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Payroll/CreateOrUpdatePayrollCycle", payload);
    return res.data;
   },
  };

export default payrollService;