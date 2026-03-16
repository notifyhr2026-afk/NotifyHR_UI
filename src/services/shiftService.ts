import axiosInstance from '../api/axiosAttendanceInstance';

const shiftService = {
  
 GetShiftsByOrganization: async (organizationID: number) => {
    const response = await axiosInstance.get(`Shift?organizationID=${organizationID}`);
    return response.data;
  },
  PostPerformanceReviewCyclesByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Shift", payload);
    return res.data[0];
   },
  DeletePerformanceReviewCyclesByAsync: async (shiftID:number) => {   
      const { data } = await axiosInstance.delete(`Shift?shiftID=${shiftID}`);
      return data;   
  },

  GetActivityMaster: async () => {
    const response = await axiosInstance.get(`Shift/GetActivityMaster`);
    return response.data;
  },
};
export default shiftService;
