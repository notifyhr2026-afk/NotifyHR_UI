import axiosInstance from '../api/axiosPayrollInstance';

const timesheetService = {
 createTimesheetEntries: async (TimesheetEntries: any) => {
    debugger;
    console.log('Request body:', TimesheetEntries);
    const { data } = await axiosInstance.post('TimesheetEntry/SaveOrUpdateTimesheetEntries', TimesheetEntries);
    return Array.isArray(data?.Table) ? data.Table : [];
  }
};

export default timesheetService;