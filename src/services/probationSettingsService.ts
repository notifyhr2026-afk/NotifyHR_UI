import api from "../api/axiosHRInstance";

const probationSettingsService = {

  // =========================
  // GET
  // =========================
  getProbationSettingsAsync: async (organizationID: number) => {
    const { data } = await api.get(
      `ProbationSettings?OrganizationID=${organizationID}`
    );
    return data;
  },

  // =========================
  // CREATE / UPDATE
  // =========================
  createOrUpdateProbationSettingAsync: async (model: any) => {
    const { data } = await api.post("ProbationSettings", model);
    return data;
  },

  // =========================
  // DELETE
  // =========================
  deleteProbationSettingAsync: async (
    settingID: number,
    updatedBy: string
  ) => {
    const { data } = await api.delete(
      `ProbationSettings?SettingID=${settingID}&UpdatedBy=${updatedBy}`
    );
    return data;
  },
};

export default probationSettingsService;
