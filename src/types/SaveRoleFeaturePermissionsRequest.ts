import { RoleMenuPermission } from "./RoleMenuPermission ";

export interface SaveRoleFeaturePermissionsRequest {
  roleID: number;
  featureID: number;
  roleMenus: RoleMenuPermission[];
}