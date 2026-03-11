import axiosInstance from "../api/axiosAttendanceInstance";
const OrgleaveTypesService = {
 getOrgLeaveLeaveTypes: async (organizationID : number) => {    
      const { data } = await axiosInstance.get(`/LeaveType/OrgLeaveTypes?organizationID=${organizationID}`);
      return data;
  },
  postOrgLeaveTypeByAsync: async (payload: any) => {
    const res = await axiosInstance.post("LeaveType/CreateOrUpdateOrgLeaveType", payload);
    return res.data[0];
  },
  deleteOrgLeaveTypeByAsync: async (leaveTypeID:number) => {   
      const { data } = await axiosInstance.delete(`LeaveType?leaveTypeID=${leaveTypeID}`);
      return data;   
  },
};
export default OrgleaveTypesService;
