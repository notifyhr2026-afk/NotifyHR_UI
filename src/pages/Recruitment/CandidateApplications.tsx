import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';

interface CandidateApplication {
  id: number;
  candidateName: string;
  jobRequisition: string;
  appliedDate: string;
  currentStage: string;
  applicationStatus: string;
  notes: string;
}

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<CandidateApplication[]>([
    {
      id: 1,
      candidateName: 'John Doe',
      jobRequisition: 'Software Engineer',
      appliedDate: '2023-12-01',
      currentStage: 'Interview Scheduled',
      applicationStatus: 'In Progress',
      notes: 'Initial Interview Completed',
    },
    {
      id: 2,
      candidateName: 'Jane Smith',
      jobRequisition: 'Data Analyst',
      appliedDate: '2023-11-15',
      currentStage: 'Application Received',
      applicationStatus: 'Under Review',
      notes: 'CV Review in Progress',
    },
  ]);
  const jobOptions = [
  { value: 'Software Engineer', label: 'Software Engineer' },
  { value: 'Data Analyst', label: 'Data Analyst' },
  { value: 'UI/UX Designer', label: 'UI/UX Designer' },
  { value: 'QA Engineer', label: 'QA Engineer' },
  { value: 'Project Manager', label: 'Project Manager' },
];
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<CandidateApplication>({
    id: 0,
    candidateName: '',
    jobRequisition: '',
    appliedDate: '',
    currentStage: '',
    applicationStatus: '',
    notes: '',
  });
  const [editApplication, setEditApplication] = useState<CandidateApplication | null>(null);
    const handleJobChange = (selectedOption: any) => {
    setFormData((prev) => ({
        ...prev,
        jobRequisition: selectedOption ? selectedOption.value : '',
    }));
    };
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
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

    if (editApplication) {
      setApplications((prev) =>
        prev.map((application) => (application.id === editApplication.id ? formData : application))
      );
    } else {
      setApplications((prev) => [...prev, { ...formData, id: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      id: Date.now(),
      candidateName: '',
      jobRequisition: '',
      appliedDate: '',
      currentStage: '',
      applicationStatus: '',
      notes: '',
    });
    setEditApplication(null);
    setShowModal(true);
  };

  const handleEdit = (application: CandidateApplication) => {
    setEditApplication(application);
    setFormData(application);
    setShowModal(true);
  };

  return (
    <div className="candidate-applications-container">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Application
        </Button>
      </div>

      {applications.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>            
              <th>Job Requisition</th>
              <th>Applied Date</th>
              <th>Application Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>               
                <td>{application.jobRequisition}</td>
                <td>{application.appliedDate}</td>
                <td>{application.applicationStatus}</td>
                <td>{application.notes}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(application)}
                  >
                    Edit
                  </Button>{' '}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No applications added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editApplication ? 'Edit Application' : 'Add Application'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">             
              <Col>
              <Form.Group controlId="jobRequisition">
  <Form.Label>Job Requisition</Form.Label>
  <Select
    options={jobOptions}
    isSearchable
    placeholder="Search job requisition..."
    value={jobOptions.find(
      (option) => option.value === formData.jobRequisition
    )}
    onChange={handleJobChange}
  />
  {!formData.jobRequisition && validated && (
    <div className="text-danger mt-1">
      Please select job requisition.
    </div>
  )}
</Form.Group>

              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="appliedDate">
                  <Form.Label>Applied Date</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.appliedDate}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please select applied date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>  
               <Col md={6}>
                <Form.Group controlId="applicationStatus">
                  <Form.Label>Application Status</Form.Label>
                  <Form.Select
                    required
                    value={formData.applicationStatus}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select application status.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>           
            </Row>

            <Row className="mb-3">             
              <Col>
                <Form.Group controlId="notes">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please add some notes.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editApplication ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CandidateApplications;
