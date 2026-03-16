import axiosInstance from '../api/axiosHRInstance';

const projectService = {
  
 GetProjectsByOrganization: async (organizationID: number) => {
    const response = await axiosInstance.get(`Project?organizationID=${organizationID}`);
    return response.data;
  },
  PostProjectByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Project", payload);
    return res.data[0];
   },
  DeleteProjectByAsync: async (ProjectID:number) => {   
      const { data } = await axiosInstance.delete(`Project?ProjectID=${ProjectID}`);
      return data;   
  }
};
export default projectService;
