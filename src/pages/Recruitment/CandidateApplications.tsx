import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';

/* ================== INTERFACES ================== */
interface CandidateApplication {
  id: number;
  candidateName: string;
  jobRequisition: string;
  appliedDate: string;
  currentStage: string;
  applicationStatus: string;
  notes: string;
}

interface CandidateInterview {
  id: number;
  applicationId: number;
  interviewDate: string;
  interviewer: string;
  interviewMode: string;
  status: string;
  feedback: string;
  rating: string;
  round: string;
}

/* ================== DROPDOWN DATA ================== */
const jobOptions = [
  { value: 'Software Engineer', label: 'Software Engineer' },
  { value: 'Data Analyst', label: 'Data Analyst' },
  { value: 'UI/UX Designer', label: 'UI/UX Designer' },
  { value: 'QA Engineer', label: 'QA Engineer' },
  { value: 'Project Manager', label: 'Project Manager' },
];

const employeeOptions = [
  { value: 'EMP101', label: 'EMP101 - Rahul' },
  { value: 'EMP102', label: 'EMP102 - Anita' },
  { value: 'EMP103', label: 'EMP103 - John' },
];

const roundOptions = [
  { value: '1st Round', label: '1st Round' },
  { value: 'Manager Round', label: 'Manager Round' },
  { value: 'HR Round', label: 'HR Round' },
];

