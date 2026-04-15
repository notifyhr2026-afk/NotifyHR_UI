import React, { useState } from "react";
import { Table, Button, Form, Row, Col, Badge } from "react-bootstrap";

/* ===================== INTERFACE ===================== */

interface EmployeeTask {
  id: number;
  employeeName: string;
  projectName: string;
  taskTitle: string;
  taskDate: string;
  noOfHours: number;
  status: "Pending" | "Approved" | "Rejected";
}

/* ===================== MOCK DATA ===================== */

const allTasks: EmployeeTask[] = [
  {
    id: 1,
    employeeName: "John Doe",
    projectName: "Project A",
    taskTitle: "UI Design",
    taskDate: "2026-04-10",
    noOfHours: 4,
    status: "Pending",
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    projectName: "Project B",
    taskTitle: "API Development",
    taskDate: "2026-04-11",
    noOfHours: 6,
    status: "Approved",
  },
  {
    id: 3,
    employeeName: "John Doe",
    projectName: "Project C",
    taskTitle: "Testing",
    taskDate: "2026-04-12",
    noOfHours: 3,
    status: "Rejected",
  },
];

/* ===================== COMPONENT ===================== */

const VerifyEmployeeTasks: React.FC = () => {

  /* ===== FILTER STATE ===== */
  const [employee, setEmployee] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [tasks, setTasks] = useState<EmployeeTask[]>([]);

  /* ===================== HANDLE GET ===================== */

  const handleGet = () => {
    let filtered = [...allTasks];

    if (employee) {
      filtered = filtered.filter(t => t.employeeName === employee);
    }

    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }

    if (fromDate) {
      filtered = filtered.filter(t => t.taskDate >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter(t => t.taskDate <= toDate);
    }

    setTasks(filtered);
  };

  const getBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge bg="success">Approved</Badge>;
      case "Rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="mt-4">

      <h4 className="mb-3">Verify Employee Tasks</h4>

      {/* ===================== FILTER SECTION ===================== */}

      <Row className="mb-3">

        <Col md={3}>
          <Form.Select value={employee} onChange={(e) => setEmployee(e.target.value)}>
            <option value="">All Employees</option>
            <option>John Doe</option>
            <option>Jane Smith</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Control
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From Date"
          />
        </Col>

        <Col md={2}>
          <Form.Control
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To Date"
          />
        </Col>

        <Col md={2}>
          <Button onClick={handleGet}>Get</Button>
        </Col>

      </Row>

      {/* ===================== TABLE ===================== */}

      <Table className="table table-hover table-dark-custom">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Project</th>
            <th>Task</th>
            <th>Date</th>
            <th>Hours</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {tasks.length > 0 ? (
            tasks.map(t => (
              <tr key={t.id}>
                <td>{t.employeeName}</td>
                <td>{t.projectName}</td>
                <td>{t.taskTitle}</td>
                <td>{t.taskDate}</td>
                <td>{t.noOfHours}</td>
                <td>{getBadge(t.status)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>

      </Table>

    </div>
  );
};

export default VerifyEmployeeTasks;