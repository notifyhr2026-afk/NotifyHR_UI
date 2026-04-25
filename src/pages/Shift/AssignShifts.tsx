import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Form, Table, Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import employeeService from "../../services/employeeService";
import branchService from "../../services/branchService";
import departmentService from "../../services/departmentService";
import shiftService from "../../services/shiftService";
import employeeshiftService from "../../services/employeeshiftService";

interface ShiftOption {
  value: number;
  label: string;
}

interface BranchOption {
  value: number;
  label: string;
}

interface DepartmentOption {
  value: number;
  label: string;
}

interface EmployeeOption {
  value: number;
  label: string;
  branchId?: number;
  departmentId?: number;
}

interface AssignRecord {
  id: number;
  employeeId: number;
  shiftId: number;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isRotational: boolean;
  isFixed: boolean;
  weekends: number[];
}

const weekendOptions: ShiftOption[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const AssignShifts: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeOption[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [assignments, setAssignments] = useState<AssignRecord[]>([]);

  const [selectedBranch, setSelectedBranch] = useState<BranchOption | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentOption | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);

  const [assignData, setAssignData] = useState<AssignRecord>({
    id: 0,
    employeeId: 0,
    shiftId: 0,
    shiftName: "",
    effectiveFrom: "",
    effectiveTo: null,
    isRotational: false,
    isFixed: false,
    weekends: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeeRes, branchRes, departmentRes, shiftRes] = await Promise.all([
        employeeService.getEmployeesByOrganizationIdAsync(organizationID),
        branchService.getBranchesAsync(organizationID),
        departmentService.getdepartmentesAsync(organizationID),
        shiftService.GetShiftsByOrganization(organizationID),
      ]);

      const employeeData = Array.isArray(employeeRes) ? employeeRes : employeeRes?.Table || [];
      const branchData = Array.isArray(branchRes) ? branchRes : branchRes?.Table || [];
      const departmentData = Array.isArray(departmentRes) ? departmentRes : departmentRes?.Table || [];
      const shiftData = Array.isArray(shiftRes) ? shiftRes : shiftRes?.Table || [];

      const employeeOptions = employeeData.map((emp: any) => ({
        value: emp.EmployeeID,
        label: emp.EmployeeName || `${emp.FirstName || ""} ${emp.LastName || ""}`.trim() || `#${emp.EmployeeID}`,
        branchId: emp.BranchID,
        departmentId: emp.DepartmentID,
      }));

      setEmployees(employeeOptions);
      setFilteredEmployees(employeeOptions);

      setBranches(
        branchData.map((branch: any) => ({
          value: branch.BranchID || branch.id,
          label: branch.BranchName || branch.name,
        }))
      );

      setDepartments(
        departmentData.map((dept: any) => ({
          value: dept.DepartmentID || dept.id,
          label: dept.DepartmentName || dept.name,
        }))
      );

      setShifts(
        shiftData.map((shift: any) => ({
          value: shift.ShiftID,
          label: shift.ShiftName,
        }))
      );
    } catch (error) {
      console.error("Failed loading Assign Shifts data", error);
      alert("Failed loading shift assignment data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (employeeId: number) => {
    try {
      const data = await employeeshiftService.GetEmployeeShiftByEmployeeID(employeeId);
      const assignmentData = Array.isArray(data) ? data : data?.Table || [];

      setAssignments(
        assignmentData.map((item: any) => {
          let weekends: number[] = [];
          if (item.WeekendsJson) {
            try {
              const parsed = JSON.parse(item.WeekendsJson);
              weekends = Array.isArray(parsed)
                ? parsed.map((w: any) => Number(w.WeekdayID)).filter((v: number) => !Number.isNaN(v))
                : [];
            } catch {
              weekends = [];
            }
          }

          return {
            id: item.EmployeeShiftID,
            employeeId: item.EmployeeID,
            shiftId: item.OrgShiftID,
            shiftName: item.ShiftName || shifts.find((s) => s.value === item.OrgShiftID)?.label || "",
            effectiveFrom: formatDate(item.EffectiveFrom),
            effectiveTo: formatDate(item.EffectiveTo),
            isRotational: item.IsRotational ?? false,
            isFixed: item.IsFixed ?? false,
            weekends,
          };
        })
      );
    } catch (error) {
      console.error("Failed to load employee shift assignments", error);
      setAssignments([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = employees;
    if (selectedBranch) {
      filtered = filtered.filter((emp) => emp.branchId === selectedBranch.value);
    }
    if (selectedDepartment) {
      filtered = filtered.filter((emp) => emp.departmentId === selectedDepartment.value);
    }
    setFilteredEmployees(filtered);
  }, [selectedBranch, selectedDepartment, employees]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAssignments(selectedEmployee.value);
    } else {
      setAssignments([]);
    }
  }, [selectedEmployee, shifts]);

  const handleAssignInput = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    const normalizedValue = id === "shiftId" ? Number(value) : value;

    setAssignData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : normalizedValue,
    }));
  };

  const handleWeekendSelect = (selected: any) => {
    setAssignData((prev) => ({
      ...prev,
      weekends: selected ? selected.map((s: any) => s.value) : [],
    }));
  };

  const openModal = (editData?: AssignRecord) => {
    if (editData) {
      setAssignData(editData);
      setEditing(true);
    } else {
      if (!selectedEmployee) {
        return alert("Please select an employee before assigning a shift.");
      }

      setAssignData({
        id: 0,
        employeeId: selectedEmployee.value,
        shiftId: 0,
        shiftName: "",
        effectiveFrom: "",
        effectiveTo: null,
        isRotational: false,
        isFixed: false,
        weekends: [],
      });
      setEditing(false);
      setValidated(false);
    }

    setShowModal(true);
  };

  const saveAssignment = async () => {
    if (!selectedEmployee || !assignData.shiftId || !assignData.effectiveFrom) {
      setValidated(true);
      return alert("Please fill required fields before saving.");
    }

    const payload = {
      EmployeeShiftID: assignData.id || 0,
      EmployeeID: selectedEmployee.value,
      OrgShiftID: Number(assignData.shiftId),
      EffectiveFrom: assignData.effectiveFrom,
      EffectiveTo: assignData.effectiveTo || null,
      IsRotational: assignData.isRotational,
      IsFixed: assignData.isFixed,
      AssignedBy: user?.username || user?.name || "system",
      IsActive: true,
      WeekendsJson: JSON.stringify(assignData.weekends.map((weekday) => ({ WeekdayID: weekday }))),
    };

    try {
      await employeeshiftService.PostEmployeeShiftAsync(payload);
      alert(editing ? "Shift assignment updated successfully." : "Shift assigned successfully.");
      setShowModal(false);
      if (selectedEmployee) {
        fetchAssignments(selectedEmployee.value);
      }
    } catch (error) {
      console.error("Failed to save assignment", error);
      alert("Failed to save assignment.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this assignment?")) {
      return;
    }

    try {
      await employeeshiftService.DeleteEmployeeShiftAsync(id);
      alert("Assignment deleted successfully.");
      if (selectedEmployee) {
        fetchAssignments(selectedEmployee.value);
      }
    } catch (error) {
      console.error("Failed to delete assignment", error);
      alert("Failed to delete assignment.");
    }
  };

  return (
    <div className="p-3 mt-3">
      <h3 className="fw-bold">Assign Shifts</h3>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <div className="text-end mb-3">
            <Button onClick={() => openModal()}>Assign Shift</Button>
          </div>

          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Label>Branch</Form.Label>
                  <Select
                    options={branches}
                    value={selectedBranch}
                    onChange={setSelectedBranch}
                    className="org-select"
                    classNamePrefix="org-select"
                    isClearable
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Department</Form.Label>
                  <Select
                    options={departments}
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    className="org-select"
                    classNamePrefix="org-select"
                    isClearable
                  />
                </Col>
                <Col md={4} className="mt-2">
                  <Form.Label>Employee</Form.Label>
                  <Select
                    options={filteredEmployees}
                    value={selectedEmployee}
                    onChange={setSelectedEmployee}
                    className="org-select"
                    classNamePrefix="org-select"
                    isClearable
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th>Shift</th>
                <th>From</th>
                <th>To</th>
                <th>Rotational</th>
                <th>Fixed</th>
                <th>Weekends</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">No shift assignments found.</td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.shiftName}</td>
                    <td>{assignment.effectiveFrom}</td>
                    <td>{assignment.effectiveTo || "--"}</td>
                    <td>{assignment.isRotational ? "Yes" : "No"}</td>
                    <td>{assignment.isFixed ? "Yes" : "No"}</td>
                    <td>{weekendOptions.filter((opt) => assignment.weekends.includes(opt.value)).map((opt) => opt.label).join(", ") || "--"}</td>
                    <td>
                      <Button size="sm" onClick={() => openModal(assignment)}>Edit</Button>{" "}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(assignment.id)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{editing ? "Edit Shift Assignment" : "Assign Shift"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Shift</Form.Label>
                <Form.Select id="shiftId" value={assignData.shiftId} onChange={handleAssignInput}>
                  <option value="">Select Shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.value} value={shift.value}>
                      {shift.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Effective From</Form.Label>
                <Form.Control
                  type="date"
                  id="effectiveFrom"
                  value={assignData.effectiveFrom}
                  onChange={handleAssignInput}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Effective To</Form.Label>
                <Form.Control
                  type="date"
                  id="effectiveTo"
                  value={assignData.effectiveTo || ""}
                  onChange={handleAssignInput}
                />
              </Form.Group>

              <Form.Check
                id="isRotational"
                label="Rotational"
                checked={assignData.isRotational}
                onChange={handleAssignInput}
              />
              <Form.Check
                id="isFixed"
                label="Fixed"
                checked={assignData.isFixed}
                onChange={handleAssignInput}
              />

              <Form.Group className="mt-3">
                <Form.Label>Weekends</Form.Label>
                <Select
                  isMulti
                  options={weekendOptions}
                  value={weekendOptions.filter((opt) => assignData.weekends.includes(opt.value))}
                  onChange={handleWeekendSelect}
                  className="org-select"
                  classNamePrefix="org-select"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveAssignment}>
                {editing ? "Update" : "Save"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default AssignShifts;
