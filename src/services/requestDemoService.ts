import axiosInstance from "../api/axiosHelpdeskInstance";

const requestDemoService = {
  PostRequestDemoAsync: async (payload: any) => {
    const res = await axiosInstance.post("RequestDemo", payload);
    return res.data;
  },
};

export default requestDemoService;