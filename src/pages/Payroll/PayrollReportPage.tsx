import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Badge,
  Button,
} from "react-bootstrap";
import Select from "react-select";
import { Eye, Download } from "react-bootstrap-icons";

const PayrollReportPage: React.FC = () => {
  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(2026);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [branch, setBranch] = useState<any>(null);
  const [department, setDepartment] = useState<any>(null);
  const [division, setDivision] = useState<any>(null);

  // 🔹 Dropdown Options
  const branchOptions = [
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Bangalore", label: "Bangalore" },
  ];

  const departmentOptions = [
    { value: "IT", label: "IT" },
    { value: "HR", label: "HR" },
    { value: "Finance", label: "Finance" },
  ];

  const divisionOptions = [
    { value: "Product", label: "Product" },
    { value: "Services", label: "Services" },
  ];

  // 🔹 Static Payroll Data
  const payrollData = [
    { id: 1024, name: "John Doe", dept: "IT", branch: "Hyderabad", division: "Product", gross: 20000, deduction: 3000, net: 17000, status: "Processed" },
    { id: 1025, name: "Jane Smith", dept: "HR", branch: "Bangalore", division: "Services", gross: 25000, deduction: 4000, net: 21000, status: "Locked" },
    { id: 1026, name: "Ravi Kumar", dept: "Finance", branch: "Hyderabad", division: "Services", gross: 22000, deduction: 2500, net: 19500, status: "Processed" },
  ];

  // 🔹 Filtering Logic
  const filteredData = useMemo(() => {
    return payrollData.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toString().includes(search);

      const matchStatus =
        status === "All" || emp.status === status;

      const matchBranch =
        !branch || emp.branch === branch.value;

      const matchDepartment =
        !department || emp.dept === department.value;

      const matchDivision =
        !division || emp.division === division.value;

      return (
        matchSearch &&
        matchStatus &&
        matchBranch &&
        matchDepartment &&
        matchDivision
      );
    });
  }, [search, status, branch, department, division]);

  // 🔹 Summary
  const totalEmployees = filteredData.length;
  const totalGross = filteredData.reduce((sum, e) => sum + e.gross, 0);
  const totalDeduction = filteredData.reduce((sum, e) => sum + e.deduction, 0);
  const totalNet = filteredData.reduce((sum, e) => sum + e.net, 0);

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">Payroll Report</h3>

          {/* Filters */}
          <Row className="mb-3">
            <Col md={2}>
              <Form.Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Control
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </Col>

            <Col md={3}>
              <Form.Control
                placeholder="Search Employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>

            <Col md={2}>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>All</option>
                <option>Processed</option>
                <option>Locked</option>
              </Form.Select>
            </Col>

            <Col md={3} className="text-end">
              <Button variant="success">Export Excel</Button>
            </Col>
          </Row>

          {/* Advanced Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <Select
                options={branchOptions}
                value={branch}
                onChange={setBranch}
                placeholder="Select Branch"
                isClearable
              />
            </Col>

            <Col md={4}>
              <Select
                options={departmentOptions}
                value={department}
                onChange={setDepartment}
                placeholder="Select Department"
                isClearable
              />
            </Col>

            <Col md={4}>
              <Select
                options={divisionOptions}
                value={division}
                onChange={setDivision}
                placeholder="Select Division"
                isClearable
              />
            </Col>
          </Row>

          {/* Summary Cards */}
          <Row className="mb-3 text-center">
            <Col>
              <Card bg="light"><Card.Body>Total Employees: {totalEmployees}</Card.Body></Card>
            </Col>
            <Col>
              <Card bg="primary" text="white"><Card.Body>Total Gross: ₹ {totalGross}</Card.Body></Card>
            </Col>
            <Col>
              <Card bg="danger" text="white"><Card.Body>Deductions: ₹ {totalDeduction}</Card.Body></Card>
            </Col>
            <Col>
              <Card bg="success" text="white"><Card.Body>Net Paid: ₹ {totalNet}</Card.Body></Card>
            </Col>
          </Row>

          {/* Table */}
          <Table className="table table-hover table-dark-custom">
            <thead className="table-dark">
              <tr>
                <th>Employee</th>
                <th>Branch</th>
                <th>Dept</th>
                <th>Division</th>
                <th>Gross</th>
                <th>Deduction</th>
                <th>Net</th>
                <th>Status</th>
                <th>Payslip</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.branch}</td>
                  <td>{emp.dept}</td>
                  <td>{emp.division}</td>
                  <td>₹ {emp.gross}</td>
                  <td>₹ {emp.deduction}</td>
                  <td>₹ {emp.net}</td>
                  <td>
                    <Badge bg={emp.status === "Locked" ? "dark" : "success"}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td>
                    <Eye className="me-2" style={{ cursor: "pointer" }} />
                    <Download style={{ cursor: "pointer" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

        </Card.Body>
      </Card>
    </Container>
  );
};

export default PayrollReportPage;