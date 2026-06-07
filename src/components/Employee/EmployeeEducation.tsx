import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import employeeService from '../../services/employeeService';

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

interface Props {
  employeeID: number;
}

const EmployeeEducation: React.FC<Props> = ({ employeeID }) => {
  const [educationRecords, setEducationRecords] = useState<Education[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    loadEducations();
  }, [employeeID]);

  const loadEducations = async () => {
    if (!employeeID) return;
    setLoading(true);
    try {
      const res = await employeeService.GetEmployeeEducations(employeeID);
      const list = res?.Table || [];
      setEducationRecords(
        list.map((item: any) => ({
          id: item.EducationID || item.educationID || 0,
          qualification: item.Qualification || item.qualification || '',
          course: item.Course || item.course || '',
          university: item.University || item.university || '',
          passingYear: (item.PassingYear || item.passingYear || '').toString(),
          grade: item.Grade || item.grade || '',
          modeOfEducation: item.ModeOfEducation || item.modeOfEducation || '',
          isHighestQualification: item.IsHighestQualification || item.isHighestQualification || false,
        }))
      );
    } catch (err) {
      console.error('Error loading education records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const payload: any = {
      educationID: editRecord ? editRecord.id : 0,
      employeeID,
      qualification: formData.qualification,
      course: formData.course,
      university: formData.university,
      passingYear: parseInt(formData.passingYear) || 0,
      grade: formData.grade,
      modeOfEducation: formData.modeOfEducation,
      isHighestQualification: formData.isHighestQualification,
      isActive: true,
      isDeleted: false,
      createdBy: 'Employee',
    };

    try {
      const res = await employeeService.SaveEmployeeEducation(payload);
      const msg = Array.isArray(res) && res[0]?.msg ? res[0].msg : (editRecord ? 'Education updated' : 'Education added');
      toast.success(msg);
      setValidated(false);
      setShowModal(false);
      await loadEducations();
    } catch (err) {
      toast.error('Failed to save education record');
    }
  };

  const handleAdd = () => {
    setFormData({
      id: 0,
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      let deleteRes: any;
      const record = educationRecords.find((r) => r.id === deleteId);
      if (record) {
        deleteRes = await employeeService.SaveEmployeeEducation({
          educationID: deleteId,
          employeeID,
          qualification: record.qualification,
          course: record.course,
          university: record.university,
          passingYear: parseInt(record.passingYear) || 0,
          grade: record.grade,
          modeOfEducation: record.modeOfEducation,
          isHighestQualification: record.isHighestQualification,
          isActive: false,
          isDeleted: true,
        });
      }
      const msg = Array.isArray(deleteRes) && deleteRes[0]?.msg ? deleteRes[0].msg : 'Education record deleted';
      toast.success(msg);
      setConfirmDelete(false);
      await loadEducations();
    } catch (err) {
      toast.error('Failed to delete education record');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  return (
   <div className="employee-education-container">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Education
        </Button>
      </div>

      {educationRecords.length ? (
        <Table className="table table-hover table-dark-custom">
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
                    onClick={() => handleDeleteClick(edu.id)}
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
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeEducation;
