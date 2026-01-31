import React, { useState, useEffect } from "react";
import { Card, Table, Form, Button, Col, Row } from "react-bootstrap";

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
}

interface PayrollSummary {
  employeeName: string;
  workingDays: number;
  leaveDays: number;
  unpaidLeaveDays: number;
  holidays: number;
  totalHours: number;
}

/* MOCK DATA */
const employees: Employee[] = [
  { id: 1, name: "John Doe", branch: "New York", department: "Sales" },
  { id: 2, name: "Jane Smith", branch: "New York", department: "HR" },
  { id: 3, name: "Alice Brown", branch: "Chicago", department: "Sales" },
];

const timesheetData: TimesheetEntry[] = [
  { employeeId: 1, date: "2026-01-01", activity: "HOLIDAY", hours: 0 },
  { employeeId: 1, date: "2026-01-02", activity: "PRESENT", hours: 8 },
  { employeeId: 1, date: "2026-01-03", activity: "LEAVE", hours: 0 },
  { employeeId: 2, date: "2026-01-01", activity: "HOLIDAY", hours: 0 },
  { employeeId: 2, date: "2026-01-02", activity: "PRESENT", hours: 9 },
  { employeeId: 2, date: "2026-01-03", activity: "UNPAID_LEAVE", hours: 0 },
  { employeeId: 3, date: "2026-01-02", activity: "PRESENT", hours: 7 },
];

const TimesheetPayrollReport: React.FC = () => {
  const [month, setMonth] = useState("2026-01");
  const [branch, setBranch] = useState("All");
  const [department, setDepartment] = useState("All");
  const [report, setReport] = useState<PayrollSummary[]>([]);

  useEffect(() => {
    generateReport();
  }, [month, branch, department]);

  const generateReport = () => {
    const filteredEmployees = employees.filter(
      (emp) =>
        (branch === "All" || emp.branch === branch) &&
        (department === "All" || emp.department === department)
    );

    const summaries: PayrollSummary[] = filteredEmployees.map((emp) => {
      const empEntries = timesheetData.filter(
        (e) => e.employeeId === emp.id && e.date.startsWith(month)
      );

      return empEntries.reduce(
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
          return acc;
        },
        {
          employeeName: emp.name,
          workingDays: 0,
          leaveDays: 0,
          unpaidLeaveDays: 0,
          holidays: 0,
          totalHours: 0,
        } as PayrollSummary
      );
    });

    setReport(summaries);
  };

  const branches = ["All", ...Array.from(new Set(employees.map((e) => e.branch)))];
  const departments = ["All", ...Array.from(new Set(employees.map((e) => e.department)))];

  return (
    <Card className="p-5">
      <h5 className="mb-3">Timesheet Payroll Report</h5>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={branch} onChange={(e) => setBranch(e.target.value)}>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={department} onChange={(e) => setDepartment(e.target.value)}>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button onClick={generateReport}>Generate</Button>
        </Col>
      </Row>

      <Table bordered hover size="sm">
        <thead className="table-light">
          <tr>
            <th>Employee</th>
            <th>Working Days</th>
            <th>Leaves</th>
            <th>Unpaid Leaves</th>
            <th>Holidays</th>
            <th>Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {report.map((r) => (
            <tr key={r.employeeName}>
              <td>{r.employeeName}</td>
              <td>{r.workingDays}</td>
              <td>{r.leaveDays}</td>
              <td>{r.unpaidLeaveDays}</td>
              <td>{r.holidays}</td>
              <td>{r.totalHours}</td>
            </tr>
          ))}
          {report.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
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
