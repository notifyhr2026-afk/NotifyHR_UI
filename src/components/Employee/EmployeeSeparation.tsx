import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import employeeService from '../../services/employeeService';

const resignationReasons = [
  'Better Career Opportunity',
  'Better Package',
  'Higher Education / Further Studies',
  'Health Issues',
  'Relocation / Location Change',
  'Work-Life Balance',
  'Company Culture / Work Environment',
  'Personal Reasons',
  'Family Responsibilities',
  'Entrepreneurship / Start Own Business',
  'Contract / Project Ended',
  'Role Dissatisfaction',
  'Other',
];

interface Props {
  employeeID: number;
}

const EmployeeSeparation: React.FC<Props> = ({ employeeID }) => {
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const createdBy = user?.name || user?.username || '';

  const [formData, setFormData] = useState({
    reason: '',
    lastWorkingDay: '',
    exitInterviewNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        EmployeeID: employeeID,
        Reason: formData.reason,
        LastWorkingDay: formData.lastWorkingDay,
        ExitInterviewNotes: formData.exitInterviewNotes,
        CreatedBy: createdBy,
      };
      await employeeService.ApplyResignation(payload);
      toast.success('Resignation submitted successfully');
      setValidated(false);
      setFormData({ reason: '', lastWorkingDay: '', exitInterviewNotes: '' });
    } catch (err) {
      toast.error('Failed to submit resignation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setValidated(false);
    setFormData({ reason: '', lastWorkingDay: '', exitInterviewNotes: '' });
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="reason">
            <Form.Label>Reason for Resignation</Form.Label>
            <Form.Select required value={formData.reason} onChange={handleChange}>
              <option value="">Select Reason</option>
              {resignationReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select a reason.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="lastWorkingDay">
            <Form.Label>Last Working Day</Form.Label>
            <Form.Control
              type="date"
              required
              value={formData.lastWorkingDay}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Please select last working day.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <Form.Group controlId="exitInterviewNotes">
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              required
              value={formData.exitInterviewNotes}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Please provide exit interview notes.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <div className="text-end mt-4">
        <Button variant="primary" type="submit" className="me-2" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Apply'}
        </Button>
        <Button variant="secondary" type="button" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </Form>
  );
};

export default EmployeeSeparation;
