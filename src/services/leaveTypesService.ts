import axiosInstance from "../api/axiosAttendanceInstance";
const leaveTypesService = {
  // ✅ Get all branches by OrganizationID
   getLeaveLeaveTypes: async () => {
      const { data } = await axiosInstance.get(`LeaveType`);
      return data;
   },
   PostLeaveTypeByAsync: async (payload: any) => {
    const res = await axiosInstance.post("LeaveType", payload);
    return res.data[0];
  },
   DeleteLeaveTypeByAsync: async (leaveTypeID:number) => {   
      const { data } = await axiosInstance.delete(`LeaveType?leaveTypeID=${leaveTypeID}`);
      return data;   
  },
};
export default leaveTypesService;
