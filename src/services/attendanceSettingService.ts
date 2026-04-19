import api from "../api/axiosAttendanceInstance";

const attendanceSettingService = {

    getAttendanceSettings: async (organizationID: number) => {
    const { data } = await api.get(`AttendanceSettingType?organizationID=${organizationID}`);
    return data;
    },

    PostOrgAttendanceSettingsByAsync: async (payload: any) => {
    const res = await api.post("AttendanceSettingType", payload);
    return res.data[0];
   },

};
export default attendanceSettingService;
