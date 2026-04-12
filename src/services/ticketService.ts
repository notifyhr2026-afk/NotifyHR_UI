import axiosInstance from  '../api/axiosHelpdeskInstance'

const ticketService = {
  
    PostCreateSupportTicketByAsync: async (payload: any) => {
        const res = await axiosInstance.post("HelpDesk/CreateSupportTicket", payload);
        return res.data;
    },
    GetSupportCategoryByOrganization: async (organizationID: number) => {
    const response = await axiosInstance.get(
        `HelpDesk/GetSupportCategoryDepartment?organizationID=${organizationID}`);    
    return response.data;
    },
    GetMyTicketsAsync: async (organizationId: number, employeeID: number) => {
    const response = await axiosInstance.get(`HelpDesk/GetMyTicketsAsync?organizationId=${organizationId}&employeeID=${employeeID}`);
    return response.data;
    },
    PostDepartmentCategoryMappingByAsync: async (payload: any) => {
        const res = await axiosInstance.post("HelpDesk/UpsertCategoryDepartmentMapping", payload);
        return res.data;
    },
    GetUnAssignedTicketsAsync: async (organizationID: number) => {
    const response = await axiosInstance.get(
        `HelpDesk/GetUnAssignedTicketsAsync?organizationID=${organizationID}`);    
    return response.data;
    },
    PostAssignTicketAsync: async (payload: any) => {
        const res = await axiosInstance.post("HelpDesk/AssignTicketAsync", payload);
        return res.data;
    },
    GetAssignedTicketsAsync: async (organizationId: number, employeeID: number) => {
    const response = await axiosInstance.get(`HelpDesk/GetAssignedTickets?organizationId=${organizationId}&employeeUserId=${employeeID}`);
    return response.data;
    },
    UpdateTicketStatusAsync: async (payload: any) => {
        const res = await axiosInstance.post("HelpDesk/UpdateAssignTicket", payload);
        return res.data;
    },
};
export default ticketService;
