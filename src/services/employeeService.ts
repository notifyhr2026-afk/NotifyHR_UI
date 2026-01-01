import api from "../api/axiosHRInstance";

const employeeService = {
  getEmployees: async () => {
    debugger;
    const { data } = await api.get('Master/employees');
    return data;
  }, 
  GetEmployeeDetialsByEmployeeID: async (EmployeeID: number) => {
    try {
      console.log();
      const { data } = await api.get(`Employee/GetEmployeeDetialsByEmployeeID?EmployeeID=${EmployeeID}`);
      return data;
    } catch (error) {
      console.error('Error fetching employee details:', error);
      throw error;
    }
  },
  createEmployee: async (employee: any) => {
    debugger;
    console.log('Request body:', employee);
    const { data } = await api.post('Employee/CreateEmployee', employee);
    return data[0]?.EmployeeID || null;
  },
  getDepartments: async () => {
    const { data } = await api.get('Master/departments');
    return data;
  },
  getDivisions: async () => {
    const { data } = await api.get('Master/divisions');
    return data;
  },
  getBranches: async () => {
    const { data } = await api.get('Master/branches');
    return data;
  },
  getManagers: async () => {
    const { data } = await api.get('Master/employees');
    return data;
  },
  getPositions: async () => {
    const { data } = await api.get('Master/positions');
    return data;
  },
   getEmploymentTypes: async () => {
    const { data } = await api.get('Master/employmentTypes');
    return data;
  },
  getPositionChangeStatus: async () => {
    const { data } = await api.get('Master/positionChangeStatus');
    return data;
  },
};

export default employeeService;