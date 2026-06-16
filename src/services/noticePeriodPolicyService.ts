import axiosInstance from "../api/axiosHRInstance";

const noticePeriodPolicyService = {
  // Get policies by organization
  getNoticePeriodPolicies: async (organizationID: number) => {
    const { data } = await axiosInstance.get(
      `NoticePeriodPolicy?organizationID=${organizationID}`
    );
    return data;
  },

  // Create / Update policy
  postNoticePeriodPolicy: async (payload: any) => {
    const res = await axiosInstance.post(
      "NoticePeriodPolicy",
      payload
    );
    return res.data[0];
  },

  // Delete policy
  deleteNoticePeriodPolicy: async (
    noticePeriodPolicyID: number,
    deletedBy: number
  ) => {
    const { data } = await axiosInstance.delete(
      `NoticePeriodPolicy?noticePeriodPolicyID=${noticePeriodPolicyID}&deletedBy=${deletedBy}`
    );
    return data;
  },
};

export default noticePeriodPolicyService;