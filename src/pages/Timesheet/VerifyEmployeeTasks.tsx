import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Table, Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import taskService from "../../services/taskService";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";

/* ===================== INTERFACE ===================== */

interface EmployeeTask {
  id: number;
  employeeName: string;
  projectName: string;
  taskTitle: string;
  taskDescription?: string;
  taskDate: string;
  noOfHours: number;
  status: string;
}

interface EmployeeOption {
  value: number;
  label: string;
  departmentId?: number;
}

interface DepartmentOption {
  value: number;
  label: string;
}


/* ===================== COMPONENT ===================== */

const VerifyEmployeeTasks: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentOption | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          employeeService.getEmployeesByOrganizationIdAsync(organizationID),
          departmentService.getdepartmentesAsync(organizationID),
        ]);

        const empData = empRes?.Table || empRes || [];
        const deptData = deptRes?.Table || deptRes || [];

        setEmployees(
          empData.map((emp: any) => ({
            value: emp.EmployeeID || emp.EmployeeId || emp.id,
            label:
              emp.EmployeeName ||
              `${emp.FirstName || ""} ${emp.LastName || ""}`.trim() ||
              "Unknown",
            departmentId: emp.DepartmentID || emp.DepartmentId || null,
          }))
        );

        setDepartments(
          deptData.map((dept: any) => ({
            value: dept.DepartmentID || dept.DepartmentId,
            label: dept.DepartmentName || dept.DepartmentName || "",
          }))
        );
      } catch (error) {
        console.error("Error loading employees or departments", error);
      }
    };

    if (organizationID > 0) {
      loadFilters();
    }
  }, [organizationID]);

  const filteredEmployeeOptions = useMemo(() => {
    return selectedDepartment
      ? employees.filter((emp) => emp.departmentId === selectedDepartment.value)
      : employees;
  }, [employees, selectedDepartment]);

  useEffect(() => {
    if (
      selectedEmployee &&
      !filteredEmployeeOptions.some((emp) => emp.value === selectedEmployee.value)
    ) {
      setSelectedEmployee(null);
    }
  }, [filteredEmployeeOptions, selectedEmployee]);

  const handleGet = async () => {
    try {
      setLoading(true);

      const payload = {
        organizationId: organizationID,
        employeeId: selectedEmployee?.value || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
      };

      const data = await taskService.GetEmployeeDailyTasksByDateRange(payload);

      const normalizedTasks: EmployeeTask[] = data.map((item: any) => ({
        id: item.TaskID || item.id || item.taskId || 0,
        employeeName: item.EmployeeName || item.employeeName || "",
        projectName: item.ProjectName || item.projectName || "",
        taskTitle: item.TaskTitle || item.taskTitle || "",
        taskDescription: item.TaskDescription || item.taskDescription || "",
        taskDate: item.TaskDate || item.taskDate || "",
        noOfHours: item.NoOfHours ?? item.noOfHours ?? 0,
        status: item.Status || item.status || "Pending",
      }));

      setTasks(normalizedTasks);
    } catch (error) {
      console.error("Error fetching employee tasks", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge bg="success">Approved</Badge>;
      case "Rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="warning">{status || "Pending"}</Badge>;
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="mt-4">

      <h4 className="mb-3">Verify Employee Tasks</h4>

      {/* ===================== FILTER SECTION ===================== */}

      <Row className="mb-3 gy-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Select
              value={selectedDepartment?.value ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const dept = departments.find((d) => String(d.value) === value) || null;
                setSelectedDepartment(dept);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Employee</Form.Label>
            <Select
              options={filteredEmployeeOptions}
              value={selectedEmployee}
              onChange={(option) => setSelectedEmployee(option as EmployeeOption | null)}
              isClearable
              placeholder="Select employee..."
              className="org-select"
              classNamePrefix="org-select"
            />
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group>
            <Form.Label>From Date</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group>
            <Form.Label>To Date</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={1} className="d-flex align-items-end">
          <Button onClick={handleGet} disabled={loading}>
            {loading ? "Loading..." : "Get"}
          </Button>
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
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center py-4">
                <Spinner animation="border" />
              </td>
            </tr>
          ) : tasks.length > 0 ? (
            tasks.map((t) => (
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