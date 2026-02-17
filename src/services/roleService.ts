import axiosInstance from '../api/axiosIdentityInstance';
import { SaveRoleFeaturePermissionsRequest }  from '../types/SaveRoleFeaturePermissionsRequest';

/* ===================== GET ROLES ===================== */
export const GetRolesAsync = async () => {
  const res = await axiosInstance.get("/Roles");
  return res.data;
};

/* ===================== GET ROLES ===================== */
export const GetRolesByorganizationIDAsync = async (organizationID : number) => {
  const res = await axiosInstance.get(`/Roles/RolesByorganizationID?organizationID=${organizationID}`);
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

 export const PostRoleByAsync = async (payload: any) => {
    const res = await axiosInstance.post("/Roles", payload);
    return res.data[0];
};

export const DeleteRoleByAsync= async (roleID:number) => {   
      const { data } = await axiosInstance.delete(`/Roles?roleID=${roleID}`);
      return data;   
  };

 export const  AssignRolesByAsync =  async (AssignRoles: any) => {  
    const { data } = await axiosInstance.post('Roles/AssignOrganizationRoles', AssignRoles);
    return Array.isArray(data?.Table) ? data.Table : [];
  };
