import axiosInstance from '../api/axiosAttendanceInstance';

const shiftService = {
 GetShiftsByOrganization: async (organizationID: number) => {
    const response = await axiosInstance.get(`Shift/GetShiftsByOrganization?organizationID=${organizationID}`);
    return response.data;
  },
  GetActivityMaster: async () => {
    const response = await axiosInstance.get(`Shift/GetActivityMaster`);
    return response.data;
  },
};
export default shiftService;
