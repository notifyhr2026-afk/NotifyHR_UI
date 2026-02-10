import axiosInstance from '../api/axiosPayrollInstance';

const salaryService = {
    getSalaryStructuresAsync: async () => {
    try {
      const { data } = await axiosInstance.get(`Salary/GetSalaryStructures`);
      return data;
    } catch (error) {
      console.error('Error fetching Salary Structures:', error);
      throw error;
    }
  },
   GeSalaryComponentMasterAsync: async () => {
    try {
      const { data } = await axiosInstance.get(`Salary/GeSalaryComponentMaster`);
      return data;
    } catch (error) {
      console.error('Error fetching Salary Components:', error);
      throw error;
    }
  },
   GetStructureComponentsAsync: async (structureID:number) => {
    try {
      const { data } = await axiosInstance.get(`Salary/GetStructureComponents?structureID=${structureID}`);
      return data;
    } catch (error) {
      console.error('Error fetching Salary Components:', error);
      throw error;
    }
  }
};

export default salaryService;