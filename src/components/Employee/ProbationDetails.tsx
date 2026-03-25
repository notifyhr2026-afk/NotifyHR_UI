import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';

const ProbationDetails: React.FC = () => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Static data for Probation details
  const staticProbationData = {
    joiningDate: '2024-01-15',
    initialProbationEndDate: '2024-07-15',
    extendedProbationEndDate: '',
    confirmationDate: '',
    status: 'Confirmed', // Editable dropdown
    remarks: 'Employee has completed the probation period successfully.',
  };

  const [probationData, setProbationData] = useState(staticProbationData);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Prepare payload for API
      const payload = {
        employeeID: Number(employeeID),
        joiningDate: new Date(probationData.joiningDate).toISOString(),
        initialProbationEndDate: new Date(probationData.initialProbationEndDate).toISOString(),
        extendedProbationEndDate: probationData.extendedProbationEndDate ? new Date(probationData.extendedProbationEndDate).toISOString() : null,
        confirmationDate: probationData.confirmationDate ? new Date(probationData.confirmationDate).toISOString() : null,
        status: probationData.status,
        remarks: probationData.remarks,
      };

      console.log('Payload:', payload);

      // Call API
      const response = await employeeService.PostUpdateProbationDetails(payload);
      
      if (response) {
        setSuccessMessage('Probation details updated successfully!');
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error updating probation details:', error);
      setErrorMessage('Failed to update probation details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setValidated(false);
    setSuccessMessage(null);
    setErrorMessage(null);
    // Optionally, reset form fields here if needed
    setProbationData(staticProbationData); // Reset to static data
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setProbationData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
          {errorMessage}
        </Alert>
      )}
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="joiningDate">
            <Form.Label>Joining Date</Form.Label>
            <Form.Control
              type="date"
              required
              name="joiningDate"
              value={probationData.joiningDate}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Joining date is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="initialProbationEndDate">
            <Form.Label>Initial Probation End Date</Form.Label>
            <Form.Control
              type="date"
              required
              name="initialProbationEndDate"
              value={probationData.initialProbationEndDate}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Initial probation end date is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="extendedProbationEndDate">
            <Form.Label>Extended Probation End Date</Form.Label>
            <Form.Control
              type="date"
              name="extendedProbationEndDate"
              value={probationData.extendedProbationEndDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="confirmationDate">
            <Form.Label>Confirmation Date</Form.Label>
            <Form.Control
              type="date"
              name="confirmationDate"
              value={probationData.confirmationDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select required name="status" value={probationData.status} onChange={handleChange}>
              <option value="Confirmed">Confirmed</option>
              <option value="Not Confirmed">Not Confirmed</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select a status.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="remarks">
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="remarks"
              value={probationData.remarks}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="text-end mt-4">
        <Button 
          variant="primary" 
          type="submit" 
          className="me-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner 
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
        <Button 
          variant="secondary" 
          type="button" 
          onClick={handleClear}
          disabled={loading}
        >
          Clear
        </Button>
      </div>
    </Form>
    </>
  );
};

export default ProbationDetails;
