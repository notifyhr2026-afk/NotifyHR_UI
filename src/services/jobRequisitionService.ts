import axiosInstance from '../api/axiosRecruitmentInstance';

const jobRequisitionService = {
  
  GetJobRequisitionsByOrganization: async (organizationID: number) => {
    const response = await axiosInstance.get(`JobRequisition?organizationID=${organizationID}`);
    return response.data;
  },
  PostJobRequisitionByAsync: async (payload: any) => {
    const res = await axiosInstance.post("JobRequisition", payload);
    return res.data[0];
   },
  DeleteJobRequisitionByAsync: async (jobRequisitionID:number) => {   
      const { data } = await axiosInstance.delete(`JobRequisition?JobRequisitionID=${jobRequisitionID}`);
      return data;   
  },
  GetGetApprovalGroupsByOrganization: async (organizationID: number) => {
    const response = await axiosInstance.get(`JobRequisition/GetApprovalGroups?organizationID=${organizationID}`);
    return response.data;
  },
  PostSaveApprovalGroupByAsync: async (payload: any) => {
    const res = await axiosInstance.post("JobRequisition/SaveApprovalGroup", payload);
    return res.data[0];
   },
  DeleteApprovalGroupsByAsync: async (groupID:number) => {   
      const { data } = await axiosInstance.delete(`JobRequisition/DeleteApprovalGroup?GroupID=${groupID}`);
      return data;   
  },
  GetApprovalGroupMembersAsync: async (groupID: number, organizationID: number) => {
    const response = await axiosInstance.get(`JobRequisition/GetApprovalGroupMembers?groupID=${groupID}&organizationID=${organizationID}`);
    return response.data;
  },
  PostManageApprovalGroupMemberAsync: async (payload: any) => {
    const res = await axiosInstance.post("JobRequisition/ManageApprovalGroupMember", payload);
    return res.data[0];
  },
  GetMyApprovalsAsync: async (organizationID: number, approverID: number) => {
    const response = await axiosInstance.get(
      `JobRequisition/GetMyApprovals?organizationID=${organizationID}&approverID=${approverID}`
    );
    return response.data;
  },
  PostManageJobApprovalAsync: async (payload: any) => {
  const res = await axiosInstance.post(
    "JobRequisition/ManageJobApproval",
    payload
  );
  return res.data[0];
},
GetJobForAssignmentByOrganizationAsync: async (organizationID: number) => {
  const response = await axiosInstance.get(
    `JobRequisition/GetJobForAssignmentByOrganizationAsync?OrganizationID=${organizationID}`
  );
  return response.data;
},

PostManageJobRequisitionRecruiterAsync: async (payload: any) => {
  const res = await axiosInstance.post(
    "JobRequisition/ManageJobRequisitionRecruiterAsync",
    payload
  );
  return res.data[0]; // Use res.data if your API returns an object instead of an array
},
GetRecruiterAssignedJobsAsync: async (recruiterUserID: number) => {
  const response = await axiosInstance.get(
    `JobRequisition/GetRecruiterAssignedJobsAsync?recruiterUserID=${recruiterUserID}`
  );
  return response.data;
},
PostManageRecruiterActionAsync: async (payload: any) => {
  const res = await axiosInstance.put(
    "JobRequisition/ManageRecruiterActionAsync",
    payload
  );
  return res.data[0]; // Change to res.data if API returns an object
},

};
export default jobRequisitionService;
