import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Nav,
  Row,
  Table,
} from "react-bootstrap";
import { BsPlusLg, BsPencilSquare, BsTrash } from "react-icons/bs";

const Icon = (C: any, props: any = {}) => <C {...props} />;

// ----------------------- STATIC DATA -----------------------

const staticShifts = [
  {
    id: 1,
    code: "MORN",
    name: "Morning Shift",
    start: "09:00",
    end: "17:00",
    breakMin: 30,
    isNight: false,
  },
  {
    id: 2,
    code: "EVE",
    name: "Evening Shift",
    start: "13:00",
    end: "21:00",
    breakMin: 30,
    isNight: false,
  },
  {
    id: 3,
    code: "NGT",
    name: "Night Shift",
    start: "22:00",
    end: "06:00",
    breakMin: 45,
    isNight: true,
  },
];

const staticPatterns = [
  {
    id: 1,
    name: "4-On 3-Off",
    desc: "4 work days, 3 days weekly off",
  },
  {
    id: 2,
    name: "Weekly Rotation",
    desc: "Morning → Evening → Night",
  },
];

const staticEmployees = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Samantha Red" },
  { id: 3, name: "Michael Adams" },
];

// ----------------------- MAIN COMPONENT -----------------------

const ShiftManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("shifts");
  const [shifts, setShifts] = useState(staticShifts);
  const [patterns, setPatterns] = useState(staticPatterns);

  // Add/Edit Modal for Shifts and Patterns
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"shift" | "pattern">("shift");

  const [formData, setFormData] = useState<any>({
    id: 0,
    code: "",
    name: "",
    start: "",
    end: "",
    breakMin: 30,
    isNight: false,
    desc: "",
  });

  // Assignment State
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignData, setAssignData] = useState({
    employeeId: "",
    shiftId: "",
    effectiveFrom: "",
    effectiveTo: "",
    isRotational: false,
  });

  // Form Input Handler
  const handleInput = (e: any) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // Assign input handler
  const handleAssignInput = (e: any) => {
    const { id, value, type, checked } = e.target;
    setAssignData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // ----------------------- SHIFT CRUD -----------------------
  const openAddShift = () => {
    setFormData({
      id: 0,
      code: "",
      name: "",
      start: "",
      end: "",
      breakMin: 30,
      isNight: false,
    });
    setModalType("shift");
    setShowModal(true);
  };

  const editShift = (shift: any) => {
    setFormData(shift);
    setModalType("shift");
    setShowModal(true);
  };

  const saveShift = () => {
    if (!formData.code || !formData.name || !formData.start || !formData.end) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.id === 0) {
      setShifts((prev) => [...prev, { ...formData, id: Date.now() }]);
    } else {
      setShifts((prev) =>
        prev.map((s) => (s.id === formData.id ? formData : s))
      );
    }

    setShowModal(false);
  };

  const deleteShift = (id: number) => {
    if (window.confirm("Delete this shift?")) {
      setShifts((prev) => prev.filter((x) => x.id !== id));
    }
  };

  // ----------------------- PATTERN CRUD -----------------------
  const openAddPattern = () => {
    setFormData({ id: 0, name: "", desc: "" });
    setModalType("pattern");
    setShowModal(true);
  };

  const editPattern = (pattern: any) => {
    setFormData(pattern);
    setModalType("pattern");
    setShowModal(true);
  };

  const savePattern = () => {
    if (!formData.name) {
      alert("Please enter pattern name");
      return;
    }

    if (formData.id === 0) {
      setPatterns((prev) => [...prev, { ...formData, id: Date.now() }]);
    } else {
      setPatterns((prev) =>
        prev.map((p) => (p.id === formData.id ? formData : p))
      );
    }

    setShowModal(false);
  };

  const deletePattern = (id: number) => {
    if (window.confirm("Delete this pattern?")) {
      setPatterns((prev) => prev.filter((x) => x.id !== id));
    }
  };

  // ----------------------- ASSIGNMENT CRUD -----------------------
  const saveAssignment = () => {
    if (!assignData.employeeId || !assignData.shiftId || !assignData.effectiveFrom) {
      alert("Please fill required fields");
      return;
    }

    setAssignments((prev) => [
      {
        ...assignData,
        id: Date.now(),
        employeeName: staticEmployees.find(
          (e) => e.id === Number(assignData.employeeId)
        )?.name,
        shiftName: shifts.find(
          (s) => s.id === Number(assignData.shiftId)
        )?.name,
      },
      ...prev,
    ]);

    // Reset assignment form
    setAssignData({
      employeeId: "",
      shiftId: "",
      effectiveFrom: "",
      effectiveTo: "",
      isRotational: false,
    });
  };

  return (
    <div className="p-3 mt-3">

      {/* PAGE HEADER */}
      <h3 className="fw-bold">Shift Management</h3>
      <p className="text-muted">Manage shifts, patterns & employee assignments</p>

      {/* NAV TABS */}
      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "shifts")}>
        <Nav.Item>
          <Nav.Link eventKey="shifts">Shifts</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="patterns">Shift Patterns</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="employees">Employee Assignments</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="assign">Assign Shift</Nav.Link>
        </Nav.Item>
      </Nav>

      {/* ----------------------- TAB: SHIFTS ----------------------- */}
      {activeTab === "shifts" && (
        <div className="mt-4">
          <div className="text-end mb-3">
            <Button onClick={openAddShift} variant="primary">
              {Icon(BsPlusLg, { className: "me-2" })} Add Shift
            </Button>
          </div>

          <Row>
            {shifts.map((s) => (
              <Col md={4} key={s.id} className="mb-3">
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="fw-bold">{s.name}</h5>
                    <p className="text-muted mb-1">Code: {s.code}</p>
                    <p className="mb-1">Time: {s.start} → {s.end}</p>
                    <p className="mb-1">Break: {s.breakMin} mins</p>
                    <p>
                      <span
                        className={`badge bg-${s.isNight ? "dark" : "primary"}`}
                      >
                        {s.isNight ? "Night Shift" : "Day Shift"}
                      </span>
                    </p>
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => editShift(s)}
                      >
                        {Icon(BsPencilSquare)}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deleteShift(s.id)}
                      >
                        {Icon(BsTrash)}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* ----------------------- TAB: SHIFT PATTERNS ----------------------- */}
      {activeTab === "patterns" && (
        <div className="mt-4">
          <div className="text-end mb-3">
            <Button onClick={openAddPattern} variant="primary">
              {Icon(BsPlusLg, { className: "me-2" })} Add Pattern
            </Button>
          </div>

          <Row>
            {patterns.map((p) => (
              <Col md={4} key={p.id} className="mb-3">
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="fw-bold">{p.name}</h5>
                    <p className="text-muted">{p.desc}</p>
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => editPattern(p)}
                      >
                        {Icon(BsPencilSquare)}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deletePattern(p.id)}
                      >
                        {Icon(BsTrash)}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* ----------------------- TAB: EMPLOYEE ASSIGNMENTS ----------------------- */}
      {activeTab === "employees" && (
        <div className="mt-4">
          <Table bordered hover>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Shift</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Rotational</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No assignments yet
                  </td>
                </tr>
              )}

              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.employeeName}</td>
                  <td>{a.shiftName}</td>
                  <td>{a.effectiveFrom}</td>
                  <td>{a.effectiveTo || "--"}</td>
                  <td>{a.isRotational ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* ----------------------- TAB: ASSIGN SHIFT ----------------------- */}
      {activeTab === "assign" && (
        <div className="mt-4">
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Assign Shift to Employee</h5>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Employee</Form.Label>
                    <Form.Select
                      id="employeeId"
                      value={assignData.employeeId}
                      onChange={handleAssignInput}
                    >
                      <option value="">-- Select Employee --</option>
                      {staticEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Shift</Form.Label>
                    <Form.Select
                      id="shiftId"
                      value={assignData.shiftId}
                      onChange={handleAssignInput}
                    >
                      <option value="">-- Select Shift --</option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
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
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Effective To (Optional)</Form.Label>
                    <Form.Control
                      type="date"
                      id="effectiveTo"
                      value={assignData.effectiveTo}
                      onChange={handleAssignInput}
                    />
                  </Form.Group>
                </Col>

                <Col md={4} className="mt-4">
                  <Form.Check
                    id="isRotational"
                    checked={assignData.isRotational}
                    onChange={handleAssignInput}
                    label="Rotational Shift"
                  />
                </Col>
              </Row>

              <Button variant="primary" onClick={saveAssignment}>
                Assign Shift
              </Button>
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
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No assignments yet
                  </td>
                </tr>
              )}

              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.employeeName}</td>
                  <td>{a.shiftName}</td>
                  <td>{a.effectiveFrom}</td>
                  <td>{a.effectiveTo || "--"}</td>
                  <td>{a.isRotational ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* ----------------------- ADD/EDIT MODAL ----------------------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "shift"
              ? formData.id === 0
                ? "Add Shift"
                : "Edit Shift"
              : formData.id === 0
              ? "Add Pattern"
              : "Edit Pattern"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {modalType === "shift" ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Shift Code</Form.Label>
                  <Form.Control
                    id="code"
                    value={formData.code}
                    onChange={handleInput}
                    placeholder="EX: MORN"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Shift Name</Form.Label>
                  <Form.Control
                    id="name"
                    value={formData.name}
                    onChange={handleInput}
                    placeholder="Morning Shift"
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="time"
                        id="start"
                        value={formData.start}
                        onChange={handleInput}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="time"
                        id="end"
                        value={formData.end}
                        onChange={handleInput}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Break Duration (Minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    id="breakMin"
                    value={formData.breakMin}
                    onChange={handleInput}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    label="Night Shift"
                    id="isNight"
                    checked={formData.isNight}
                    onChange={handleInput}
                  />
                </Form.Group>
              </>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Pattern Name</Form.Label>
                  <Form.Control
                    id="name"
                    value={formData.name}
                    onChange={handleInput}
                    placeholder="4-On 3-Off"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    id="desc"
                    value={formData.desc}
                    onChange={handleInput}
                    placeholder="Describe the pattern"
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={modalType === "shift" ? saveShift : savePattern}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShiftManagement;
