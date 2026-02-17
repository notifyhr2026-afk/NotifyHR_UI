import axiosInstance from "../api/axiosAttendanceInstance";
const leavePolicyService = {
  // ✅ Get all branches by OrganizationID
  getLeavePolicy: async () => {
    try {
      const { data } = await axiosInstance.get(`LeavePolicy`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },
     PostLeavePolicyByAsync: async (payload: any) => {
    const res = await axiosInstance.post("LeavePolicy", payload);
    return res.data[0];
  },
   DeleteLeavePolicyByAsync: async (leavePolicyID:number) => {   
      const { data } = await axiosInstance.delete(`LeavePolicy?leavePolicyID=${leavePolicyID}`);
      return data;   
  },
};
export default leavePolicyService;
