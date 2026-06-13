import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import employeeService from '../../services/employeeService';

const resignationReasons = [
  { id: 1, name: 'Better Career Opportunity' },
  { id: 2, name: 'Better Package' },
  { id: 3, name: 'Higher Education / Further Studies' },
  { id: 4, name: 'Health Issues' },
  { id: 5, name: 'Relocation / Location Change' },
  { id: 6, name: 'Work-Life Balance' },
  { id: 7, name: 'Company Culture / Work Environment' },
  { id: 8, name: 'Personal Reasons' },
  { id: 9, name: 'Family Responsibilities' },
  { id: 10, name: 'Entrepreneurship / Start Own Business' },
  { id: 11, name: 'Contract / Project Ended' },
  { id: 12, name: 'Role Dissatisfaction' },
  { id: 13, name: 'Other' },
];
const getReasonName = (id: number) => {
  return resignationReasons.find((r) => r.id === Number(id))?.name || 'N/A';
};
interface Props {
  employeeID: number;
}

const EmployeeSeparation: React.FC<Props> = ({ employeeID }) => {
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [exitData, setExitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const createdBy = user?.name || user?.username || '';

  const [formData, setFormData] = useState({
    reasonId: '',
    lastWorkingDay: '',
    exitInterviewNotes: '',
  });

  // ---------------- FETCH EXIT DETAILS ----------------
  useEffect(() => {
    const fetchExitDetails = async () => {
      try {
        setLoading(true);
        const res = await employeeService.GetEmployeeExitDetails(employeeID);

        const record = res?.Table?.[0] || null;
        setExitData(record);

        if (record) {
          // Optional: prefill form (only if you want edit behavior)
          setFormData({
            reasonId: record.ExitReasonID?.toString() || '',
            lastWorkingDay: record.LastWorkingDay?.split('T')[0] || '',
            exitInterviewNotes: record.ExitInterviewNotes || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExitDetails();
  }, [employeeID]);

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // ---------------- SUBMIT ----------------
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
        Reason: formData.reasonId,
        ExitReasonID: formData.reasonId,
        LastWorkingDay: formData.lastWorkingDay,
        ExitInterviewNotes: formData.exitInterviewNotes,
        CreatedBy: createdBy,
        EmployeeName: user?.name || user?.username || '',
        organizationID: user?.organizationID || 0,
      };

      await employeeService.ApplyResignation(payload);

      toast.success('Resignation submitted successfully');

      // refresh data after submit
      const res = await employeeService.GetEmployeeExitDetails(employeeID);
      setExitData(res?.Table?.[0] || null);

      setValidated(false);
    } catch (err) {
      toast.error('Failed to submit resignation');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- CLEAR ----------------
  const handleClear = () => {
    setValidated(false);
    setFormData({
      reasonId: '',
      lastWorkingDay: '',
      exitInterviewNotes: '',
    });
  };

  const getStatusBadge = (statusID: number) => {
    switch (statusID) {
      case 1:
        return <Alert variant="success">Approved</Alert>;
      case 2:
        return <Alert variant="danger">Rejected</Alert>;
      default:
        return <Alert variant="warning">Pending</Alert>;
    }
  };

  // ---------------- UI ----------------
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {/* ---------------- STATUS SECTION ---------------- */}
     {exitData && (
  <div className="mb-3">

    {getStatusBadge(exitData.StatusID)}

    <p><strong>Applied Date:</strong> {exitData.Applieddate}</p>

    <p><strong>Reason for Resignation:</strong> {getReasonName(exitData.ExitReasonID)}</p>

    <p><strong>Your Comments:</strong> {exitData.ExitInterviewNotes || 'N/A'}</p>

    {exitData.StatusID === 1 && (
      <>
        <p><strong>Revised Last Working Day:</strong> {exitData.RevisedLastWorkingDay || 'N/A'}</p>
        <p><strong>Approved At:</strong> {exitData.ApprovedAt || 'N/A'}</p>
        <p><strong>Approver Comments:</strong> {exitData.ApproverComments || 'N/A'}</p>
      </>
    )}

    {exitData.StatusID === 2 && (
      <p><strong>Approver Comments:</strong> {exitData.ApproverComments || 'N/A'}</p>
    )}
  </div>
)}

      {/* ---------------- FORM (ONLY IF NOT SUBMITTED OR REJECTED) ---------------- */}
      {!exitData && (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3 g-3">
            <Col md={6}>
              <Form.Group controlId="reasonId">
                <Form.Label>Reason for Resignation</Form.Label>
                <Form.Select
                  required
                  value={formData.reasonId}
                  onChange={handleChange}
                >
                  <option value="">Select Reason</option>
                  {resignationReasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a reason.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
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

          <Row className="mb-3 g-3">
            <Col md={12}>
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

          <Row>
            <Col className="d-flex justify-content-end gap-2">
              <Button variant="primary" type="submit" disabled={submitting}>
                Apply
              </Button>

              <Button variant="secondary" type="button" onClick={handleClear}>
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default EmployeeSeparation;