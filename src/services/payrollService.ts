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
  }
};

export default payrollService;