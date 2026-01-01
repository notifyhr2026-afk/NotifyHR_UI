import axiosAttendanceInstance from "../api/axiosAttendanceInstance";

const holidayService = {
    getOrgDetailsAsync: async (organizationID : number) => {
    try {
      const { data } = await axiosAttendanceInstance.get(`HolidaySettingType`);
      return data;
    } catch (error) {
      console.error('Error fetching HolidaySettingTypes:', error);
      throw error;
    }
  }
};

export default holidayService;
