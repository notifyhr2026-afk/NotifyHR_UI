import axiosInstance from '../api/axiosHRInstance';

const performanceService = {
    
  getPerformanceTemplatesByOrganizationIDAsync: async (organizationID:number) => {   
      const { data } = await axiosInstance.get(`Performance/templates?organizationID=${organizationID}`);
      return data;   
  },
   PostPerformanceTemplatesByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Performance/templates", payload);
    return res.data[0];
   },
   DeletePerformanceTemplatesByAsync: async (templateID:number) => {   
      const { data } = await axiosInstance.delete(`Performance/Templates?templateID=${templateID}`);
      return data;   
  },

  getPerformanceCriteriaByOrganizationIDAsync: async (organizationID:number) => {   
      const { data } = await axiosInstance.get(`Performance/Criteria?organizationID=${organizationID}`);
      return data;   
  },
   PostPerformanceCriteriaByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Performance/Criteria", payload);
    return res.data[0];
   },
   DeletePerformanceCriteriaByAsync: async (criteriaID:number) => {   
      const { data } = await axiosInstance.delete(`Performance/Criteria?criteriaID=${criteriaID}`);
      return data;   
  },

  getPerformanceReviewCyclesByOrganizationIDAsync: async (organizationID:number) => {   
      const { data } = await axiosInstance.get(`Performance/ReviewCycles?organizationID=${organizationID}`);
      return data;   
  },
  PostPerformanceReviewCyclesByAsync: async (payload: any) => {
    const res = await axiosInstance.post("Performance/ReviewCycles", payload);
    return res.data[0];
   },
  DeletePerformanceReviewCyclesByAsync: async (reviewCycleID:number) => {   
      const { data } = await axiosInstance.delete(`Performance/ReviewCycles?reviewCycleID=${reviewCycleID}`);
      return data;   
  },

};

export default performanceService;