import React, { useState } from "react";
import Select from "react-select";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Alert,
  Form,
  Button,
} from "react-bootstrap";

// -------------------- Types --------------------
type Option = {
  value: number;
  label: string;
};

type Employee = {
  id: number;
  name: string;
  branchId: number;
  departmentId: number;
};

type Leave = {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Approved" | "Rejected" | "Pending";
};

// -------------------- Static Filters --------------------
const branches: Option[] = [
  { value: 1, label: "Hyderabad" },
  { value: 2, label: "Bangalore" },
];

const departments: Option[] = [
  { value: 1, label: "Engineering" },
  { value: 2, label: "HR" },
  { value: 3, label: "Finance" },
];

// -------------------- Static Employees --------------------
const employees: Employee[] = [
  { id: 1, name: "Arjun Reddy", branchId: 1, departmentId: 1 },
  { id: 2, name: "Priya Sharma", branchId: 1, departmentId: 2 },
  { id: 3, name: "Vikram Rao", branchId: 2, departmentId: 1 },
  { id: 4, name: "Sneha Iyer", branchId: 2, departmentId: 3 },
];

// -------------------- Static Leaves --------------------
const allLeaves: Leave[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "Arjun Reddy",
    leaveType: "Casual Leave",
    startDate: "2026-04-01",
    endDate: "2026-04-02",
    days: 2,
    reason: "Family function",
    status: "Approved",
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Priya Sharma",
    leaveType: "Sick Leave",
    startDate: "2026-04-05",
    endDate: "2026-04-06",
    days: 2,
    reason: "Fever",
    status: "Pending",
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: "Vikram Rao",
    leaveType: "Earned Leave",
    startDate: "2026-04-08",
    endDate: "2026-04-10",
    days: 3,
    reason: "Vacation",
    status: "Rejected",
  },
];

// -------------------- Component --------------------
const LeavesReportPage: React.FC = () => {
  const [branch, setBranch] = useState<Option | null>(null);
  const [department, setDepartment] = useState<Option | null>(null);
  const [employee, setEmployee] = useState<Option | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [searched, setSearched] = useState(false);

  // -------------------- Build Employees Dropdown --------------------
  React.useEffect(() => {
    let filtered = [...employees];

    if (branch) {
      filtered = filtered.filter((e) => e.branchId === branch.value);
    }

    if (department) {
      filtered = filtered.filter(
        (e) => e.departmentId === department.value
      );
    }

    setEmployeeOptions(
      filtered.map((e) => ({
        value: e.id,
        label: e.name,
      }))
    );

    setEmployee(null);
  }, [branch, department]);

  // -------------------- Fetch (on button click) --------------------
  const handleFetch = () => {
    let data = [...allLeaves];

    // filter by branch
    if (branch) {
      const empIds = employees
        .filter((e) => e.branchId === branch.value)
        .map((e) => e.id);

      data = data.filter((l) => empIds.includes(l.employeeId));
    }

    // filter by department
    if (department) {
      const empIds = employees
        .filter((e) => e.departmentId === department.value)
        .map((e) => e.id);

      data = data.filter((l) => empIds.includes(l.employeeId));
    }

    // filter by employee
    if (employee) {
      data = data.filter((l) => l.employeeId === employee.value);
    }

    // filter by date range
    if (fromDate) {
      data = data.filter((l) => l.startDate >= fromDate);
    }

    if (toDate) {
      data = data.filter((l) => l.endDate <= toDate);
    }

    setFilteredLeaves(data);
    setSearched(true);
  };

  // -------------------- Helpers --------------------
  const getBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "danger";
      default:
        return "warning";
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h4 className="mb-3">Leaves Report</h4>

          {/* Filters */}
          <Row className="g-3">
            <Col md={3}>
              <Form.Label>Branch</Form.Label>
              <Select
                options={branches}
                value={branch}
                onChange={(val) => {
                  setBranch(val);
                  setDepartment(null);
                  setEmployee(null);
                }}
                placeholder="Branch"
                isClearable
              />
            </Col>

            <Col md={3}>
              <Form.Label>Department</Form.Label>
              <Select
                options={departments}
                value={department}
                onChange={(val) => {
                  setDepartment(val);
                  setEmployee(null);
                }}
                placeholder="Department"
                isClearable
                isDisabled={!branch}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Employee</Form.Label>
              <Select
                options={employeeOptions}
                value={employee}
                onChange={(val) => setEmployee(val)}
                placeholder="Employee"
                isDisabled={!branch && !department}
                isClearable
              />
            </Col>

            <Col md={3}>
              <Form.Label>Action</Form.Label>
              <Button
                className="w-100"
                variant="primary"
                onClick={handleFetch}
              >
                Fetch Report
              </Button>
            </Col>
          </Row>

          {/* Dates */}
          <Row className="g-3 mt-1">
            <Col md={6}>
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Col>

            <Col md={6}>
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Col>
          </Row>

          {/* Default message */}
          {!searched && (
            <Alert variant="secondary" className="mt-4 text-center">
              Select filters and click <b>Fetch Report</b> to view data
            </Alert>
          )}

          {/* No results */}
          {searched && filteredLeaves.length === 0 && (
            <Alert variant="info" className="mt-4">
              No leaves found for selected filters.
            </Alert>
          )}

          {/* Table */}
          {searched && filteredLeaves.length > 0 && (
            <div className="table-responsive mt-4">
              <Table bordered hover striped>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeaves.map((l) => (
                    <tr key={l.id}>
                      <td>
                        {
                          employees.find((e) => e.id === l.employeeId)
                            ?.name
                        }
                      </td>
                      <td>{l.leaveType}</td>
                      <td>
                        {l.startDate} → {l.endDate}
                      </td>
                      <td>{l.days}</td>
                      <td>{l.reason}</td>
                      <td>
                        <Badge bg={getBadge(l.status)}>
                          {l.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default LeavesReportPage;