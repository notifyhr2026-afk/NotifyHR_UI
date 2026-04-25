import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import employeeshiftService from '../../services/employeeshiftService';
import shiftService from '../../services/shiftService';
import { fireAudit } from '../../utils/auditUtils';

interface EmployeeShift {
  id: number;
  employeeId: number;
  shiftId: number;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isRotational: boolean;
  isFixed: boolean;
  weekends: string[];
}

interface ShiftOption {
  value: number;
  label: string;
}

const weekdays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const EmployeeShifts: React.FC = () => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const empId = Number(employeeID);

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = userFromStorage?.organizationID ?? 0;

  const [records, setRecords] = useState<EmployeeShift[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<EmployeeShift | null>(null);
  const [validated, setValidated] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [formData, setFormData] = useState<EmployeeShift>({
    id: 0,
    employeeId: empId,
    shiftId: 0,
    shiftName: '',
    effectiveFrom: '',
    effectiveTo: null,
    isRotational: false,
    isFixed: false,
    weekends: [],
  });

  // Convert ISO string to yyyy-MM-dd
  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // Fetch shifts for dropdown
  const fetchShifts = async () => {
    try {
      const data = await shiftService.GetShiftsByOrganization(organizationID);
      const mapped = data.map((s: any) => ({ value: s.ShiftID, label: s.ShiftName }));
      setShifts(mapped);
    } catch (err) {
      console.error('Error fetching shifts', err);
    }
  };

  // Fetch employee shifts
  const fetchEmployeeShifts = async () => {
    try {
      const data = await employeeshiftService.GetEmployeeShiftByEmployeeID(empId);
      const mapped: EmployeeShift[] = data.map((item: any) => {
        // Parse weekends JSON
        let weekends: string[] = [];
        if (item.WeekendsJson) {
          try {
            const w = JSON.parse(item.WeekendsJson);
            weekends = w.map((d: any) => weekdays.find(wd => wd.value === d.WeekdayID)?.label || '');
          } catch { }
        }
        return {
          id: item.EmployeeShiftID,
          employeeId: item.EmployeeID,
          shiftId: item.OrgShiftID,
          shiftName: shifts.find(s => s.value === item.OrgShiftID)?.label || '',
          effectiveFrom: formatDate(item.EffectiveFrom),
          effectiveTo: formatDate(item.EffectiveTo),
          isRotational: item.IsRotational,
          isFixed: false,
          weekends,
        };
      });
      setRecords(mapped);
    } catch (err) {
      console.error('Error fetching employee shifts', err);
    }
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, employeeId: empId }));
    fetchShifts();
  }, [empId]);

  useEffect(() => {
    if (shifts.length) fetchEmployeeShifts();
  }, [shifts]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleWeekendSelect = (selected: any) => {
    setFormData(prev => ({
      ...prev,
      weekends: selected ? selected.map((s: any) => s.label) : [],
    }));
  };

  const handleAdd = () => {
    setFormData({
      id: 0,
      employeeId: empId,
      shiftId: 0,
      shiftName: '',
      effectiveFrom: '',
      effectiveTo: null,
      isRotational: false,
      isFixed: false,
      weekends: [],
    });
    setEditRecord(null);
    setShowModal(true);
    setValidated(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const payload = {
      EmployeeShiftID: formData.id,
      EmployeeID: formData.employeeId,
      OrgShiftID: Number(formData.shiftId) || 0,
      EffectiveFrom: formData.effectiveFrom,
      EffectiveTo: formData.effectiveTo || null,
      IsRotational: formData.isRotational,
      AssignedBy: userFromStorage?.username || 'system',
      IsActive: true,
      WeekendsJson: JSON.stringify(
        formData.weekends.map(w => ({ WeekdayID: weekdays.find(d => d.label === w)?.value }))
      ),
    };

    try {
      const res = await employeeshiftService.PostEmployeeShiftAsync(payload);
      alert(res.message);
      fireAudit(editRecord ? "UPDATE" : "CREATE", "EmployeeShift", editRecord, payload, organizationID, userFromStorage?.name || "Admin", "EmployeeShifts");
      setShowModal(false);
      fetchEmployeeShifts();
    } catch (err) {
      console.error('Error saving shift', err);
    }
  };

  const handleEdit = (record: EmployeeShift) => {
    setEditRecord(record);
    setFormData({
      ...record,
      effectiveFrom: formatDate(record.effectiveFrom),
      effectiveTo: formatDate(record.effectiveTo),
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (deleteId !== null) {
      try {
        const oldData = records.find(r => r.id === deleteId);
        const res = await employeeshiftService.DeleteEmployeeShiftAsync(deleteId);
        alert(res.message);
        fireAudit("DELETE", "EmployeeShift", oldData, null, organizationID, userFromStorage?.name || "Admin", "EmployeeShifts");
        fetchEmployeeShifts();
      } catch (err) {
        console.error('Error deleting shift', err);
      } finally {
        setConfirmDelete(false);
      }
    }
  };

  return (
    <div className="p-3 mt-4">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>+ Assign Shift</Button>
      </div>

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

      {/* Modal for Add/Edit */}
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
                    {shifts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                  <Form.Control type="date" value={formData.effectiveTo || ''} onChange={handleChange} />
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
                    options={weekdays.map(d => ({ value: d.value, label: d.label }))}
                    value={weekdays.filter(d => formData.weekends.includes(d.label))}
                    onChange={handleWeekendSelect}
                    className="org-select"
                    classNamePrefix="org-select"
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