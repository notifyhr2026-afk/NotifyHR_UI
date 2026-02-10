import api from "../api/axiosAttendanceInstance";
const leaveTypesService = {
  // ✅ Get all branches by OrganizationID
  getLeaveLeaveTypes: async () => {
    try {
      const { data } = await api.get(`LeaveType`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }
};
export default leaveTypesService;
