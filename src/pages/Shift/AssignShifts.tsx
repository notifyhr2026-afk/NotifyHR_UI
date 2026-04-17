import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Form, Table, Modal } from "react-bootstrap";
import Select from "react-select";

// Static Data
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

// ✅ NEW: Groups
const staticGroups = [
  { id: 1, name: "HR Team" },
  { id: 2, name: "Night Support Team" },
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
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [assignType, setAssignType] = useState<"employee" | "group">("employee");

  const [assignData, setAssignData] = useState<any>({
    id: "",
    employeeId: "",
    groupId: "",
    shiftId: "",
    effectiveFrom: "",
    effectiveTo: "",
    isRotational: false,
    isFixed: false,
    weekends: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState(staticEmployees);

  // Filter employees
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
    setAssignData((prev: any) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWeekendSelect = (selected: any) => {
    setAssignData((prev: any) => ({
      ...prev,
      weekends: selected ? selected.map((s: any) => s.value) : [],
    }));
  };

  const openModal = (editData?: any) => {
    if (!editData) {
      if (assignType === "employee" && !selectedEmployee) {
        return alert("Select employee");
      }
      if (assignType === "group" && !selectedGroup) {
        return alert("Select group");
      }
    }

    if (editData) {
      setAssignData(editData);
      setAssignType(editData.type);
      setEditing(true);
    } else {
      setAssignData({
        id: "",
        employeeId: selectedEmployee?.value || "",
        groupId: selectedGroup?.value || "",
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
    if (!assignData.shiftId || !assignData.effectiveFrom) {
      return alert("Fill required fields");
    }

    let name = "";
    let type = assignType;

    if (assignType === "employee") {
      name = staticEmployees.find(e => e.id === Number(assignData.employeeId))?.name || "";
    } else {
      name = staticGroups.find(g => g.id === Number(assignData.groupId))?.name || "";
    }

    const shiftName = staticShifts.find(s => s.id === Number(assignData.shiftId))?.name;

    const newAssign = {
      ...assignData,
      id: editing ? assignData.id : Date.now(),
      name,
      shiftName,
      type,
    };

    if (editing) {
      setAssignments(assignments.map(a => (a.id === assignData.id ? newAssign : a)));
    } else {
      setAssignments([newAssign, ...assignments]);
    }

    setShowModal(false);
  };

  const deleteAssignment = (id: number) => {
    if (window.confirm("Delete this assignment?")) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-3 mt-3">
      <h3 className="fw-bold">Assign Shifts</h3>

      <div className="text-end mb-3">
        <Button onClick={() => openModal()}>Assign Shift</Button>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Label>Assign Type</Form.Label>
              <Form.Select
                value={assignType}
                onChange={(e) => setAssignType(e.target.value as any)}
              >
                <option value="employee">Employee</option>
                <option value="group">Group</option>
              </Form.Select>
            </Col>

            {assignType === "employee" && (
              <>
                <Col md={4}>
                  <Form.Label>Branch</Form.Label>
                  <Select options={staticBranches} onChange={setSelectedBranch} />
                </Col>
                <Col md={4}>
                  <Form.Label>Department</Form.Label>
                  <Select options={staticDepartments} onChange={setSelectedDepartment} />
                </Col>
                <Col md={4} className="mt-2">
                  <Form.Label>Employee</Form.Label>
                  <Select
                    options={filteredEmployees.map(emp => ({
                      value: emp.id,
                      label: emp.name,
                    }))}
                    onChange={setSelectedEmployee}
                  />
                </Col>
              </>
            )}

            {assignType === "group" && (
              <Col md={4}>
                <Form.Label>Group</Form.Label>
                <Select
                  options={staticGroups.map(g => ({
                    value: g.id,
                    label: g.name,
                  }))}
                  onChange={setSelectedGroup}
                />
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Table className="table table-hover table-dark-custom">
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Shift</th>
            <th>From</th>
            <th>To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">No data</td>
            </tr>
          ) : (
            assignments.map(a => (
              <tr key={a.id}>
                <td>{a.type}</td>
                <td>{a.name}</td>
                <td>{a.shiftName}</td>
                <td>{a.effectiveFrom}</td>
                <td>{a.effectiveTo || "--"}</td>
                <td>
                  <Button size="sm" onClick={() => openModal(a)}>Edit</Button>{" "}
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
          <Modal.Title>{editing ? "Edit" : "Assign Shift"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Shift</Form.Label>
            <Form.Select id="shiftId" value={assignData.shiftId} onChange={handleAssignInput}>
              <option value="">Select Shift</option>
              {staticShifts.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Effective From</Form.Label>
            <Form.Control type="date" id="effectiveFrom" value={assignData.effectiveFrom} onChange={handleAssignInput} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Effective To</Form.Label>
            <Form.Control type="date" id="effectiveTo" value={assignData.effectiveTo} onChange={handleAssignInput} />
          </Form.Group>

          <Form.Check id="isRotational" label="Rotational" checked={assignData.isRotational} onChange={handleAssignInput} />
          <Form.Check id="isFixed" label="Fixed" checked={assignData.isFixed} onChange={handleAssignInput} />

          <Form.Group className="mt-3">
            <Form.Label>Weekends</Form.Label>
            <Select
              isMulti
              options={allDays}
              value={allDays.filter(opt => assignData.weekends.includes(opt.value))}
              onChange={handleWeekendSelect}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={saveAssignment}>{editing ? "Update" : "Save"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignShifts;