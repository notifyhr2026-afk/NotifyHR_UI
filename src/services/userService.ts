import axiosInstance from '../api/axiosIdentityInstance'; 

const userService = {
   

  PostGenerateLoginsAsync: async (payload: any) => {
    const res = await axiosInstance.post("Users/GenerateLogins", payload);
    return res.data;
   },


    getOrgDetailsAsync: async (organizationID : number) => {
    try {
      const { data } = await axiosInstance.get(`Users/GetAdminUsers/${organizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },
  getUsersByOrganizationIdAsync: async (organizationID : number) => {    
      const { data } = await axiosInstance.get(`Users/GetUsersByOrganizationId?OrganizationID=${organizationID}`);
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

export default userService;
