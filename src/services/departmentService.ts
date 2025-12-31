import api from "../api/axiosHRInstance";
const departmentService = {
  // ✅ Get all departmentes by OrganizationID
  getdepartmentesAsync: async (organizationID : number) => {
    try {
      const { data } = await api.get(`department/GetdepartmentsAsync?OrganizationID=${organizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching departmentes:', error);
      throw error;
    }
  },

  // ✅ Create or update a department
  createOrUpdatedepartmentAsync: async (department : any) => {
    try {
        debugger;
      console.log('Request body:', department);
      const { data } = await api.post('department/CreateOrUpdatedepartmentAsync', department);
      // Assuming your API returns a JSON array like [{ departmentID: 123 }]
      return Array.isArray(data?.Table) ? data.Table : [];
    } catch (error) {
      console.error('Error creating or updating department:', error);
      throw error;
    }
  },

   // ✅ Delete a department by departmentID
  deletedepartmentAsync: async (departmentID: number) => {
    try {
      const { data } = await api.delete(`department/DeletedepartmentAsync?departmentID=${departmentID}`);
      return data;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }
};

export default departmentService;