import axiosInstance from '../api/axiosHRInstance';

const manageClientsService = {
  
 GetAllLookups: async () => {
    const response = await axiosInstance.get(`ManageClients/GetAllLookups`);
    return response.data;
  },
};
export default manageClientsService;