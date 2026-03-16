import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Form, Table, Modal } from "react-bootstrap";
import Select from "react-select";

// Sample static data
const staticBranches = [
  { value: "HQ", label: "Headquarters" },
  { value: "Branch1", label: "Branch 1" },
  { value: "Branch2", label: "Branch 2" },
];

const staticDepartments = [
  { value: "HR", label: "HR" },
  { value: "IT", label: "IT" },
  { value: "Sales", label: "Sales" },
];

const staticEmployees = [
  { id: 1, name: "John Doe", branch: "HQ", department: "HR" },
  { id: 2, name: "Samantha Red", branch: "Branch1", department: "IT" },
  { id: 3, name: "Michael Adams", branch: "Branch2", department: "Sales" },
];

const staticShifts = [
  { id: 1, name: "Morning Shift" },
  { id: 2, name: "Evening Shift" },
];

const allDays = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

const AssignShifts: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [assignData, setAssignData] = useState({
    id: "",
    employeeId: "",
    shiftId: "",
    effectiveFrom: "",
    effectiveTo: "",
    isRotational: false,
    isFixed: false,
    weekends: [] as string[],
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState(staticEmployees);

  // Filter employees based on branch and department
  useEffect(() => {
    let filtered = staticEmployees;
    if (selectedBranch) {
      filtered = filtered.filter(emp => emp.branch === selectedBranch.value);
    }
    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === selectedDepartment.value);
    }
    setFilteredEmployees(filtered);
  }, [selectedBranch, selectedDepartment]);

  const handleAssignInput = (e: any) => {
    const { id, value, type, checked } = e.target;
    setAssignData((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
  };

  const handleWeekendSelect = (selected: any) => {
    setAssignData((prev) => ({
      ...prev,
      weekends: selected ? selected.map((s: any) => s.value) : [],
    }));
  };

  const openModal = (editData?: any) => {
    if (!selectedEmployee && !editData) {
      return alert("Please select an employee first");
    }

    if (editData) {
      setAssignData(editData);
      setSelectedEmployee({
        value: editData.employeeId,
        label: editData.employeeName,
      });
      setEditing(true);
    } else {
      setAssignData({
        id: "",
        employeeId: selectedEmployee?.value || "",
        shiftId: "",
        effectiveFrom: "",
        effectiveTo: "",
        isRotational: false,
        isFixed: false,
        weekends: [],
      });
      setEditing(false);
    }
    setShowModal(true);
  };

  const saveAssignment = () => {
    if (!assignData.employeeId || !assignData.shiftId || !assignData.effectiveFrom) {
      return alert("Fill required fields");
    }

    const employeeName = staticEmployees.find(e => e.id === Number(assignData.employeeId))?.name;
    const shiftName = staticShifts.find(s => s.id === Number(assignData.shiftId))?.name;

    if (editing) {
      setAssignments(assignments.map(a =>
        a.id === assignData.id
          ? { ...assignData, employeeName, shiftName }
          : a
      ));
    } else {
      const newAssign = { ...assignData, id: Date.now(), employeeName, shiftName };
      setAssignments([newAssign, ...assignments]);
    }

    setShowModal(false);
  };

  const deleteAssignment = (id: number) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-3 mt-3">
      <h3 className="fw-bold">Assign Shifts</h3>
      <div className="text-end mb-3">
        <Button variant="primary" onClick={() => openModal()}>Assign Shift</Button>
      </div>      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Branch</Form.Label>
              <Select
                options={staticBranches}
                value={selectedBranch}
                onChange={setSelectedBranch}
                placeholder="Select branch"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Department</Form.Label>
              <Select
                options={staticDepartments}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                placeholder="Select department"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Employee</Form.Label>
              <Select
                options={filteredEmployees.map(emp => ({ value: emp.id, label: emp.name }))}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                placeholder="Select employee"
                isSearchable
              />
            </Col>
          </Row>          
        </Card.Body>
      </Card>

      <h5 className="fw-bold">Recent Assignments</h5>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Employee</th>
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
              <td colSpan={8} className="text-center text-muted">No assignments yet</td>
            </tr>
          ) : (
            assignments.map(a => (
              <tr key={a.id}>
                <td>{a.employeeName}</td>
                <td>{a.shiftName}</td>
                <td>{a.effectiveFrom}</td>
                <td>{a.effectiveTo || "--"}</td>
                <td>{a.isRotational ? "Yes" : "No"}</td>
                <td>{a.isFixed ? "Yes" : "No"}</td>
                <td>{a.weekends.join(", ") || "--"}</td>
                <td>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => openModal(a)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteAssignment(a.id)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Shift Assignment" : "Assign Shift"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Shift</Form.Label>
                <Form.Select
                  id="shiftId"
                  value={assignData.shiftId}
                  onChange={handleAssignInput}
                >
                  <option value="">-- Select Shift --</option>
                  {staticShifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Effective From</Form.Label>
                <Form.Control
                  type="date"
                  id="effectiveFrom"
                  value={assignData.effectiveFrom}
                  onChange={handleAssignInput}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Effective To</Form.Label>
                <Form.Control
                  type="date"
                  id="effectiveTo"
                  value={assignData.effectiveTo}
                  onChange={handleAssignInput}
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mt-2">
              <Form.Check
                id="isRotational"
                checked={assignData.isRotational}
                onChange={handleAssignInput}
                label="Rotational Shift"
              />
            </Col>

            <Col md={6} className="mt-2">
              <Form.Check
                id="isFixed"
                checked={assignData.isFixed}
                onChange={handleAssignInput}
                label="Fixed Shift"
              />
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3 mt-2">
                <Form.Label>Weekends / Off Days</Form.Label>
                <Select
                  isMulti
                  options={allDays}
                  value={allDays.filter(opt => assignData.weekends.includes(opt.value))}
                  onChange={handleWeekendSelect}
                  placeholder="Select off days"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveAssignment}>{editing ? "Update" : "Assign"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignShifts;