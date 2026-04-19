import api from "../api/axiosHelpdeskInstance";
const auditLogsService = {
   
   PostGenerateLoginsAsync: async (payload: any) => {
    const res = await api.post("AuditLog", payload);
    return res.data;
   },

};
export default auditLogsService;