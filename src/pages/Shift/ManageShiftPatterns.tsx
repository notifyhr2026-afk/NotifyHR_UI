import React, { useState } from "react";
import { Button, Card, Col, Row, Modal, Form, Table } from "react-bootstrap";
import { BsPlusLg, BsPencilSquare, BsTrash } from "react-icons/bs";

const Icon = (C: any, props: any = {}) => React.createElement(C, props);

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

interface PatternDetail {
  day: string;
  isWeekOff: boolean;
}

interface Pattern {
  id: number;
  name: string;
  desc: string;
  details: PatternDetail[];
}

const ManageShiftPatterns: React.FC = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [showModal, setShowModal] = useState(false);

  const createEmptyPattern = (): Pattern => ({
    id: 0,
    name: "",
    desc: "",
    details: days.map((d) => ({
      day: d,
      isWeekOff: false
    }))
  });

  const [formData, setFormData] = useState<Pattern>(createEmptyPattern());

  const openAddPattern = () => {
    setFormData(createEmptyPattern());
    setShowModal(true);
  };

  const editPattern = (pattern: Pattern) => {
    setFormData(pattern);
    setShowModal(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const toggleWeekOff = (index: number) => {
    const updated = [...formData.details];
    updated[index].isWeekOff = !updated[index].isWeekOff;

    setFormData({
      ...formData,
      details: updated
    });
  };

  const savePattern = () => {
    if (!formData.name) {
      alert("Enter pattern name");
      return;
    }

    if (formData.id === 0) {
      setPatterns([{ ...formData, id: Date.now() }, ...patterns]);
    } else {
      setPatterns(patterns.map((p) => (p.id === formData.id ? formData : p)));
    }

    setShowModal(false);
  };

  const deletePattern = (id: number) => {
    if (window.confirm("Delete this pattern?")) {
      setPatterns(patterns.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-3 mt-3">
      <h3 className="fw-bold">Manage Shift Patterns</h3>

      <div className="text-end mb-3">
        <Button onClick={openAddPattern}>
          {Icon(BsPlusLg, { className: "me-2" })}
          Add Pattern
        </Button>
      </div>

      <Row>
        {patterns.map((p) => (
          <Col md={4} key={p.id} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="fw-bold">{p.name}</h5>
                <p className="text-muted">{p.desc}</p>

                <div className="d-flex justify-content-end gap-2">
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

      {/* Modal */}

      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.id === 0 ? "Add Pattern" : "Edit Pattern"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pattern Name</Form.Label>
                  <Form.Control
                    id="name"
                    value={formData.name}
                    onChange={handleInput}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    id="desc"
                    value={formData.desc}
                    onChange={handleInput}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mt-3">Pattern Details</h6>

            <Table bordered>
              <thead>
                <tr>
                  <th>Day</th>
                  <th className="text-center">Week Off</th>
                </tr>
              </thead>

              <tbody>
                {formData.details.map((d, i) => (
                  <tr key={d.day}>
                    <td>{d.day}</td>

                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={d.isWeekOff}
                        onChange={() => toggleWeekOff(i)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button onClick={savePattern}>Save Pattern</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageShiftPatterns;