import api from "../api/axiosHRInstance";

const positionService = {

  getPositionsAsync: async (organizationID: number) => {
    const { data } = await api.get(`Position?OrganizationID=${organizationID}`);
    return data;   // this is correct
  },

  createOrUpdatePositionAsync: async (division: any) => {    
    const { data } = await api.post('Position', division);
    return data;   // ✅ FIXED (removed .Table)
  },
 
  deletePositionAsync: async (PositionID: number) => {  
    const { data } = await api.delete(`Position?PositionID=${PositionID}`);
    return data;   // this is correct
  }
};

export default positionService;
