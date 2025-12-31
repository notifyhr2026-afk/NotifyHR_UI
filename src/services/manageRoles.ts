import api from "../api/axiosHRInstance";
const manageRoles = {
  // ✅ Get all branches by OrganizationID
  getRolesAsync: async () => {
    try {
      const { data } = await api.get("Roles");
      return data;
    } catch (error) {
      console.error('Error fetching Roles:', error);
      throw error;
    }
  },

  // CREATE ROLE
  createRoleAsync: async (role: {
    roleID: number;
    roleName: string;
    roleCode: string;
    description: string;
    isActive: boolean;
    createdBy: string;
  }) => {
    try {
      const { data } = await api.post("Roles", role);
      return data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },
};
export default manageRoles;