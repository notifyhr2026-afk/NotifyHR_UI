import api from "../api/axiosHRInstance";
const divisionService = {
  // ✅ Get all divisiones by OrganizationID
  getdivisionesAsync: async (organizationID : number) => {
    try {
      const { data } = await api.get(`division/GetDivisionsAsync?OrganizationID=${organizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching divisiones:', error);
      throw error;
    }
  },

  // ✅ Create or update a division
  createOrUpdatedivisionAsync: async (division : any) => {
    try {
        debugger;
      console.log('Request body:', division);
      const { data } = await api.post('division/CreateOrUpdateDivisionAsync', division);
      // Assuming your API returns a JSON array like [{ divisionID: 123 }]
      return Array.isArray(data?.Table) ? data.Table : [];
    } catch (error) {
      console.error('Error creating or updating division:', error);
      throw error;
    }
  },

   // ✅ Delete a division by divisionID
  deletedivisionAsync: async (divisionID: number) => {
    try {
      const { data } = await api.delete(`division/DeletedivisionAsync?divisionID=${divisionID}`);
      return data;
    } catch (error) {
      console.error('Error deleting division:', error);
      throw error;
    }
  }
};

export default divisionService;