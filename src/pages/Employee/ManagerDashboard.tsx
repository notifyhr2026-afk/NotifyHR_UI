import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  ProgressBar,
  Row,
  Table,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface EmployeeActivity {
  employeeID: number;
  employeeName: string;
  department: string;
  designation: string;
  status: "Present" | "WFH" | "Leave" | "Late";
  loginTime: string;
  logoutTime: string;
  workHours: string;
  pendingRequests: number;
  lateBy?: string;
}

const ManagerDashboard: React.FC = () => {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeActivity | null>(null);

  const [showDrawer, setShowDrawer] = useState(false);

  // ---------------- MOCK DATA ----------------

  const employees: EmployeeActivity[] = [
    {
      employeeID: 101,
      employeeName: "John Doe",
      department: "Engineering",
      designation: "Frontend Developer",
      status: "Present",
      loginTime: "09:02 AM",
      logoutTime: "-",
      workHours: "07:20",
      pendingRequests: 1,
    },
    {
      employeeID: 102,
      employeeName: "Ravi Kumar",
      department: "QA",
      designation: "QA Engineer",
      status: "Late",
      loginTime: "10:05 AM",
      logoutTime: "-",
      workHours: "05:10",
      pendingRequests: 2,
      lateBy: "1h 05m",
    },
    {
      employeeID: 103,
      employeeName: "Priya",
      department: "HR",
      designation: "HR Executive",
      status: "WFH",
      loginTime: "08:55 AM",
      logoutTime: "-",
      workHours: "08:10",
      pendingRequests: 0,
    },
    {
      employeeID: 104,
      employeeName: "Arjun",
      department: "Support",
      designation: "Support Lead",
      status: "Leave",
      loginTime: "-",
      logoutTime: "-",
      workHours: "-",
      pendingRequests: 0,
    },
  ];

  // ---------------- FILTER ----------------

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.employeeName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        emp.department
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        emp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  // ---------------- STATS ----------------

  const stats = useMemo(() => {
    return {
      total: employees.length,
      present: employees.filter(
        (e) => e.status === "Present"
      ).length,
      wfh: employees.filter((e) => e.status === "WFH")
        .length,
      late: employees.filter((e) => e.status === "Late")
        .length,
      leave: employees.filter(
        (e) => e.status === "Leave"
      ).length,
      pending: employees.reduce(
        (sum, e) => sum + e.pendingRequests,
        0
      ),
    };
  }, [employees]);

  // ---------------- STATUS BADGE ----------------

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge bg="success">Present</Badge>;

      case "WFH":
        return <Badge bg="primary">WFH</Badge>;

      case "Late":
        return <Badge bg="danger">Late</Badge>;

      case "Leave":
        return <Badge bg="warning">Leave</Badge>;

      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // ---------------- OPEN DRAWER ----------------

  const openEmployeeDrawer = (
    employee: EmployeeActivity
  ) => {
    setSelectedEmployee(employee);
    setShowDrawer(true);
  };

  return (
    <div className="manager-dashboard container-fluid py-3">
      {/* HEADER */}
      <div className="dashboard-header mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Team Activity Dashboard
          </h2>

          <p className="text-muted mb-0">
            Monitor attendance, approvals & employee
            activities
          </p>
        </div>

        <div>
          <Button variant="dark">
            Export Report
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <Row className="g-3 mb-4">
        <Col lg={2} md={4}>
          <Card className="summary-card total">
            <Card.Body>
              <div className="card-title-small">
                Total Employees
              </div>

              <h2>{stats.total}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4}>
          <Card className="summary-card present">
            <Card.Body>
              <div className="card-title-small">
                Present
              </div>

              <h2>{stats.present}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4}>
          <Card className="summary-card wfh">
            <Card.Body>
              <div className="card-title-small">
                WFH
              </div>

              <h2>{stats.wfh}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4}>
          <Card className="summary-card late">
            <Card.Body>
              <div className="card-title-small">
                Late
              </div>

              <h2>{stats.late}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4}>
          <Card className="summary-card leave">
            <Card.Body>
              <div className="card-title-small">
                Leave
              </div>

              <h2>{stats.leave}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4}>
          <Card className="summary-card pending">
            <Card.Body>
              <div className="card-title-small">
                Pending Requests
              </div>

              <h2>{stats.pending}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FILTERS */}
      <Card className="filter-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Control
                placeholder="Search employee..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </Col>

            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="All">
                  All Status
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="WFH">WFH</option>

                <option value="Late">Late</option>

                <option value="Leave">
                  Leave
                </option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Button className="w-100">
                Apply Filters
              </Button>
            </Col>

            <Col md={3}>
              <Button
                variant="outline-dark"
                className="w-100"
              >
                Bulk Approvals
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* TABLE */}
      <Card className="table-card">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Work Hours</th>
                  <th>Pending</th>
                  <th>Productivity</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employeeID}>
                    <td>
                      <div>
                        <div className="fw-semibold">
                          {emp.employeeName}
                        </div>

                        <small className="text-muted">
                          {emp.designation}
                        </small>
                      </div>
                    </td>

                    <td>{emp.department}</td>

                    <td>
                      {getStatusBadge(emp.status)}
                    </td>

                    <td>{emp.loginTime}</td>

                    <td>{emp.logoutTime}</td>

                    <td>{emp.workHours}</td>

                    <td>
                      {emp.pendingRequests > 0 ? (
                        <Badge bg="warning">
                          {emp.pendingRequests}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td width="180">
                      <ProgressBar
                        now={
                          emp.status === "Present"
                            ? 90
                            : emp.status === "WFH"
                            ? 85
                            : emp.status === "Late"
                            ? 60
                            : 0
                        }
                        variant={
                          emp.status === "Late"
                            ? "danger"
                            : "success"
                        }
                      />
                    </td>

                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          openEmployeeDrawer(emp)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* EMPLOYEE DRAWER */}
      <Modal
        show={showDrawer}
        onHide={() => setShowDrawer(false)}
        dialogClassName="drawer-modal"
        centered={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Employee Activity
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedEmployee && (
            <>
              <div className="employee-profile mb-4">
                <h5 className="fw-bold">
                  {selectedEmployee.employeeName}
                </h5>

                <div className="text-muted">
                  {selectedEmployee.designation}
                </div>

                <div className="text-muted">
                  {selectedEmployee.department}
                </div>
              </div>

              <div className="activity-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot success"></div>

                  <div>
                    <div className="fw-semibold">
                      Login
                    </div>

                    <small className="text-muted">
                      {selectedEmployee.loginTime}
                    </small>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot warning"></div>

                  <div>
                    <div className="fw-semibold">
                      Work Hours
                    </div>

                    <small className="text-muted">
                      {
                        selectedEmployee.workHours
                      }{" "}
                      hrs
                    </small>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot primary"></div>

                  <div>
                    <div className="fw-semibold">
                      Status
                    </div>

                    <small className="text-muted">
                      {selectedEmployee.status}
                    </small>
                  </div>
                </div>

                {selectedEmployee.lateBy && (
                  <div className="timeline-item">
                    <div className="timeline-dot danger"></div>

                    <div>
                      <div className="fw-semibold">
                        Late By
                      </div>

                      <small className="text-muted">
                        {
                          selectedEmployee.lateBy
                        }
                      </small>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 d-flex gap-2">
                <Button variant="success">
                  Approve Request
                </Button>

                <Button variant="danger">
                  Reject Request
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* CSS */}
      <style>{`
        .manager-dashboard {
          background: #f5f7fb;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-card {
          border: none;
          border-radius: 16px;
          color: #fff;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .summary-card:hover {
          transform: translateY(-4px);
        }

        .summary-card h2 {
          margin-top: 8px;
          font-weight: 700;
        }

        .card-title-small {
          font-size: 14px;
          opacity: 0.9;
        }

        .summary-card.total {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
        }

        .summary-card.present {
          background: linear-gradient(135deg,#22c55e,#16a34a);
        }

        .summary-card.wfh {
          background: linear-gradient(135deg,#06b6d4,#0891b2);
        }

        .summary-card.late {
          background: linear-gradient(135deg,#ef4444,#dc2626);
        }

        .summary-card.leave {
          background: linear-gradient(135deg,#f59e0b,#d97706);
        }

        .summary-card.pending {
          background: linear-gradient(135deg,#8b5cf6,#7c3aed);
        }

        .filter-card,
        .table-card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .table thead {
          background: #111827;
          color: #fff;
        }

        .table tbody tr:hover {
          background: #f8fafc;
        }

        .drawer-modal {
          position: fixed;
          right: 0;
          margin: 0;
          width: 420px;
          max-width: 100%;
          height: 100%;
        }

        .drawer-modal .modal-content {
          height: 100vh;
          border-radius: 0;
          border: none;
        }

        .timeline-item {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin-top: 6px;
        }

        .timeline-dot.success {
          background: #22c55e;
        }

        .timeline-dot.warning {
          background: #f59e0b;
        }

        .timeline-dot.primary {
          background: #3b82f6;
        }

        .timeline-dot.danger {
          background: #ef4444;
        }

        @media(max-width:768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .drawer-modal {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ManagerDashboard;