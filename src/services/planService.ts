import axiosInstance from '../api/axiosIdentityInstance';

const planService = {    
   GePlansAsync: async () => {
      const { data } = await axiosInstance.get(`plan`);
      return data;    
  },  
   PostplanByAsync: async (payload: any) => {
    const res = await axiosInstance.post("plan", payload);
    return res.data[0];
  },
   DeleteplanByAsync: async (planID:number) => {   
      const { data } = await axiosInstance.delete(`plan?planID=${planID}`);
      return data;   
  },
};

export default planService;