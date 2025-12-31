import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import ToggleSection from '../ToggleSection';

interface Education {
  id: number;
  qualification: string;
  course: string;
  university: string;
  passingYear: string;
  grade: string;
  modeOfEducation: string;
  isHighestQualification: boolean;
}

const EmployeeEducation: React.FC = () => {
  const [educationRecords, setEducationRecords] = useState<Education[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<Education>({
    id: 0,
    qualification: '',
    course: '',
    university: '',
    passingYear: '',
    grade: '',
    modeOfEducation: '',
    isHighestQualification: false,
  });
  const [editRecord, setEditRecord] = useState<Education | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (editRecord) {
      setEducationRecords((prev) =>
        prev.map((rec) => (rec.id === editRecord.id ? formData : rec))
      );
    } else {
      setEducationRecords((prev) => [...prev, { ...formData, id: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      id: Date.now(),
      qualification: '',
      course: '',
      university: '',
      passingYear: '',
      grade: '',
      modeOfEducation: '',
      isHighestQualification: false,
    });
    setEditRecord(null);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    setEducationRecords((prev) => prev.filter((rec) => rec.id !== deleteId));
    setConfirmDelete(false);
  };

  return (
   <div className="employee-education-container">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Education
        </Button>
      </div>

      {educationRecords.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Qualification</th>
              <th>Course</th>
              <th>University</th>
              <th>Passing Year</th>
              <th>Grade</th>
              <th>Mode</th>
              <th>Highest?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {educationRecords.map((edu) => (
              <tr key={edu.id}>
                <td>{edu.qualification}</td>
                <td>{edu.course}</td>
                <td>{edu.university}</td>
                <td>{edu.passingYear}</td>
                <td>{edu.grade}</td>
                <td>{edu.modeOfEducation}</td>
                <td>{edu.isHighestQualification ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setEditRecord(edu);
                      setFormData(edu);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(edu.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No education records added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editRecord ? 'Edit Education' : 'Add Education'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="qualification">
                  <Form.Label>Qualification</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.qualification}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter qualification.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="course">
                  <Form.Label>Course</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.course}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter course name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="university">
                  <Form.Label>University</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.university}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter university name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="passingYear">
                  <Form.Label>Passing Year</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    placeholder="e.g., 2023"
                    value={formData.passingYear}
                    onChange={handleInputChange}
                    min="1950"
                    max={new Date().getFullYear() + 1}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter valid passing year.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="grade">
                  <Form.Label>Grade</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.grade}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter grade or percentage.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="modeOfEducation">
                  <Form.Label>Mode of Education</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Regular, Distance"
                    value={formData.modeOfEducation}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter mode of education.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="isHighestQualification">
                  <Form.Check
                    label="Is Highest Qualification"
                    checked={formData.isHighestQualification}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editRecord ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this education record?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteAction}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeEducation;
