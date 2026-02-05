import axiosInstance from '../api/axiosIdentityInstance';

export const GetAllFeaturesAsync = async () => {
    debugger;
  const res = await axiosInstance.get("/Menus/GetAllFeatures");
  return res.data;
};

export const GetFeaturesByOrgAsync = async (orgID: number) => {
  const res = await axiosInstance.get(`/Menus/GetAssignedFeatures/${orgID}`);
  return res.data;
};

export const UpdateOrgFeatureAsync = async (payload: any) => {
  const res = await axiosInstance.post("/Menus/AssignFeature", payload);
  return res.data;
};

export const IsDisplayOrgFeatureAsync = async (payload: any) => {
  const res = await axiosInstance.post("/Menus/IsDisplayToEmployeeFeature", payload);
  return res.data;
};