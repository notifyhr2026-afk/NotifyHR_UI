import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Modal,
} from "react-bootstrap";
import { Eye } from "react-bootstrap-icons";

const PAGE_SIZE = 5;

const PayrollProcessPage: React.FC = () => {
  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(2026);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Static Employees
  const employees = [
    { id: 1024, name: "John Doe", branch: "Hyderabad", dept: "IT", gross: 20000, deductions: 3000, net: 17000, status: "Pending" },
    { id: 1025, name: "Jane Smith", branch: "Chennai", dept: "HR", gross: 25000, deductions: 4000, net: 21000, status: "Processed" },
    { id: 1026, name: "Ravi Kumar", branch: "Bangalore", dept: "Finance", gross: 22000, deductions: 2500, net: 19500, status: "Pending" },
    { id: 1027, name: "Anita Rao", branch: "Hyderabad", dept: "IT", gross: 27000, deductions: 5000, net: 22000, status: "Processed" },
    { id: 1028, name: "Vikram Singh", branch: "Mumbai", dept: "Admin", gross: 18000, deductions: 2000, net: 16000, status: "Pending" },
    { id: 1029, name: "Priya Sharma", branch: "Chennai", dept: "HR", gross: 26000, deductions: 3500, net: 22500, status: "Pending" },
  ];

  // Dummy Attendance Data
  const attendanceData = [
    { date: "2026-03-01", status: "Present", in: "09:00", out: "18:00", hours: 9 },
    { date: "2026-03-02", status: "Leave", in: "-", out: "-", hours: 0 },
    { date: "2026-03-03", status: "Present", in: "09:15", out: "18:10", hours: 8.5 },
  ];

const [filteredData, setFilteredData] = useState(employees);
const handleGetData = () => {
  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toString().includes(search);

    const matchStatus =
      statusFilter === "All" || emp.status === statusFilter;

    const matchBranch =
      branchFilter === "All" || emp.branch === branchFilter;

    const matchDept =
      deptFilter === "All" || emp.dept === deptFilter;

    return matchSearch && matchStatus && matchBranch && matchDept;
  });

  setFilteredData(filtered);
  setCurrentPage(1); // reset pagination
};
  // Pagination
const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Summary
  const totalEmployees = filteredData.length;
  const processedCount = filteredData.filter(e => e.status === "Processed").length;
  const pendingCount = filteredData.filter(e => e.status === "Pending").length;

  // Selection
  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

const toggleSelectAll = () => {
  const ids = paginatedData.map(e => e.id);

  const allSelected = ids.every(id => selected.includes(id));

  if (allSelected) {
    // UNCHECK all
    setSelected(prev => prev.filter(id => !ids.includes(id)));
  } else {
    // CHECK all (ES5 safe)
    setSelected(prev => {
      const combined = prev.concat(ids);
      return combined.filter((item, index) => combined.indexOf(item) === index);
    });
  }
};

  // Actions
  const handleProcessSelected = () => {
    alert(`Processing ${selected.length} employees`);
  };

  const handleProcessAll = () => {
    alert("Processing all employees");
  };

  return (
    <Container>
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">Payroll Processing</h3>

          {/* First Row Filters */}
          <Row className="mb-3">   
            <Col md={1}>
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

            <Col md={2}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option>
                <option>Pending</option>
                <option>Processed</option>
              </Form.Select>
            </Col>     
            <Col md={2}>
              <Form.Select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                <option>All</option>
                <option>Hyderabad</option>
                <option>Chennai</option>
                <option>Bangalore</option>
                <option>Mumbai</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Second Row Filters */}
          <Row className="mb-3">

            <Col md={3}>
              <Form.Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option>All</option>
                <option>IT</option>
                <option>HR</option>
                <option>Finance</option>
                <option>Admin</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                placeholder="Search Employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={3}>
    <Button variant="primary" onClick={handleGetData}>
      Get Data
    </Button>

    <Button
      variant="secondary"
      className="ms-2"
      onClick={() => {
        setSearch("");
        setStatusFilter("All");
        setBranchFilter("All");
        setDeptFilter("All");
        setFilteredData(employees);
        setCurrentPage(1);
      }}
    >
      Clear
    </Button>
  </Col>
          </Row>

          {/* Summary Cards */}
          <Row className="mb-3 text-center">
            <Col>
              <Card bg="light"><Card.Body>Total: {totalEmployees}</Card.Body></Card>
            </Col>
            <Col>
              <Card bg="success" text="white"><Card.Body>Processed: {processedCount}</Card.Body></Card>
            </Col>
            <Col>
              <Card bg="warning"><Card.Body>Pending: {pendingCount}</Card.Body></Card>
            </Col>
          </Row>

          {/* Table */}
          <Table hover className="table-dark-custom">
            <thead className="table-dark">
              <tr>
                <th><Form.Check
  checked={
    paginatedData.length > 0 &&
    paginatedData.every(e => selected.includes(e.id))
  }
  onChange={toggleSelectAll}
/></th>
                <th>Name</th>
                <th>Branch</th>
                <th>Dept</th>
                <th>Gross</th>
                <th>Deduction</th>
                <th>Net</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <Form.Check
                      checked={selected.includes(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                    />
                  </td>
                  <td>{emp.name}</td>
                  <td>{emp.branch}</td>
                  <td>{emp.dept}</td>
                  <td>₹ {emp.gross}</td>
                  <td>₹ {emp.deductions}</td>
                  <td>₹ {emp.net}</td>
                  <td>
                    <Badge bg={emp.status === "Processed" ? "success" : "warning"}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td>
                    <Eye
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setShowModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-between">
            <div>Page {currentPage} / {totalPages}</div>
            <div>
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="me-2"
              >
                Prev
              </Button>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Actions */}
          <Row className="mt-3">
            <Col className="text-end">
              <Button variant="primary" className="me-2" onClick={handleProcessSelected}>
                Process Selected
              </Button>
              <Button variant="success" className="me-2" onClick={handleProcessAll}>
                Process All
              </Button>
              <Button variant="danger">
                Lock Payroll
              </Button>
            </Col>
          </Row>

        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Attendance - {selectedEmployee?.name}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="mb-3">
            <Col>Total Days: 31</Col>
            <Col>Present: 28</Col>
            <Col>Leaves: 2</Col>
            <Col>LOP: 1</Col>
          </Row>

          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>In</th>
                <th>Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((a, i) => (
                <tr key={i}>
                  <td>{a.date}</td>
                  <td>{a.status}</td>
                  <td>{a.in}</td>
                  <td>{a.out}</td>
                  <td>{a.hours}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PayrollProcessPage;