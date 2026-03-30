import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';

const ProbationDetails: React.FC = () => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default probation data
  const defaultProbationData = {
    joiningDate: '',
    initialProbationEndDate: '',
    extendedProbationEndDate: '',
    confirmationDate: '',
    status: '',
    remarks: '',
  };

  const [probationData, setProbationData] = useState(defaultProbationData);

  useEffect(() => {
    const fetchProbationDetails = async () => {
      if (!employeeID) return;

      try {
        const id = parseInt(employeeID);
        const res = await employeeService.GetEmployeeDetialsByEmployeeID(id);

        if (res?.Table4?.length) {
          const probation = res.Table4[0];
          setProbationData({
            joiningDate: probation.JoiningDate ? probation.JoiningDate.split('T')[0] : '',
            initialProbationEndDate: probation.InitialProbationEndDate ? probation.InitialProbationEndDate.split('T')[0] : '',
            extendedProbationEndDate: probation.ExtendedProbationEndDate ? probation.ExtendedProbationEndDate.split('T')[0] : '',
            confirmationDate: probation.ConfirmationDate ? probation.ConfirmationDate.split('T')[0] : '',
            status: probation.Status || '',
            remarks: probation.Remarks || '',
          });
        }
      } catch (error) {
        console.error('Error fetching probation details:', error);
        setErrorMessage('Failed to load probation details.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProbationDetails();
  }, [employeeID]);

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
    // Reset to default data
    setProbationData(defaultProbationData);
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
      {fetchLoading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading probation details...</p>
        </div>
      ) : (
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
      )}
    </>
  );
};

export default ProbationDetails;
