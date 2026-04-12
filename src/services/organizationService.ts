import axiosInstance from '../api/axiosIdentityInstance'; // Import the existing axios instance
import { Organization } from '../types/organization';
import { organizationTypes } from '../types/organizationTypes';

// Service to get all organizations
export const getOrganizations = async (): Promise<Organization[]> => {
    try {
        const response = await axiosInstance.get<Organization[]>('/Organizations');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch organizations:', error);
        throw error;
    }
};

// Service to get all organization types
export const getOrganizationTypes = async (): Promise<organizationTypes[]> => {
    try {
        const response = await axiosInstance.get<organizationTypes[]>('/Organizations/GetAllOrganizationTypes');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch GetAllOrganizationTypes:', error);
        throw error;
    }
};

// Service to create a new organization
export const createOrganization = async (
  newOrg: Omit<Organization, 'OrganizationID'>
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/Organizations', newOrg);
    return response.data; // return full response
  } catch (error) {
    console.error('Failed to create organization:', error);
    throw error;
  }
};

 export const PutActivateLoginsAsync = async (payload: any) => {
    const res = await axiosInstance.put("Organizations/ActivateLogins", payload);
    return res.data[0];
};


// Service to update a new organization
export const updateOrganization = async (newOrg: Omit<Organization, 'OrganizationID'>): Promise<number> => {
    try {
        const response = await axiosInstance.put<Organization>('/Organizations', newOrg);
        // Assuming the response contains the created organization with its ID
        return response.data.OrganizationID; // Return the new OrganizationID
    } catch (error) {
        console.error('Failed to Update organization:', error);
        throw error;
    }
};

  // ✅ Create or update a division
  export const CreateOrgRolesAsync =  async (OrgRole : any) => {
    try {
        debugger;
      console.log('Request body:', OrgRole);
      const { data } = await axiosInstance.post('/Organizations/CreateOrgRolesAsync', OrgRole);
      return Array.isArray(data?.Table) ? data.Table : [];
    } catch (error) {
      console.error('Error creating or updating division:', error);
      throw error;
    }
  };

export const  getOrgRolesAsync = async (OrganizationID : number) => {
    try {
      const { data } = await axiosInstance.get(`Organizations/GetOrgRolesAsync?id=${OrganizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  };

export const  GetOrgPositionsAsync = async (OrganizationID : number) => {
    try {
      const { data } = await axiosInstance.get(`Organizations/GetOrgPositionsAsync?id=${OrganizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  };

export const  getOrgDetailsAsync = async (OrganizationID : number) => {
    try {
      const { data } = await axiosInstance.get(`Organizations/OrganizationDetails/${OrganizationID}`);
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  };

// Exporting the functions for use in components
export default {
    getOrganizations,
    getOrganizationTypes,
    createOrganization,
    CreateOrgRolesAsync,
    updateOrganization,
    getOrgRolesAsync,
    getOrgDetailsAsync,
    GetOrgPositionsAsync,
    PutActivateLoginsAsync
};
