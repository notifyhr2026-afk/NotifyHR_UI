import axiosInstance from '../api/axiosPayrollInstance';

const taskService = {
  GetEmployeeTasks: async (organizationId: number, employeeId: number) => {
    const { data } = await axiosInstance.get('Task', {
      params: { organizationId, employeeId },
    });
    return Array.isArray(data?.Table) ? data.Table : Array.isArray(data) ? data : [];
  },
  TaskEntry: async (payload: any) => {
    const { data } = await axiosInstance.post('Task', payload);
    return Array.isArray(data?.Table) ? data.Table : [];
  },
   GetEmployeeDailyTasksByDateRange: async (payload: any) => {
    const { data } = await axiosInstance.post(
      "Task/GetEmployeeDailyTasksByDateRange",
      payload
    );

    console.log("API Response:", data);

    return Array.isArray(data?.Table)
      ? data.Table
      : Array.isArray(data)
      ? data
      : [];
  },

};

export default taskService;
