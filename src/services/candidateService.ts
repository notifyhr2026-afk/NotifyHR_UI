import axiosInstance from "../api/axiosRecruitmentInstance";

const candidateService = {


  // ================= GET CANDIDATES =================

  GetCandidatesByOrganizationAsync: async (
    organizationID: number,
    recruitmentID: number
  ) => {
    const response =
      await axiosInstance.get(
        `Candidate?organizationID=${organizationID}&recruitmentID=${recruitmentID}`
      );
    return response.data;
  },

  // ================= GET CANDIDATE BY ID =================

  GetCandidateByIDAsync: async (
    organizationID: number,
    candidateID: number
  ) => {
    const response =
      await axiosInstance.get(
        `Candidate/GetCandidatesByCandidateIDAsync?organizationID=${organizationID}&candidateID=${candidateID}`
      );
    return response.data;
  },

  // ================= ADD CANDIDATE =================

  PostCandidateAsync: async (
    payload:any
  ) => {

    const response =
      await axiosInstance.post(
        "Candidate",
        payload
      );
    return response.data[0] ?? response.data;
  },

  // ================= UPDATE CANDIDATE =================

  PutCandidateAsync: async (
    payload:any
  ) => {
    const response =
      await axiosInstance.put(
        "Candidate",
        payload
      );
    return response.data[0] ?? response.data;
  },

   GetCandidateApplicationsAsync: async (
    organizationID: number,
    candidateID: number
  ) => {
    const response = await axiosInstance.get(
      `Candidate/GetCandidateApplicationsAsync?organizationID=${organizationID}&candidateID=${candidateID}`
    );
    return response.data;
  },

  SaveCandidateApplicationAsync: async (payload: any) => {
    const response = await axiosInstance.post(
      "Candidate/SaveCandidateApplication",
      payload
    );
    return response.data;
  },
  GetCandidateInterviewsAsync: async (
    organizationID: number,
    candidateID: number,
    applicationID: number
  ) => {
    const response = await axiosInstance.get(
      `Candidate/GetCandidateInterviewsAsync?organizationID=${organizationID}&candidateID=${candidateID}&applicationID=${applicationID}`
    );
    return response.data;
  },

  SaveCandidateInterviewAsync: async (payload: any) => {
    const response = await axiosInstance.post(
      "Candidate/SaveCandidateInterview",
      payload
    );
    return response.data;
  },
  GetCandidateOffersAsync: async (
    organizationID: number,
    candidateID: number,
    applicationID: number
  ) => {
    const response = await axiosInstance.get(
      `Candidate/GetCandidateOffersAsync?organizationID=${organizationID}&candidateID=${candidateID}&applicationID=${applicationID}`
    );
    return response.data;
  },

  SaveCandidateOfferAsync: async (payload: any) => {
    const response = await axiosInstance.post(
      "Candidate/SaveCandidateOffer",
      payload
    );
    return response.data;
  }, 

};


export default candidateService;