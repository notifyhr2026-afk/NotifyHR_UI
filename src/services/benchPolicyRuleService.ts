import axiosInstance from "../api/axiosHRInstance";

const benchPolicyRuleService = {
  // Get rules by organization
  getBenchPolicyRules: async (organizationID: number) => {
    const { data } = await axiosInstance.get(
      `BenchPolicyRule?organizationID=${organizationID}`
    );
    return data;
  },

  // Create / Update rule
  postBenchPolicyRule: async (payload: any) => {
    const res = await axiosInstance.post(
      "BenchPolicyRule",
      payload
    );
    return res.data[0];
  },

  // Delete rule
  deleteBenchPolicyRule: async (
    benchPolicyRuleID: number,
    deletedBy: number
  ) => {
    const { data } = await axiosInstance.delete(
      `BenchPolicyRule?benchPolicyRuleID=${benchPolicyRuleID}&deletedBy=${deletedBy}`
    );
    return data;
  },
};

export default benchPolicyRuleService;