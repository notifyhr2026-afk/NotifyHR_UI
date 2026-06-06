import axiosInstance from '../api/axiosPayrollInstance';

const taskService = {
 GetEmployeeDailyTasksByDateRange: async (payload: any) => {
    const { data } = await axiosInstance.post('Task/GetEmployeeDailyTasksByDateRange', payload);
    return Array.isArray(data?.Table) ? data.Table : [];
  },
  TaskEntry: async (payload: any) => {
    const { data } = await axiosInstance.post('Task', payload);
    return Array.isArray(data?.Table) ? data.Table : [];
  },
};

export default taskService;