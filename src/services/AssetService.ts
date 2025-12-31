import api from "../api/axiosHRInstance";

const AssetService = {

  getVendors: async (organizationID: number) => {
    const { data } = await api.get(`Vendor?OrganizationID=${organizationID}`);
    return data;
  },
  createVendors: async (vendor: any) => {
    const payload = {
      ...vendor,
      IsActive: true,
      CreatedBy: "SYSTEM" // or logged-in username
    };
    const { data } = await api.post('Vendor', payload);
    return data;
  },
  deleteVendors: async (vendorId: number) => {
    const { data } = await api.delete(`Vendor?VendorId=${vendorId}`);
    return data;
  },

  getAssets: async (organizationID: number) => {
    const { data } = await api.get(`Asset?OrganizationID=${organizationID}`);
    return data;
  },
  createAsset: async (Asset: any) => {
    const payload = {
      ...Asset,
      IsActive: true,
      CreatedBy: "SYSTEM" // or logged-in username
    };
    const { data } = await api.post('Asset', payload);
    return data;
  },
  deleteAsset: async (AssetId: number) => {
    const { data } = await api.delete(`Asset?AssetId=${AssetId}`);
    return data;
  },

  getAssetsTracking: async (organizationID: number) => {
  const { data } = await api.get(`AssetsTracking?OrganizationID=${organizationID}`);
  return data;
},

createAssetsTracking: async (tracking: any) => {
  const payload = {
    ...tracking,
    IsActive: true,
    CreatedBy: 'SYSTEM',
  };
  const { data } = await api.post('AssetsTracking', payload);
  return data;
},

deleteAssetsTracking: async (trackingID: number) => {
  const { data } = await api.delete(`AssetsTracking?TrackingID=${trackingID}`);
  return data;
},

 getAssetAssignment: async (organizationID: number) => {
  const { data } = await api.get(`AssetAssignment?OrganizationID=${organizationID}`);
  return data;
},

createAssetAssignment: async (tracking: any) => {
  const payload = {
    ...tracking,
    IsActive: true,
    CreatedBy: 'SYSTEM',
  };
  const { data } = await api.post('AssetAssignment', payload);
  return data;
},

deleteAssetAssignment: async (AssetAssignmentID: number) => {
  const { data } = await api.delete(`AssetAssignment?AssetAssignmentID=${AssetAssignmentID}`);
  return data;
},

 getAssetCategories: async () => {
  const { data } = await api.get(`Asset/GetAssetCategories`);
  return data;
},
  

};

export default AssetService;
