import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Modal, Form } from "react-bootstrap";
import { BsPlusLg, BsPencilSquare, BsTrash } from "react-icons/bs";
import shiftService from "../../services/shiftService";

const Icon = (C: any, props: any = {}) => <C {...props} />;

const ManageShifts: React.FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  const fetchShifts = async () => {
    if (!organizationID) {
      console.warn("Organization ID not found. Skipping shift fetch.");
      return;
    }

    try {
      const data = await shiftService.GetShiftsByOrganization(organizationID);
      setShifts(
        data.map((s: any) => ({
          id: s.ShiftID,
          code: s.ShiftCode,
          name: s.ShiftName,
          start: s.StartTime,
          end: s.EndTime,
          breakMin: s.BreakDurationMinutes,
          isNight: s.IsNightShift,
          isActive: s.IsActive,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch shifts", err);
    }
  };

  const saveShiftApi = async () => {
    if (!formData.code || !formData.name || !formData.start || !formData.end) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ShiftID: formData.id || 0,
      OrganizationID: organizationID,
      ShiftCode: formData.code,
      ShiftName: formData.name,
      StartTime: formData.start + ":00",
      EndTime: formData.end + ":00",
      BreakDurationMinutes: Number(formData.breakMin),
      IsNightShift: formData.isNight,
      Description: formData.desc || "",
      IsActive: true,
      CreatedBy: "Admin",
    };

    try {
      await shiftService.PostPerformanceReviewCyclesByAsync(payload);
      await fetchShifts();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving shift", err);
    }
  };

  const deleteShiftApi = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await shiftService.DeletePerformanceReviewCyclesByAsync(id);
        await fetchShifts();
      } catch (err) {
        console.error("Failed to delete shift", err);
      }
    }
  };

  const handleInput = (e: any) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
  };

  const openAddShift = () => {
    setFormData({ id: 0, code: "", name: "", start: "", end: "", breakMin: 30, isNight: false, desc: "" });
    setShowModal(true);
  };

  const editShift = (shift: any) => {
    setFormData(shift);
    setShowModal(true);
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  return (
    <div className="p-3 mt-3">
      <h3 className="fw-bold">Manage Shifts</h3>
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
                  <span className={`badge bg-${s.isNight ? "dark" : "primary"}`}>
                    {s.isNight ? "Night Shift" : "Day Shift"}
                  </span>
                </p>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button size="sm" variant="outline-primary" onClick={() => editShift(s)}>
                    {Icon(BsPencilSquare)}
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deleteShiftApi(s.id)}>
                    {Icon(BsTrash)}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id === 0 ? "Add Shift" : "Edit Shift"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Shift Code</Form.Label>
              <Form.Control id="code" value={formData.code} onChange={handleInput} placeholder="EX: MORN" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Shift Name</Form.Label>
              <Form.Control id="name" value={formData.name} onChange={handleInput} placeholder="Morning Shift" />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control type="time" id="start" value={formData.start} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control type="time" id="end" value={formData.end} onChange={handleInput} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Break Duration (Minutes)</Form.Label>
              <Form.Control type="number" id="breakMin" value={formData.breakMin} onChange={handleInput} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check label="Night Shift" id="isNight" checked={formData.isNight} onChange={handleInput} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveShiftApi}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageShifts;