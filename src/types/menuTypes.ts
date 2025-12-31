import { NullLiteral } from "typescript";
export interface MenuItem {
  menuID: number; // primitive number
  menuName: string;
  menuKey: string;
  menuIcon: string;
  routeUrl: string;
  isActive: boolean; // boolean, not literal 'true'
  menuOrder: number;
  parentMenuID: number | null;
  featureID: number | null;
  featureName: string | null;
}