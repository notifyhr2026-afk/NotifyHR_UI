import axiosInstance from "../api/axiosAttendanceInstance";

const attendanceDeviceService = {
  // Get devices by organization
  getAttendanceDevicesByOrganization: async (organizationID: number) => {
    const { data } = await axiosInstance.get(
      `AttendanceDevice?organizationID=${organizationID}`
    );
    return data;
  },

  // Create / Update device
  postAttendanceDevice: async (payload: any) => {
    const res = await axiosInstance.post("AttendanceDevice", payload);
    return res.data[0];
  },

  // Delete device
  deleteAttendanceDevice: async (deviceID: number) => {
    const { data } = await axiosInstance.delete(
      `AttendanceDevice?deviceID=${deviceID}`
    );
    return data;
  }, 
};

export default attendanceDeviceService;