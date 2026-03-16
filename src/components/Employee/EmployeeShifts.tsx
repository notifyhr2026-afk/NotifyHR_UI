import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { useLocation } from 'react-router-dom';

const shifts = [
  { id: 1, name: 'Morning Shift' },
  { id: 2, name: 'Evening Shift' },
  { id: 3, name: 'Night Shift' },
];

const weekdays = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

interface EmployeeShift {
  id: number;
  employeeId: number;
  shiftId: number;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string;
  isRotational: boolean;
  isFixed: boolean;
  weekends: string[];
}

const EmployeeShifts: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const employeeIdFromQuery = Number(query.get('employeeId') || 0);

  const [records, setRecords] = useState<EmployeeShift[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<EmployeeShift | null>(null);
  const [validated, setValidated] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [formData, setFormData] = useState<EmployeeShift>({
    id: 0,
    employeeId: employeeIdFromQuery,
    shiftId: 0,
    shiftName: '',
    effectiveFrom: '',
    effectiveTo: '',
    isRotational: false,
    isFixed: false,
    weekends: [],
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, employeeId: employeeIdFromQuery }));
  }, [employeeIdFromQuery]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleWeekendSelect = (selected: any) => {
    setFormData(prev => ({ ...prev, weekends: selected ? selected.map((s: any) => s.value) : [] }));
  };

  const handleAdd = () => {
    setFormData({
      id: 0,
      employeeId: employeeIdFromQuery,
      shiftId: 0,
      shiftName: '',
      effectiveFrom: '',
      effectiveTo: '',
      isRotational: false,
      isFixed: false,
      weekends: [],
    });
    setEditRecord(null);
    setShowModal(true);
    setValidated(false);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const shift = shifts.find(s => s.id === Number(formData.shiftId));
    const updatedRecord = { ...formData, shiftName: shift?.name || '' };

    if (editRecord) {
      setRecords(prev => prev.map(r => (r.id === editRecord.id ? updatedRecord : r)));
    } else {
      setRecords(prev => [...prev, { ...updatedRecord, id: Date.now() }]);
    }

    setShowModal(false);
  };

  const handleEdit = (record: EmployeeShift) => {
    setEditRecord(record);
    setFormData(record);
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
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Assign Shift
        </Button>
      </div>

      <Table striped bordered hover>
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
          {records.length === 0 ? (
            <tr><td colSpan={7} className="text-center text-muted">No shift assignments yet.</td></tr>
          ) : (
            records.map(r => (
              <tr key={r.id}>
                <td>{r.shiftName}</td>
                <td>{r.effectiveFrom}</td>
                <td>{r.effectiveTo || '--'}</td>
                <td>{r.isRotational ? 'Yes' : 'No'}</td>
                <td>{r.isFixed ? 'Yes' : 'No'}</td>
                <td>{r.weekends.join(', ') || '--'}</td>
                <td>
                  <Button size="sm" variant="outline-primary" onClick={() => handleEdit(r)}>Edit</Button>{' '}
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r.id)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editRecord ? 'Edit Shift Assignment' : 'Assign Shift'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="shiftId">
                  <Form.Label>Shift</Form.Label>
                  <Form.Select required value={formData.shiftId} onChange={handleChange}>
                    <option value="">Select Shift</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="effectiveFrom">
                  <Form.Label>Effective From</Form.Label>
                  <Form.Control required type="date" value={formData.effectiveFrom} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="effectiveTo">
                  <Form.Label>Effective To</Form.Label>
                  <Form.Control type="date" value={formData.effectiveTo} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={3} className="mt-4">
                <Form.Check label="Rotational" id="isRotational" checked={formData.isRotational} onChange={handleChange} />
              </Col>
              <Col md={3} className="mt-4">
                <Form.Check label="Fixed" id="isFixed" checked={formData.isFixed} onChange={handleChange} />
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Weekends / Off Days</Form.Label>
                  <Select
                    isMulti
                    options={weekdays}
                    value={weekdays.filter(d => formData.weekends.includes(d.value))}
                    onChange={handleWeekendSelect}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">{editRecord ? 'Update' : 'Assign'}</Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this shift assignment?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteAction}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeShifts;