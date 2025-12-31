import axiosInstance from '../api/axiosInstance'; // Import the existing axios instance
import { Organization } from '../types/organization';
import { OrganizationTypes } from '../types/OrganizationTypes';

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
export const getOrganizationTypes = async (): Promise<OrganizationTypes[]> => {
    try {
        const response = await axiosInstance.get<OrganizationTypes[]>('/Organizations/GetAllOrganizationTypes');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch GetAllOrganizationTypes:', error);
        throw error;
    }
};

// Service to create a new organization
export const createOrganization = async (newOrg: Omit<Organization, 'OrganizationID'>): Promise<number> => {
    try {
        const response = await axiosInstance.post<Organization>('/Organizations', newOrg);
        // Assuming the response contains the created organization with its ID
        return response.data.OrganizationID; // Return the new OrganizationID
    } catch (error) {
        console.error('Failed to create organization:', error);
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
      const { data } = await axiosInstance.get(`Organizations/GetBranchesAsync?OrganizationID=${OrganizationID}`);
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
    getOrgRolesAsync,
    getOrgDetailsAsync // Exporting createOrganization for use
};
