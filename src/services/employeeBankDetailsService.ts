import axiosInstance from "../api/axiosPayrollInstance";

const employeeBankDetailsService = {

  // Get bank details by organization + employee
  getEmployeeBankDetails: async (
    organizationID: number,
    employeeID: number
  ) => {
    const { data } = await axiosInstance.get(
      `EmployeeBankDetails?organizationID=${organizationID}&employeeID=${employeeID}`
    );

    return data;
  },


  // Create / Update bank details
  postEmployeeBankDetails: async (
    payload: any
  ) => {
    const res = await axiosInstance.post(
      "EmployeeBankDetails",
      payload
    );

    return res.data[0];
  },


  // Delete bank details
  deleteEmployeeBankDetails: async (
    employeeBankDetailID: number,
    deletedBy: number
  ) => {
    const { data } = await axiosInstance.delete(
      `EmployeeBankDetails?employeeBankDetailID=${employeeBankDetailID}&deletedBy=${deletedBy}`
    );

    return data;
  },

};

export default employeeBankDetailsService;