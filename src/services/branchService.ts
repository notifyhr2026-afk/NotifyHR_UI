import api from "../api/axiosHRInstance";
const branchService = {
  // ✅ Get all branches by OrganizationID
  getBranchesAsync: async (organizationID : number) => {
    try {
      const { data } = await api.get(`Branch/GetBranchesAsync?OrganizationID=${organizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  // ✅ Create or update a branch
  createOrUpdateBranchAsync: async (branch : any) => {
    try {
        debugger;
      console.log('Request body:', branch);
      const { data } = await api.post('Branch/CreateOrUpdateBranchAsync', branch);
      // Assuming your API returns a JSON array like [{ BranchID: 123 }]
      return Array.isArray(data?.Table) ? data.Table : [];
    } catch (error) {
      console.error('Error creating or updating branch:', error);
      throw error;
    }
  },

   // ✅ Delete a branch by BranchID
  deleteBranchAsync: async (branchID: number) => {
    try {
      const { data } = await api.delete(`Branch/DeleteBranchAsync?BranchID=${branchID}`);
      return data;
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  }
};

export default branchService;