/* ================== COMPONENT ================== */
const CandidateApplications: React.FC = () => {
  /* ================== APPLICATION STATE ================== */
  const [applications, setApplications] = useState<CandidateApplication[]>([
    {
      id: 1,
      candidateName: 'John Doe',
      jobRequisition: 'Software Engineer',
      appliedDate: '2023-12-01',
      currentStage: 'Interview',
      applicationStatus: 'Interview Scheduled',
      notes: 'Initial Interview Completed',
    },
    {
      id: 2,
      candidateName: 'Jane Smith',
      jobRequisition: 'Data Analyst',
      appliedDate: '2023-11-15',
      currentStage: 'Screening',
      applicationStatus: 'Under Review',
      notes: 'CV Review in Progress',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editApplication, setEditApplication] =
    useState<CandidateApplication | null>(null);

  const [formData, setFormData] = useState<CandidateApplication>({
    id: 0,
    candidateName: '',
    jobRequisition: '',
    appliedDate: '',
    currentStage: '',
    applicationStatus: '',
    notes: '',
  });

  /* ================== INTERVIEW STATE ================== */
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<CandidateApplication | null>(null);

  const [interviews, setInterviews] = useState<CandidateInterview[]>([
    {
      id: 1,
      applicationId: 1,
      interviewDate: '2023-12-05',
      interviewer: 'EMP101',
      interviewMode: 'Online',
      status: 'Scheduled',
      feedback: 'Good communication',
      rating: '4',
      round: '1st Round',
    },
  ]);

  const [editInterview, setEditInterview] =
    useState<CandidateInterview | null>(null);

  const [interviewForm, setInterviewForm] = useState<CandidateInterview>({
    id: 0,
    applicationId: 0,
    interviewDate: '',
    interviewer: '',
    interviewMode: '',
    status: '',
    feedback: '',
    rating: '',
    round: '',
  });

  /* ================== APPLICATION HANDLERS ================== */
  const handleJobChange = (selected: any) => {
    setFormData((prev) => ({
      ...prev,
      jobRequisition: selected ? selected.value : '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editApplication) {
      setApplications((prev) =>
        prev.map((a) => (a.id === editApplication.id ? formData : a))
      );
    } else {
      setApplications((prev) => [...prev, { ...formData, id: Date.now() }]);
    }

    setShowModal(false);
    setValidated(false);
  };

  const handleAdd = () => {
    setFormData({
      id: 0,
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

  /* ================== INTERVIEW HANDLERS ================== */
  const handleScheduleInterview = (application: CandidateApplication) => {
    setSelectedApplication(application);
    setInterviewForm({
      id: 0,
      applicationId: application.id,
      interviewDate: '',
      interviewer: '',
      interviewMode: '',
      status: '',
      feedback: '',
      rating: '',
      round: '',
    });
    setEditInterview(null);
    setShowInterviewModal(true);
  };

  const handleInterviewChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setInterviewForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleInterviewerChange = (selected: any) => {
    setInterviewForm((prev) => ({
      ...prev,
      interviewer: selected ? selected.value : '',
    }));
  };

  const handleRoundChange = (selected: any) => {
    setInterviewForm((prev) => ({
      ...prev,
      round: selected ? selected.value : '',
    }));
  };

  const saveInterview = () => {
    if (editInterview) {
      setInterviews((prev) =>
        prev.map((i) => (i.id === editInterview.id ? interviewForm : i))
      );
    } else {
      setInterviews((prev) => [
        ...prev,
        { ...interviewForm, id: Date.now() },
      ]);
    }
    setEditInterview(null);
  };

  const editInterviewRow = (interview: CandidateInterview) => {
    setEditInterview(interview);
    setInterviewForm(interview);
  };

  const deleteInterview = (id: number) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  /* ================== UI ================== */
  return (
    <div className="candidate-applications-container">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Application
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Job Requisition</th>
            <th>Applied Date</th>
            <th>Status</th>
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
                {application.applicationStatus === 'Interview Scheduled' && (
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() => handleScheduleInterview(application)}
                  >
                    Interview Scheduled
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ================== APPLICATION MODAL ================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editApplication ? 'Edit Application' : 'Add Application'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group>
              <Form.Label>Job Requisition</Form.Label>
              <Select
                options={jobOptions}
                value={jobOptions.find(
                  (o) => o.value === formData.jobRequisition
                )}
                onChange={handleJobChange}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Applied Date</Form.Label>
              <Form.Control
                type="date"
                id="appliedDate"
                value={formData.appliedDate}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                id="applicationStatus"
                value={formData.applicationStatus}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                id="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ================== INTERVIEW MODAL ================== */}
      <Modal
        show={showInterviewModal}
        onHide={() => setShowInterviewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Interview Scheduling</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Label>Interview Date</Form.Label>
              <Form.Control
                type="date"
                id="interviewDate"
                value={interviewForm.interviewDate}
                onChange={handleInterviewChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Interviewer</Form.Label>
              <Select
                options={employeeOptions}
                value={employeeOptions.find(
                  (o) => o.value === interviewForm.interviewer
                )}
                onChange={handleInterviewerChange}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={4}>
              <Form.Label>Interview Mode</Form.Label>
              <Form.Select
                id="interviewMode"
                value={interviewForm.interviewMode}
                onChange={handleInterviewChange}
              >
                <option value="">Select</option>
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                id="status"
                value={interviewForm.status}
                onChange={handleInterviewChange}
              >
                <option value="">Select</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Round</Form.Label>
              <Select
                options={roundOptions}
                value={roundOptions.find(
                  (o) => o.value === interviewForm.round
                )}
                onChange={handleRoundChange}
              />
            </Col>
          </Row>

          <Button className="mt-3" onClick={saveInterview}>
            + Add Interview
          </Button>

          <Table bordered striped className="mt-3">
            <thead>
              <tr>
                <th>Date</th>
                <th>Interviewer</th>
                <th>Round</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews
                .filter(
                  (i) =>
                    i.applicationId === selectedApplication?.id
                )
                .map((i) => (
                  <tr key={i.id}>
                    <td>{i.interviewDate}</td>
                    <td>{i.interviewer}</td>
                    <td>{i.round}</td>
                    <td>{i.interviewMode}</td>
                    <td>{i.status}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => editInterviewRow(i)}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deleteInterview(i.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CandidateApplications;
