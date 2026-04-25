import api from "../api/axiosHRInstance";
import { ReportingManagerHistory } from "../types/ReportingManagerHistory";

// Simple in-memory cache for employee details
const employeeCache = new Map<number, any>();

const employeeService = {

  getEmployeesByOrganizationIdAsync: async (organizationID : number) => {    
      const { data } = await api.get(`Employee?organizationID=${organizationID}`);
      return data;
  },
  getEmployees: async () => {
    debugger;
    const { data } = await api.get('Master/employees');
    return data;
  }, 
  GetEmployeeDetialsByEmployeeID: async (EmployeeID: number) => {
    try {
      // Check cache first
      if (employeeCache.has(EmployeeID)) {
        console.log(`Returning cached data for EmployeeID: ${EmployeeID}`);
        return employeeCache.get(EmployeeID);
      }

      console.log(`Fetching data for EmployeeID: ${EmployeeID}`);
      const { data } = await api.get(`Employee/GetEmployeeDetialsByEmployeeID?EmployeeID=${EmployeeID}`);
      
      // Cache the data
      employeeCache.set(EmployeeID, data);
      
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
    
    // Invalidate cache for this employee if it exists
    if (employee.employeeID) {
      employeeCache.delete(employee.employeeID);
    }
    
    return Array.isArray(data?.Table) ? data.Table : [];
  },
   PostUpdateProbationDetails: async (payload: any) => {
    const res = await api.post("Employee/UpdateProbationDetails", payload);
    return res.data[0];
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
  getEmployeeByOrganizationIdAsync: async (organizationID : number) => {    
      const { data } = await api.get(`Employee/GetEmployeesForCreateLogins?organizationID=${organizationID}`);
      return data;
  },
  PutUpdateEmployeeUserIdAsync: async (payload: any) => {
    const res = await api.put("Employee/UpdateEmployeeUserId", payload);
    return res.data[0];
   }, 
    GetReportedEmployeesAsync: async (employeeID : number) => {    
      const { data } = await api.get(`Employee/GetReportedEmployees?employeeID=${employeeID}`);
      return data;
  },

};

export default employeeService;