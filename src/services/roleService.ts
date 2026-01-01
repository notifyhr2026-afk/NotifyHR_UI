import axiosInstance from '../api/axiosIdentityInstance';
import { SaveRoleFeaturePermissionsRequest }  from '../types/SaveRoleFeaturePermissionsRequest';

/* ===================== GET ROLES ===================== */
export const GetRolesAsync = async () => {
  const res = await axiosInstance.get("/Roles");
  return res.data;
};

/* ===================== SAVE FEATURE PERMISSIONS ===================== */
export const SaveFeaturePermissionsAsync = async (payload: SaveRoleFeaturePermissionsRequest) => {
  const res = await axiosInstance.post("/Roles/save-feature-permissions", payload);
  return res.data;
};

/* ===================== GET ROLES ===================== */
export const GetRoleMenusAsync = async (roleID: number) => {
  const res = await axiosInstance.get(`/Roles/RoleMenus?RoleID=${roleID}`);
  return res.data;
};

