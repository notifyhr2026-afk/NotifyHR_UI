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


export const PostFeaturesByAsync = async (payload: any) => {
    const res = await axiosInstance.post("/Feature", payload);
    return res.data[0];
};

export const DeleteFeatureAsync = async (featureId: number) => {
      const res = await axiosInstance.delete(`/feature?featureId=${featureId}`);
      return res.data[0].value;
  };

  export const GetFeatureTypesAsync = async () => {
  const res = await axiosInstance.get("/Feature/GetFeatureTypes");
  return res.data;
};
