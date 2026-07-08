import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, Card } from "react-bootstrap";
import employeeService from "../../services/employeeService";

interface EmployeeData {
  EmployeeName: string;
  EmployeeCode: string;
  DOB: string;
  PersonalPhone: string;
  OfficialEmail: string;
  PersonalEmail: string;
  DateOfJoining: string;
  PAN: string;
  Aadhar: string;
  Gender: string;
  MaritalStatus: string;
  Status: string;
}

const EmployeeData: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID;

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const data = await employeeService.GetEmployeeDataAsync(
        organizationID
      );

      setEmployees(data || []);
    } catch (err) {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header>
          <h4>Employee Details</h4>
        </Card.Header>

        <Card.Body className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                {/* <th>DOB</th> */}
                <th>Phone</th>
                <th>Official Email</th>
                {/* <th>Personal Email</th> */}
                <th>DOJ</th>
                {/* <th>PAN</th>
                <th>Aadhar</th> */}
                <th>Gender</th>
                {/* <th>Marital Status</th> */}
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((emp, index) => (
                  <tr key={index}>
                    <td>{emp.EmployeeName}</td>
                    <td>{emp.EmployeeCode}</td>
                    {/* <td>{emp.DOB?.substring(0, 10)}</td> */}
                    <td>{emp.PersonalPhone}</td>
                    <td>{emp.OfficialEmail}</td>
                    {/* <td>{emp.PersonalEmail}</td> */}
                    <td>{emp.DateOfJoining?.substring(0, 10)}</td>
                    {/* <td>{emp.PAN}</td>
                    <td>{emp.Aadhar}</td> */}
                    <td>{emp.Gender}</td>
                    {/* <td>{emp.MaritalStatus}</td> */}
                    <td>{emp.Status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center">
                    No Employees Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeData;