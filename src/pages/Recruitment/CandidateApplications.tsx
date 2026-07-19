import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select from 'react-select';
import candidateService from '../../services/candidateService';

/* ================== INTERFACES ================== */
interface CandidateApplication {
  id: number;
  applicationID?: number;
  candidateID?: number;
  candidateName?: string;
  jobRequisition: string;
  appliedDate: string;
  currentStage: string;
  applicationStatus: string;
  notes: string;
  expectedMinSalary?: number;
  expectedMaxSalary?: number;
}

interface CandidateInterview {
  id: number;
  interviewID?: number;
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

const emptyApplication: CandidateApplication = {
  id: 0,
  candidateName: '',
  jobRequisition: '',
  appliedDate: '',
  currentStage: '',
  applicationStatus: '',
  notes: '',
  expectedMinSalary: 0,
  expectedMaxSalary: 0,
};

const emptyInterview: CandidateInterview = {
  id: 0,
  applicationId: 0,
  interviewDate: '',
  interviewer: '',
  interviewMode: '',
  status: '',
  feedback: '',
  rating: '',
  round: '',
};

const CandidateApplications: React.FC = () => {
  const { CandidateID } = useParams<{ CandidateID: string }>();
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {};
  const organizationID = user?.organizationID || 0;

  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [savingApplication, setSavingApplication] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editApplication, setEditApplication] = useState<CandidateApplication | null>(null);
  const [formData, setFormData] = useState<CandidateApplication>(emptyApplication);

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<CandidateApplication | null>(null);
  const [interviews, setInterviews] = useState<CandidateInterview[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [editInterview, setEditInterview] = useState<CandidateInterview | null>(null);
  const [interviewForm, setInterviewForm] = useState<CandidateInterview>(emptyInterview);
  const [savingInterview, setSavingInterview] = useState(false);

  const mapApplication = (item: any): CandidateApplication => ({
    id: item.ApplicationID ?? item.applicationID ?? item.id ?? 0,
    applicationID: item.ApplicationID ?? item.applicationID ?? item.id ?? 0,
    candidateID: item.CandidateID ?? item.candidateID ?? Number(CandidateID) ?? 0,
    candidateName: item.CandidateName ?? item.candidateName ?? '',
    jobRequisition: item.JobRequisition ?? item.jobRequisition ?? item.JobTitle ?? '',
    appliedDate: item.AppliedDate ?? item.appliedDate ?? '',
    currentStage: item.CurrentStage ?? item.currentStage ?? '',
    applicationStatus: item.ApplicationStatus ?? item.applicationStatus ?? '',
    notes: item.Notes ?? item.notes ?? '',
    expectedMinSalary: item.ExpectedMinSalary ?? item.expectedMinSalary ?? 0,
    expectedMaxSalary: item.ExpectedMaxSalary ?? item.expectedMaxSalary ?? 0,
  });

  const mapInterview = (item: any): CandidateInterview => ({
    id: item.InterviewID ?? item.interviewID ?? item.id ?? Date.now(),
    interviewID: item.InterviewID ?? item.interviewID ?? item.id ?? 0,
    applicationId: item.ApplicationID ?? item.applicationID ?? item.applicationId ?? 0,
    interviewDate: item.InterviewDate ?? item.interviewDate ?? '',
    interviewer: item.Interviewer ?? item.interviewer ?? '',
    interviewMode: item.InterviewMode ?? item.interviewMode ?? '',
    status: item.Status ?? item.status ?? '',
    feedback: item.Feedback ?? item.feedback ?? '',
    rating: item.Rating ?? item.rating ?? '',
    round: item.Round ?? item.round ?? '',
  });

  const loadApplications = async () => {
    if (!CandidateID || !organizationID) {
      return;
    }

    try {
      setLoadingApplications(true);
      const response = await candidateService.GetCandidateApplicationsAsync(
        organizationID,
        Number(CandidateID)
      );
      const result = Array.isArray(response) ? response : [response];
      setApplications(result.map(mapApplication));
    } catch (error) {
      console.error(error);
      toast.error('Unable to load applications.');
    } finally {
      setLoadingApplications(false);
    }
  };

  const loadInterviews = async (applicationId: number) => {
    if (!CandidateID || !organizationID || !applicationId) {
      setInterviews([]);
      return;
    }

    try {
      setLoadingInterviews(true);
      const response = await candidateService.GetCandidateInterviewsAsync(
        organizationID,
        Number(CandidateID),
        applicationId
      );
      const result = Array.isArray(response) ? response : [response];
      setInterviews(result.map(mapInterview));
    } catch (error) {
      console.error(error);
      toast.error('Unable to load interviews.');
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [CandidateID, organizationID]);

  useEffect(() => {
    if (selectedApplication?.id) {
      loadInterviews(selectedApplication.id);
    } else {
      setInterviews([]);
    }
  }, [selectedApplication, CandidateID, organizationID]);

  const handleJobChange = (selected: any) => {
    setFormData((prev) => ({
      ...prev,
      jobRequisition: selected ? selected.value : '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'expectedMinSalary' || id === 'expectedMaxSalary'
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!CandidateID || !organizationID) {
      toast.error('Missing candidate or organization information.');
      return;
    }

    try {
      setSavingApplication(true);
      const payload = {
        applicationID: editApplication?.applicationID ?? 0,
        candidateID: Number(CandidateID),
        organizationID,
        jobRequisition: formData.jobRequisition,
        appliedDate: formData.appliedDate,
        currentStage: formData.currentStage,
        applicationStatus: formData.applicationStatus,
        notes: formData.notes,
        expectedMinSalary: formData.expectedMinSalary,
        expectedMaxSalary: formData.expectedMaxSalary,
      };

      await candidateService.SaveCandidateApplicationAsync(payload);
      toast.success('Application saved successfully.');
      setShowModal(false);
      setEditApplication(null);
      setFormData(emptyApplication);
      await loadApplications();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save application.');
    } finally {
      setSavingApplication(false);
    }
  };

  const handleAdd = () => {
    setFormData(emptyApplication);
    setEditApplication(null);
    setShowModal(true);
  };

  const handleEdit = (application: CandidateApplication) => {
    setEditApplication(application);
    setFormData(application);
    setShowModal(true);
  };

  const handleScheduleInterview = (application: CandidateApplication) => {
    setSelectedApplication(application);
    setInterviewForm({
      ...emptyInterview,
      applicationId: application.id,
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

  const saveInterview = async () => {
    if (!CandidateID || !organizationID || !selectedApplication) {
      toast.error('Missing interview context.');
      return;
    }

    try {
      setSavingInterview(true);
      const payload = {
        interviewID: editInterview?.interviewID ?? 0,
        applicationID: selectedApplication.id,
        candidateID: Number(CandidateID),
        organizationID,
        interviewDate: interviewForm.interviewDate,
        interviewer: interviewForm.interviewer,
        interviewMode: interviewForm.interviewMode,
        status: interviewForm.status,
        feedback: interviewForm.feedback,
        rating: interviewForm.rating,
        round: interviewForm.round,
      };

      await candidateService.SaveCandidateInterviewAsync(payload);
      toast.success('Interview saved successfully.');
      setEditInterview(null);
      setInterviewForm({ ...emptyInterview, applicationId: selectedApplication.id });
      await loadInterviews(selectedApplication.id);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save interview.');
    } finally {
      setSavingInterview(false);
    }
  };

  const editInterviewRow = (interview: CandidateInterview) => {
    setEditInterview(interview);
    setInterviewForm(interview);
    setShowInterviewModal(true);
  };

  const deleteInterview = (id: number) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="candidate-applications-container">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Application
        </Button>
      </div>

      {loadingApplications ? (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" /> Loading applications...
        </div>
      ) : (
        <Table className="table table-hover table-dark-custom">
          <thead>
            <tr>
              <th>Job Requisition</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Expected Salary (Min - Max Lacs)</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.jobRequisition}</td>
                  <td>{application.appliedDate}</td>
                  <td>{application.applicationStatus}</td>
                  <td>
                    {application.expectedMinSalary} - {application.expectedMaxSalary}
                  </td>
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
              ))
            )}
          </tbody>
        </Table>
      )}

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
                value={jobOptions.find((o) => o.value === formData.jobRequisition)}
                onChange={handleJobChange}
                className="org-select"
                classNamePrefix="org-select"
              />
            </Form.Group>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Applied Date</Form.Label>
                  <Form.Control
                    type="date"
                    id="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Expected Min Salary (Lacs)</Form.Label>
                  <Form.Control
                    type="number"
                    id="expectedMinSalary"
                    value={formData.expectedMinSalary}
                    onChange={handleInputChange}
                    min={0}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Expected Max Salary (Lacs)</Form.Label>
                  <Form.Control
                    type="number"
                    id="expectedMaxSalary"
                    value={formData.expectedMaxSalary}
                    onChange={handleInputChange}
                    min={0}
                  />
                </Form.Group>
              </Col>
            </Row>

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
              <Button type="submit" variant="primary" disabled={savingApplication}>
                {savingApplication ? 'Saving…' : 'Save'}
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
                value={employeeOptions.find((o) => o.value === interviewForm.interviewer)}
                onChange={handleInterviewerChange}
                className="org-select"
                classNamePrefix="org-select"
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
                value={roundOptions.find((o) => o.value === interviewForm.round)}
                onChange={handleRoundChange}
                className="org-select"
                classNamePrefix="org-select"
              />
            </Col>
          </Row>

          <Button className="mt-3" onClick={saveInterview} disabled={savingInterview || !selectedApplication}>
            {savingInterview ? 'Saving…' : '+ Add Interview'}
          </Button>

          {loadingInterviews ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" /> Loading interviews...
            </div>
          ) : (
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
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No interviews scheduled.
                    </td>
                  </tr>
                ) : (
                  interviews
                    .filter((i) => i.applicationId === selectedApplication?.id)
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
                    ))
                )}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CandidateApplications;
