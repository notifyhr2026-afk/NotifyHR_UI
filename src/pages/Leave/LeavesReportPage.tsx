import React, { useEffect, useState } from "react";
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
  Spinner,
} from "react-bootstrap";

import employeeService from "../../services/employeeService";
import branchService from "../../services/branchService";
import departmentService from "../../services/departmentService";
import leaveService from '../../services/leaveService';

// -------------------- Types --------------------

type Option = {
  value: number;
  label: string;
};

type Leave = {
  employeeLeaveID: number;
  employeeID: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  leaveStatus: string;
};

// -------------------- Component --------------------

const LeavesReportPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  const [branches, setBranches] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);

  const [branch, setBranch] = useState<Option | null>(null);
  const [department, setDepartment] = useState<Option | null>(null);
  const [employee, setEmployee] = useState<Option | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // -------------------- Load Master Data --------------------

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empRes, branchRes, deptRes] = await Promise.all([
        employeeService.getEmployeesByOrganizationIdAsync(organizationID),
        branchService.getBranchesAsync(organizationID),
        departmentService.getdepartmentesAsync(organizationID),
      ]);

      const empData = empRes?.Table || empRes || [];
      const branchData = branchRes?.Table || branchRes || [];
      const deptData = deptRes?.Table || deptRes || [];

      setEmployees(empData);

      setBranches(
        branchData.map((b: any) => ({
          value: b.BranchID,
          label: b.BranchName,
        }))
      );

      setDepartments(
        deptData.map((d: any) => ({
          value: d.DepartmentID,
          label: d.DepartmentName,
        }))
      );
    } catch (err) {
      console.error("Load error", err);
    }
  };

  // -------------------- Filter Employees --------------------

  useEffect(() => {
    let filtered = [...employees];

    if (branch) {
      filtered = filtered.filter((e) => e.BranchID === branch.value);
    }

    if (department) {
      filtered = filtered.filter(
        (e) => e.DepartmentID === department.value
      );
    }

    setEmployeeOptions(
      filtered.map((e: any) => ({
        value: e.EmployeeID,
        label:
          e.EmployeeName ||
          `${e.FirstName || ""} ${e.LastName || ""}`.trim(),
      }))
    );

    setEmployee(null);
  }, [branch, department, employees]);

  // -------------------- Fetch Leaves --------------------

  const handleFetch = async () => {
    try {
      setLoading(true);
      setSearched(true);

      const data =
        await leaveService.GetEmployeeLeavesReportAsync(
          organizationID,
          employee?.value,
          fromDate || undefined,
          toDate || undefined
        );

      const result = data?.Table || data || [];

      setLeaves(
        result.map((l: any) => ({
          employeeLeaveID: l.EmployeeLeaveID,
          employeeID: l.EmployeeID,
          employeeName: l.EmployeeName,
          leaveType: l.LeaveTypeName,
          startDate: l.StartDate,
          endDate: l.EndDate,
          numberOfDays: l.NumberOfDays,
          reason: l.Reason,
          leaveStatus: l.LeaveStatusName,
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Approve / Reject --------------------

  const handleAction = async (
    leaveId: number,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await leaveService.ApproveOrRejectEmployeeLeaveAsync({
        EmployeeLeaveID: leaveId,
        Status: status,
        ActionBy: user?.username || "admin",
      });

      alert(`Leave ${status}`);

      handleFetch();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  // -------------------- Badge --------------------

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

  // -------------------- UI --------------------

  return (
    <div className="p-3 mt-3">
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
                onChange={(v) => {
                  setBranch(v);
                  setDepartment(null);
                }}
                isClearable
                className="org-select"
                classNamePrefix="org-select"
              />
            </Col>

            <Col md={3}>
              <Form.Label>Department</Form.Label>
              <Select
                options={departments}
                value={department}
                onChange={(v) => setDepartment(v)}
                isDisabled={!branch}
                isClearable
                className="org-select"
                classNamePrefix="org-select"
              />
            </Col>

            <Col md={3}>
              <Form.Label>Employee</Form.Label>
              <Select
                options={employeeOptions}
                value={employee}
                onChange={(v) => setEmployee(v)}
                isClearable
                className="org-select"
                classNamePrefix="org-select"
              />
            </Col>

            <Col md={3}>
              <Form.Label>Action</Form.Label>
              <Button className="w-100" onClick={handleFetch}>
                Fetch Report
              </Button>
            </Col>
          </Row>

          {/* Dates */}
          <Row className="g-3 mt-2">
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

          {/* Loading */}
          {loading && (
            <div className="text-center mt-4">
              <Spinner />
            </div>
          )}

          {/* Empty */}
          {searched && !loading && leaves.length === 0 && (
            <Alert className="mt-4">No data found</Alert>
          )}

          {/* Table */}
          {!loading && leaves.length > 0 && (
            <div className="table-responsive mt-4">
              <Table className="table table-hover table-dark-custom">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.employeeLeaveID}>
                      <td>{l.employeeName}</td>
                      <td>{l.leaveType}</td>
                      <td>
                        {l.startDate} → {l.endDate}
                      </td>
                      <td>{l.numberOfDays}</td>
                      <td>{l.reason}</td>
                      <td>
                        <Badge bg={getBadge(l.leaveStatus)}>
                          {l.leaveStatus}
                        </Badge>
                      </td>
                      <td>
                        {l.leaveStatus === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() =>
                                handleAction(
                                  l.employeeLeaveID,
                                  "Approved"
                                )
                              }
                            >
                              Approve
                            </Button>{" "}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() =>
                                handleAction(
                                  l.employeeLeaveID,
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
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