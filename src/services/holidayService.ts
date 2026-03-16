import axiosAttendanceInstance from "../api/axiosAttendanceInstance";
import {HolidayRequest} from "../types/HolidayRequest"

const holidayService = {
    getOrgDetailsAsync: async (organizationID : number) => {
    try {
      const { data } = await axiosAttendanceInstance.get(`HolidaySettingType`);
      return data;
    } catch (error) {
      console.error('Error fetching HolidaySettingTypes:', error);
      throw error;
    }
  },

GetHolidaysAsync: async (organizationID: number) => {
  try {
    const res = await axiosAttendanceInstance.get(
      `/Holiday`,
      {
        params: { OrganizationID: organizationID }
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw error;
  }
},

  saveHolidayAsync: async (payload: HolidayRequest) => {
    try {
      const { data } = await axiosAttendanceInstance.post(
        "Holiday", // ✅ fix endpoint
        payload // ✅ send payload, not type
      );

      return Array.isArray(data?.Table) ? data.Table : [];
    } catch (error) {
      console.error("Error saving Holiday:", error);
      throw error;
    }},
    getOrgHolidaySettingAsync: async (organizationID : number) => {
    try {
      const { data } = await axiosAttendanceInstance.get(`OrgHolidaySetting?OrganizationID=${organizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching OrgHolidaySetting:', error);
      throw error;
    }
  },
   saveOrgHolidaySettingAsync: async (payload: any) => {
    const res = await axiosAttendanceInstance.post("OrgHolidaySetting", payload);
    return res.data[0];
  }, 
  getOrgholidays: async (organizationID : number) => {    
      const { data } = await axiosAttendanceInstance.get(`/Holiday?organizationID=${organizationID}`);
      return data;
  },
};

export default holidayService;
