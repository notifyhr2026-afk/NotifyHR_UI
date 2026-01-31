import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

interface EmployeeProject {
  id: number; // EmployeeProjectId
  employeeId: number;
  employeeName: string;
  projectId: number;
  projectName: string;
  allocationPercentage: number;
  fromDate: string;
  toDate: string;
  isActive: boolean;
}

// Mock data for employees and projects
const employeeOptions = [
  { id: 101, name: 'John Doe' },
  { id: 102, name: 'Priya Sharma' },
  { id: 103, name: 'Amit Kumar' }
];

const projectOptions = [
  { id: 1, name: 'Project A' },
  { id: 2, name: 'Project B' }
];

const EmployeeProjects: React.FC = () => {
  const [records, setRecords] = useState<EmployeeProject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editRecord, setEditRecord] = useState<EmployeeProject | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<EmployeeProject>({
    id: 0,
    employeeId: 0,
    employeeName: '',
    projectId: 0,
    projectName: '',
    allocationPercentage: 0,
    fromDate: '',
    toDate: '',
    isActive: true
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
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

    const employee = employeeOptions.find(e => e.id === Number(formData.employeeId));
    const project = projectOptions.find(p => p.id === Number(formData.projectId));

    const updatedRecord = {
      ...formData,
      employeeName: employee?.name || '',
      projectName: project?.name || ''
    };

    if (editRecord) {
      setRecords(prev =>
        prev.map(r => (r.id === editRecord.id ? updatedRecord : r))
      );
    } else {
      setRecords(prev => [...prev, { ...updatedRecord, id: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      id: 0,
      employeeId: 0,
      employeeName: '',
      projectId: 0,
      projectName: '',
      allocationPercentage: 0,
      fromDate: '',
      toDate: '',
      isActive: true
    });
    setEditRecord(null);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setConfirmDelete(false);
  };

  return (
    <div className="p-3 mt-4">
      <div className="text-end mb-4">
        <Button variant="success" onClick={handleAdd}>
          + Add Employee Project
        </Button>
      </div>

      {records.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Project</th>
              <th>Allocation %</th>
              <th>From</th>
              <th>To</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.employeeName}</td>
                <td>{r.projectName}</td>
                <td>{r.allocationPercentage}</td>
                <td>{r.fromDate}</td>
                <td>{r.toDate}</td>
                <td>{r.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setEditRecord(r);
                      setFormData(r);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No employee project allocations yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editRecord ? 'Edit Employee Project' : 'Add Employee Project'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="employeeId">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    required
                    value={formData.employeeId}
                    onChange={handleChange}
                  >
                    <option value="">Select Employee</option>
                    {employeeOptions.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select an employee.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="projectId">
                  <Form.Label>Project</Form.Label>
                  <Form.Select
                    required
                    value={formData.projectId}
                    onChange={handleChange}
                  >
                    <option value="">Select Project</option>
                    {projectOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a project.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="allocationPercentage">
                  <Form.Label>Allocation %</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min={0}
                    max={100}
                    value={formData.allocationPercentage}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter valid allocation % (0-100)
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="fromDate">
                  <Form.Label>From</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.fromDate}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter start date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="toDate">
                  <Form.Label>To</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.toDate}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter end date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="isActive">
              <Form.Check
                label="Active"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Form.Group>

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
        <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
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

export default EmployeeProjects;
