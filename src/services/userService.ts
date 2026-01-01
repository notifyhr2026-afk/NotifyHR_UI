import axiosInstance from '../api/axiosIdentityInstance'; 

const userService = {
    getOrgDetailsAsync: async (organizationID : number) => {
    try {
      const { data } = await axiosInstance.get(`Users/GetAdminUsers/${organizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }
};

export default userService;
