import axiosInstance from '../api/axiosPayrollInstance';

const salaryService = {
    getSalaryStructuresAsync: async (organizationID:number) => {
    try {
      const { data } = await axiosInstance.get(`Salary/GetSalaryStructures?organizationID=${organizationID}`);
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
  },
  PostSalaryStructureByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Salary/SaveOrUpdateSalaryStructure", payload);
    return res.data[0];
},
   DeleteSalaryStructureByAsync: async (structureID:number) => {   
      const { data } = await axiosInstance.delete(`Salary/DeleteSalaryStructure?structureID=${structureID}`);
      return data;   
  },
   PostSalaryStructurecomponentByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Salary/SaveOrUpdateSalaryComponent", payload);
    return res.data[0];
   },
   DeleteSalaryStructurecomponentByAsync: async (componentID:number) => {   
      const { data } = await axiosInstance.delete(`Salary/DeleteSalaryComponent?componentID=${componentID}`);
      return data;   
  },
   PostSalaryStructurecomponentMappingByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Salary/SaveOrUpdateSalaryStructureComponent", payload);
    return res.data[0];
},
DeleteSalaryStructurecomponentMappingByAsync: async (structureComponentId:number) => {   
      const { data } = await axiosInstance.delete(`Salary/DeleteSalaryStructureComponent?structureComponentId=${structureComponentId}`);
      return data;   
  },
};

export default salaryService;