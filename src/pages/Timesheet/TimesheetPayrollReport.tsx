import React, { useState, useEffect } from "react";
import { Card, Table, Form, Button, Col, Row, Badge } from "react-bootstrap";

interface Employee {
  id: number;
  name: string;
  branch: string;
  department: string;
}

interface TimesheetEntry {
  employeeId: number;
  date: string;
  activity: "PRESENT" | "LEAVE" | "HOLIDAY" | "UNPAID_LEAVE";
  hours: number;
  status: "PENDING" | "APPROVED";
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

/* MOCK EMPLOYEE DATA */
const employees: Employee[] = [
  { id: 1, name: "John Doe", branch: "New York", department: "Sales" },
  { id: 2, name: "Jane Smith", branch: "New York", department: "HR" },
  { id: 3, name: "Alice Brown", branch: "Chicago", department: "Sales" },
];

/* MOCK TIMESHEET DATA */
const timesheetData: TimesheetEntry[] = [
  {
    employeeId: 1,
    date: "2026-01-01",
    activity: "HOLIDAY",
    hours: 0,
    status: "APPROVED",
  },
  {
    employeeId: 1,
    date: "2026-01-02",
    activity: "PRESENT",
    hours: 8,
    status: "APPROVED",
  },
  {
    employeeId: 1,
    date: "2026-01-03",
    activity: "LEAVE",
    hours: 0,
    status: "PENDING",
  },
  {
    employeeId: 2,
    date: "2026-01-01",
    activity: "HOLIDAY",
    hours: 0,
    status: "APPROVED",
  },
  {
    employeeId: 2,
    date: "2026-01-02",
    activity: "PRESENT",
    hours: 9,
    status: "APPROVED",
  },
  {
    employeeId: 2,
    date: "2026-01-03",
    activity: "UNPAID_LEAVE",
    hours: 0,
    status: "PENDING",
  },
  {
    employeeId: 3,
    date: "2026-01-02",
    activity: "PRESENT",
    hours: 7,
    status: "APPROVED",
  },
];

const TimesheetPayrollReport: React.FC = () => {
  const [month, setMonth] = useState("2026-01");
  const [branch, setBranch] = useState("All");
  const [department, setDepartment] = useState("All");
  const [employee, setEmployee] = useState("All");
  const [report, setReport] = useState<PayrollSummary[]>([]);

  useEffect(() => {
    generateReport();
  }, [month, branch, department, employee]);

  const generateReport = () => {
    /* FILTER EMPLOYEES */
    const filteredEmployees = employees.filter(
      (emp) =>
        (branch === "All" || emp.branch === branch) &&
        (department === "All" || emp.department === department) &&
        (employee === "All" || emp.id === Number(employee))
    );

    /* FETCH TIMESHEET DATA BASED ON SELECTED EMPLOYEE */
    const summaries: PayrollSummary[] = filteredEmployees.map((emp) => {
      const empEntries = timesheetData.filter(
        (e) => e.employeeId === emp.id && e.date.startsWith(month)
      );

      const summary = empEntries.reduce(
        (acc, entry) => {
          switch (entry.activity) {
            case "PRESENT":
              acc.workingDays += 1;
              acc.totalHours += entry.hours;
              break;

            case "LEAVE":
              acc.leaveDays += 1;
              break;

            case "UNPAID_LEAVE":
              acc.unpaidLeaveDays += 1;
              break;

            case "HOLIDAY":
              acc.holidays += 1;
              break;
          }

          /* STATUS LOGIC */
          if (entry.status === "PENDING") {
            acc.status = "PENDING";
          }

          return acc;
        },
        {
          employeeId: emp.id,
          employeeName: emp.name,
          workingDays: 0,
          leaveDays: 0,
          unpaidLeaveDays: 0,
          holidays: 0,
          totalHours: 0,
          status: "APPROVED",
        } as PayrollSummary
      );

      return summary;
    });

    setReport(summaries);
  };

  /* DROPDOWNS */
  const branches = [
    "All",
    ...Array.from(new Set(employees.map((e) => e.branch))),
  ];

  const departments = [
    "All",
    ...Array.from(new Set(employees.map((e) => e.department))),
  ];

  const filteredEmployeeList = employees.filter(
    (emp) =>
      (branch === "All" || emp.branch === branch) &&
      (department === "All" || emp.department === department)
  );

  return (
    <Card className="p-4 shadow-sm border-0 rounded-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Timesheet Payroll Report</h4>
      </div>

      {/* FILTERS */}
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
                setBranch(e.target.value);
                setEmployee("All");
              }}
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
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
                setDepartment(e.target.value);
                setEmployee("All");
              }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
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
              onChange={(e) => setEmployee(e.target.value)}
            >
              <option value="All">All Employees</option>

              {filteredEmployeeList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* ACTION BUTTON */}
      <div className="mb-3">
        <Button variant="primary" onClick={generateReport}>
          Generate Report
        </Button>
      </div>

      {/* REPORT TABLE */}
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
