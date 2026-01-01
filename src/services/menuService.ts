// src/services/menuService.ts

import axiosInstance from '../api/axiosIdentityInstance';
import { MenuItem } from '../types/menuTypes';

const normalizeMenu = (data: any): MenuItem => ({
  menuID: data.MenuID,
  parentMenuID: data.ParentMenuID,
  menuName: data.MenuName,
  menuKey: data.MenuKey,
  menuIcon: data.MenuIcon,
  menuOrder: data.MenuOrder,
  routeUrl: data.RouteUrl,
  isActive: data.IsActive,
  featureID: data.FeatureID ?? null,
  featureName: data.FeatureName ?? null,
});

export const toApiMenu = (menu: MenuItem | Omit<MenuItem, 'menuID'>) => ({
  MenuID: 'menuID' in menu ? menu.menuID : undefined,
  ParentMenuID: menu.parentMenuID === 0 ? null : menu.parentMenuID,
  MenuName: menu.menuName,
  MenuKey: menu.menuKey,
  MenuIcon: menu.menuIcon,
  MenuOrder: menu.menuOrder,
  RouteUrl: menu.routeUrl,
  IsActive: menu.isActive,
  FeatureID: menu.featureID
});



export const getMenus = async (): Promise<MenuItem[]> => {
  try {
    const response = await axiosInstance.get('/menus');
    return response.data.map(normalizeMenu); // map to camelCase
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
};

export const createMenu = async (menuData: Omit<MenuItem, 'menuID'>): Promise<number | null> => {
  try {
    const payload = toApiMenu(menuData);
    const response = await axiosInstance.post('/menus', payload);
    return response.data?.rowsAffected > 0 ? Date.now() : null; // ideally, return actual MenuID
  } catch (error) {
    console.error('Error creating menu:', error);
    return null;
  }
};

export const updateMenu = async (menu: MenuItem): Promise<boolean> => {
  try {
    debugger;
    const payload = toApiMenu(menu);
    const response = await axiosInstance.put('/menus', payload);
    return response.data?.success ?? false;
  } catch (error) {
    console.error('Error updating menu:', error);
    return false;
  }
};

// New signature: include modifiedBy
export const toggleMenuActiveStatus = async (
  menuID: number,
  isActive: boolean
): Promise<boolean> => {
  try {
    const response = await axiosInstance.patch(`/menus/${menuID}/status`, null, {
      params: {
        isActive
      },
    });
    return response.data?.success ?? true;
  } catch (error) {
    console.error('Error toggling menu status:', error);
    return false;
  }
};

export const GetByOrganizationID = async (organizationID: number): Promise<MenuItem[]> => {
  try {
    const response = await axiosInstance.get(`/menus/GetByOrganizationID/${organizationID}`);
    return response.data.map(normalizeMenu); // map to camelCase
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
};


export const GetByUserIDAsync = async (UserID: number): Promise<MenuItem[]> => {
  try {
    const response = await axiosInstance.get(`/menus/GetByUserIDAsync/${UserID}`);
    return response.data.map(normalizeMenu); // map to camelCase
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
};

