import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import ToggleSection from '../ToggleSection';

const EmployeeExitDetails: React.FC = () => {
    const [validated, setValidated] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
            // Submit form data here
            console.log('Exit details submitted');
        }

        setValidated(true);
    };

    const handleClear = () => {
        setValidated(false);
        // Optionally, reset form fields here
    };

    return (
        
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="exitTypeID">
                            <Form.Label>Exit Type</Form.Label>
                            <Form.Select required>
                                <option value="">Select Exit Type</option>
                                <option value="Resignation">Resignation</option>
                                <option value="Termination">Termination</option>
                                <option value="Retirement">Retirement</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please select an exit type.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="exitReason">
                            <Form.Label>Exit Reason</Form.Label>
                            <Form.Control type="text" required />
                            <Form.Control.Feedback type="invalid">
                                Exit reason is required.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                     <Col>
                        <Form.Group controlId="lastWorkingDay">
                            <Form.Label>Last Working Day</Form.Label>
                            <Form.Control type="date" required />
                            <Form.Control.Feedback type="invalid">
                                Last working day is required.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">                   
                    <Col>
                        <Form.Group controlId="exitInterviewNotes">
                            <Form.Label>Exit Interview Notes</Form.Label>
                            <Form.Control as="textarea" rows={3} />
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

export default EmployeeExitDetails;
