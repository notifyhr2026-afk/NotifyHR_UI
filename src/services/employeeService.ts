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
  GetEmployeeFiltersDataAsync: async (organizationID : number) => {    
      const { data } = await api.get(`Employee/GetEmployeeFiltersData?organizationID=${organizationID}`);
      return data;
  },
   ImportEmployeesAsync: async (payload: any) => {
    const res = await api.put("Employee/ImportEmployeesAsync", payload);
    return res.data[0];
   }, 

  // ---- Education ----
  SaveEmployeeEducation: async (payload: any) => {
    const { data } = await api.post("Employee/SaveOrUpdateEmployeeEducation", payload);
    return data;
  },
  GetEmployeeEducations: async (employeeID: number) => {
    const { data } = await api.get(`Employee/GetEmployeeEducations?EmployeeID=${employeeID}`);
    return data;
  },

  // ---- Experience ----
  SaveEmployeeExperience: async (payload: any) => {
    const { data } = await api.post("Employee/SaveOrUpdateEmployeeExperience", payload);
    return data;
  },
  GetEmployeeExperiences: async (employeeID: number) => {
    const { data } = await api.get(`Employee/GetEmployeeExperiences?EmployeeID=${employeeID}`);
    return data;
  },

  // ---- Family Details ----
  SaveEmployeeFamilyDetail: async (payload: any) => {
    const { data } = await api.post("Employee/SaveOrUpdateEmployeeFamilyDetails", payload);
    return data;
  },
  GetEmployeeFamilyDetails: async (employeeID: number) => {
    const { data } = await api.get(`Employee/GetEmployeeFamilyDetails?EmployeeID=${employeeID}`);
    return data;
  },

  // ---- Address ----
  SaveEmployeeAddress: async (payload: any) => {
    const { data } = await api.post("Employee/SaveOrUpdateEmployeeAddress", payload);
    return data;
  },
  GetEmployeeAddresses: async (employeeID: number) => {
    const { data } = await api.get(`Employee/GetEmployeeAddress?EmployeeID=${employeeID}`);
    return data;
  },

   DeleteEducationAsync: async (educationID: number, employeeID: number  ) => {
      const { data } = await api.delete(`Employee/DeleteEducationAsync?educationID=${educationID}&employeeID=${employeeID}`);
      return data;
   },
   DeleteExperienceAsync: async (experienceID: number, employeeID: number  ) => {
      const { data } = await api.delete(`Employee/DeleteExperienceAsync?experienceID=${experienceID}&employeeID=${employeeID}`);
      return data;
   },
   DeleteFamilyDetailAsync: async (familyDetailID: number, employeeID: number  ) => {
      const { data } = await api.delete(`Employee/DeleteFamilyDetailAsync?familyDetailID=${familyDetailID}&employeeID=${employeeID}`);
      return data;
   },
   DeleteAddressAsync: async (addressID: number, employeeID: number  ) => {
      const { data } = await api.delete(`Employee/DeleteAddressAsync?addressID=${addressID}&employeeID=${employeeID}`);
      return data;
   },

  // ---- Resignation ----
  ApplyResignation: async (payload: any) => {
    const { data } = await api.post("Employee/ApplyResignation", payload);
    return data;
  },
   GetEmployeeExitDetails: async (employeeID: number) => {
    const { data } = await api.get(`Employee/GetEmployeeExitDetails?EmployeeID=${employeeID}`);
    return data;
  },
  ApproveorRejectResignation: async (payload: any) => {
    const { data } = await api.put("Employee/UpdateResignatioReqStausAsync", payload);
    return data;
  },
 GetResignationRequestsAsync: async (payload: any) => {
  const { data } = await api.post(
    "Employee/GetResignationRequestsAsync",
    payload
  );
  return data;
},
};

export default employeeService;