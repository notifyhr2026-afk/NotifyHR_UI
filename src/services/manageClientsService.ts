import axiosInstance from '../api/axiosHRInstance';

const manageClientsService = {
  
 GetAllLookups: async () => {
    const response = await axiosInstance.get(`ManageClients/GetAllLookups`);
    return response.data;
  },
  GetClientsByOrganization: async (organizationID: number) => {
    const response = await axiosInstance.get(`ManageClients?organizationID=${organizationID}`);
    return response.data;
  },
  PostClientsByAsync: async (payload: any) => {
    const res = await axiosInstance.post("ManageClients", payload);
    return res.data[0];
   },
 DeleteClientsByAsync: async (ProjectID: number, modifiedBy: string) => {
  const { data } = await axiosInstance.delete(
    `ManageClients?clientId=${ProjectID}&modifiedBy=${modifiedBy}`
  );
  return data;
},
 
};
export default manageClientsService;