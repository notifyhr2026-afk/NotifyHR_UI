import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';

const ProbationDetails: React.FC = () => {
  const [validated, setValidated] = useState(false);

  // Static data for Probation details
  const staticProbationData = {
    joiningDate: '2024-01-15',
    initialProbationEndDate: '2024-07-15',
    extendedProbationEndDate: '2024-09-15',
    confirmationDate: '2024-09-16',
    status: 'Confirmed', // Editable dropdown
    remarks: 'Employee has completed the probation period successfully.',
  };

  const [probationData, setProbationData] = useState(staticProbationData);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      // Submit form data here
      console.log('Probation details submitted', probationData);
    }

    setValidated(true);
  };

  const handleClear = () => {
    setValidated(false);
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
              required
              name="extendedProbationEndDate"
              value={probationData.extendedProbationEndDate}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Extended probation end date is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="confirmationDate">
            <Form.Label>Confirmation Date</Form.Label>
            <Form.Control
              type="date"
              required
              name="confirmationDate"
              value={probationData.confirmationDate}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Confirmation date is required.
            </Form.Control.Feedback>
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
        <Button variant="primary" type="submit" className="me-2">
          Save
        </Button>
        <Button variant="secondary" type="button" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </Form>
  );
};

export default ProbationDetails;
