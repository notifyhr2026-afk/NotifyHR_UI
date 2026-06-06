import React, { useEffect, useState } from "react";
import { Card, Table, Form, Button, Col, Row, Badge, Spinner } from "react-bootstrap";
import timesheetService from "../../services/timesheetService";
import employeeService from "../../services/employeeService";
import branchService from "../../services/branchService";
import departmentService from "../../services/departmentService";

interface Option {
  value: number;
  label: string;
}

interface EmployeeData {
  EmployeeID?: number;
  EmployeeName?: string;
  FirstName?: string;
  LastName?: string;
  BranchID?: number;
  DepartmentID?: number;
  id?: number;
  name?: string;
}

interface PayrollSummary {
  employeeId: number;
  employeeName: string;
  workingDays: number;
  leaveDays: number;
  unpaidLeaveDays: number;
  holidays: number;
  totalHours: number;
  status: string;
}

const TimesheetPayrollReport: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  const [month, setMonth] = useState("2026-01");
  const [branch, setBranch] = useState<number | "All">("All");
  const [department, setDepartment] = useState<number | "All">("All");
  const [employee, setEmployee] = useState<number | "All">("All");
  const [branches, setBranches] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);
  const [report, setReport] = useState<PayrollSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateEmployeeOptions();
  }, [branch, department, employees]);

  useEffect(() => {
    if (employees.length > 0) {
      generateReport();
    }
  }, [month, branch, department, employee, employees]);

  const loadData = async () => {
    try {
      const [empRes, branchRes, deptRes] = await Promise.all([
        employeeService.getEmployeesByOrganizationIdAsync(organizationID),
        branchService.getBranchesAsync(organizationID),
        departmentService.getdepartmentesAsync(organizationID),
      ]);

      const employeeList = empRes?.Table || empRes || [];
      const branchList = branchRes?.Table || branchRes || [];
      const departmentList = deptRes?.Table || deptRes || [];

      setEmployees(employeeList);
      setBranches(
        branchList.map((b: any) => ({
          value: b.BranchID,
          label: b.BranchName,
        }))
      );
      setDepartments(
        departmentList.map((d: any) => ({
          value: d.DepartmentID,
          label: d.DepartmentName,
        }))
      );
    } catch (error) {
      console.error("Failed to load filter data", error);
    }
  };

  const updateEmployeeOptions = () => {
    const filtered = employees.filter((emp) => {
      const branchMatch = branch === "All" || emp.BranchID === branch;
      const departmentMatch = department === "All" || emp.DepartmentID === department;
      return branchMatch && departmentMatch;
    });

    setEmployeeOptions(
      filtered.map((emp) => ({
        value: emp.EmployeeID || emp.id || 0,
        label:
          emp.EmployeeName ||
          `${emp.FirstName || ""} ${emp.LastName || ""}`.trim() ||
          emp.name ||
          "Unknown",
      }))
    );

    if (
      employee !== "All" &&
      !filtered.some((emp) => (emp.EmployeeID || emp.id) === employee)
    ) {
      setEmployee("All");
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);

      const filteredEmployees = employees.filter((emp) => {
        const branchMatch = branch === "All" || emp.BranchID === branch;
        const departmentMatch = department === "All" || emp.DepartmentID === department;
        const employeeMatch = employee === "All" || (emp.EmployeeID || emp.id) === employee;
        return branchMatch && departmentMatch && employeeMatch;
      });

      if (filteredEmployees.length === 0) {
        setReport([]);
        return;
      }

      const monthNumber = Number(month.split("-")[1] || 0);

      const summaries = await Promise.all(
        filteredEmployees.map(async (emp) => {
          const employeeID = emp.EmployeeID || emp.id || 0;
          if (!employeeID) {
            return null;
          }

          const data = await timesheetService.GetTimesheetSummaryReport(
            employeeID,
            monthNumber
          );

          const row = data?.Table?.[0] || data?.[0] || data || {};

          return {
            employeeId: employeeID,
            employeeName:
              emp.EmployeeName ||
              `${emp.FirstName || ""} ${emp.LastName || ""}`.trim() ||
              emp.name ||
              `Employee ${employeeID}`,
            workingDays: Number(row.WorkingDays ?? row.WorkingDayCount ?? 0),
            leaveDays: Number(row.LeaveDays ?? row.Leaves ?? 0),
            unpaidLeaveDays: Number(row.UnpaidLeaveDays ?? row.UnpaidLeaves ?? 0),
            holidays: Number(row.Holidays ?? 0),
            totalHours: Number(row.TotalHours ?? row.Hours ?? 0),
            status: row.StatusName || row.Status || "APPROVED",
          } as PayrollSummary;
        })
      );

      setReport(summaries.filter(Boolean) as PayrollSummary[]);
    } catch (error) {
      console.error("Error fetching timesheet summary report", error);
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm border-0 rounded-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Timesheet Payroll Report</h4>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Month</Form.Label>
            <Form.Control
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Branch</Form.Label>
            <Form.Select
              value={branch}
              onChange={(e) => {
                const selected = e.target.value;
                setBranch(selected === "All" ? "All" : Number(selected));
                setEmployee("All");
              }}
            >
              <option value="All">All Branches</option>
              {branches.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Select
              value={department}
              onChange={(e) => {
                const selected = e.target.value;
                setDepartment(selected === "All" ? "All" : Number(selected));
                setEmployee("All");
              }}
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Employee</Form.Label>
            <Form.Select
              value={employee}
              onChange={(e) => {
                const selected = e.target.value;
                setEmployee(selected === "All" ? "All" : Number(selected));
              }}
            >
              <option value="All">All Employees</option>
              {employeeOptions.map((emp) => (
                <option key={emp.value} value={emp.value}>
                  {emp.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="mb-3">
        <Button variant="primary" onClick={generateReport} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Loading...
            </>
          ) : (
            "Generate Report"
          )}
        </Button>
      </div>

      <Table
        responsive
        bordered
        hover
        className="align-middle text-center"
      >
        <thead className="table-light">
          <tr>
            <th>Employee</th>
            <th>Working Days</th>
            <th>Leaves</th>
            <th>Unpaid Leaves</th>
            <th>Holidays</th>
            <th>Total Hours</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {report.length > 0 ? (
            report.map((r) => (
              <tr key={r.employeeId}>
                <td>{r.employeeName}</td>
                <td>{r.workingDays}</td>
                <td>{r.leaveDays}</td>
                <td>{r.unpaidLeaveDays}</td>
                <td>{r.holidays}</td>
                <td>{r.totalHours}</td>
                <td>
                  <Badge
                    bg={r.status === "APPROVED" ? "success" : "warning"}
                  >
                    {r.status}
                  </Badge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
};

export default TimesheetPayrollReport;
