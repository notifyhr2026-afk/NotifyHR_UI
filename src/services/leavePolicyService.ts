import api from "../api/axiosAttendanceInstance";
const leavePolicyService = {
  // ✅ Get all branches by OrganizationID
  getLeavePolicy: async () => {
    try {
      const { data } = await api.get(`LeavePolicy`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }
};
export default leavePolicyService;
