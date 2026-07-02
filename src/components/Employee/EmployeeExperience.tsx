import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEmployee } from '../../context/EmployeeContext';
import employeeService from '../../services/employeeService';

interface Experience {
  id: number;
  companyName: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  reasonForLeaving: string;
  location: string;
  description: string;
}

interface Props {
  employeeID?: number;
  hidePersonalDetails?: boolean;
}

const EmployeeExperience: React.FC<Props> = ({ employeeID: propEmployeeID, hidePersonalDetails }) => {
  const { employeeID: urlEmployeeID } = useParams<{ employeeID: string }>();
  const { getEmployeeDetails } = useEmployee();
  const [validated, setValidated] = useState(false);
 const data: any = localStorage.getItem('user');
    const user = JSON.parse(data || '{}');
    const organizationID = user?.organizationID || 0;
  const empID = propEmployeeID || (urlEmployeeID ? parseInt(urlEmployeeID) : 0);

  const [formData, setFormData] = useState({
    employeeID: 0,
    organizationID: 0,
    firstName: '',
    middleName: '',
    lastName: '',
    employeeCode: '',
    dob: '',
    gender: '',
    officialEmail: '',
    dateOfJoining: '',
    maritalStatus: '',
    createdBy: 'admin',
    pan: '',
    aadhar: '',
    passportNumber: ''
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editExperience, setEditExperience] = useState<Experience | null>(null);
  const [formExpData, setFormExpData] = useState<Experience>({
    id: 0,
    companyName: '',
    jobTitle: '',
    employmentType: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    reasonForLeaving: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (empID) {
      setFormData((prev) => ({ ...prev, employeeID: empID }));

      if (!hidePersonalDetails) {
        getEmployeeDetails(empID,organizationID)
          .then((res) => {
            if (res?.Table && res.Table.length > 0) {
              const emp = res.Table[0];
              setFormData({
                employeeID: empID,
                organizationID: emp.OrganizationID || 0,
                firstName: emp.FirstName || '',
                middleName: emp.MiddleName || '',
                lastName: emp.LastName || '',
                employeeCode: emp.EmployeeCode || '',
                dob: emp.DOB ? emp.DOB.split('T')[0] : '',
                gender: emp.Gender || '',
                officialEmail: emp.OfficialEmail || '',
                dateOfJoining: emp.DateOfJoining ? emp.DateOfJoining.split('T')[0] : '',
                maritalStatus: emp.MaritalStatus || '',
                createdBy: 'admin',
                pan: emp.PAN || '',
                aadhar: emp.Aadhar || '',
                passportNumber: emp.PassportNumber || ''
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching employee details:', err);
          });
      }

      loadExperiences();
    }
  }, [empID]);

  const loadExperiences = async () => {
    if (!empID) return;
    try {
      const res = await employeeService.GetEmployeeExperiences(empID);
      const list = res?.Table || [];
      setExperiences(
        list.map((exp: any) => ({
          id: exp.ExperienceID || exp.experienceID || exp.id || 0,
          companyName: exp.CompanyName || exp.companyName || '',
          jobTitle: exp.JobTitle || exp.jobTitle || '',
          employmentType: exp.EmploymentType || exp.employmentType || '',
          startDate: (exp.StartDate || exp.startDate || '').split('T')[0],
          endDate: (exp.EndDate || exp.endDate || '').split('T')[0],
          isCurrent: exp.IsCurrent || exp.isCurrent || false,
          reasonForLeaving: exp.ReasonForLeaving || exp.reasonForLeaving || '',
          location: exp.Location || exp.location || '',
          description: exp.Description || exp.description || ''
        }))
      );
    } catch (err) {
      console.error('Error loading experiences:', err);
    }
  };

  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    setValidated(true);

    if (!form.checkValidity()) {
      return;
    }
  };

  // --- Experience handlers ---
  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setFormExpData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExpSave = async () => {
    const payload: any = {
      experienceID: editExperience ? editExperience.id : 0,
      employeeID: empID,
      companyName: formExpData.companyName,
      jobTitle: formExpData.jobTitle,
      employmentType: formExpData.employmentType,
      startDate: formExpData.startDate,
      endDate: formExpData.isCurrent ? null : formExpData.endDate,
      reasonForLeaving: formExpData.reasonForLeaving,
      location: formExpData.location,
      description: formExpData.description,
      isCurrent: formExpData.isCurrent,
      isActive: true,
      isDeleted: false,
    };

    try {
      const res = await employeeService.SaveEmployeeExperience(payload);
      const msg = Array.isArray(res) && res[0]?.msg ? res[0].msg : (editExperience ? 'Experience updated' : 'Experience added');
      toast.success(msg);
      setShowModal(false);
      setEditExperience(null);
      await loadExperiences();
    } catch (err) {
      toast.error('Failed to save experience');
    }
  };

  const handleExpEdit = (exp: Experience) => {
    setEditExperience(exp);
    setFormExpData(exp);
    setShowModal(true);
  };

  const handleExpDelete = async (id: number) => {
    const record = experiences.find((e) => e.id === id);
    if (!record) return;
    try {
      const res = await employeeService.DeleteExperienceAsync(id, empID);
      const msg = Array.isArray(res) && res[0]?.msg ? res[0].msg : 'Experience deleted';
      toast.success(msg);
      await loadExperiences();
    } catch (err) {
      toast.error('Failed to delete experience');
    }
  };

  const handleExpAdd = () => {
    setFormExpData({
      id: 0,
      companyName: '',
      jobTitle: '',
      employmentType: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      reasonForLeaving: '',
      location: '',
      description: ''
    });
    setEditExperience(null);
    setShowModal(true);
  };

  return (
    <>
      {!hidePersonalDetails && (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control required type="text" value={formData.firstName} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control required type="text" value={formData.lastName} onChange={handleChange} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="employeeCode">
              <Form.Label>Employee Code</Form.Label>
              <Form.Control type="text" value={formData.employeeCode} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="officialEmail">
              <Form.Label>Official Email</Form.Label>
              <Form.Control required type="email" value={formData.officialEmail} onChange={handleChange} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="4" controlId="dob">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" value={formData.dob} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="gender">
              <Form.Label>Gender</Form.Label>
              <Form.Select value={formData.gender} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="maritalStatus">
              <Form.Label>Marital Status</Form.Label>
              <Form.Select value={formData.maritalStatus} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="4" controlId="pan">
              <Form.Label>PAN</Form.Label>
              <Form.Control type="text" value={formData.pan} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="aadhar">
              <Form.Label>Aadhar</Form.Label>
              <Form.Control type="text" value={formData.aadhar} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="passportNumber">
              <Form.Label>Passport Number</Form.Label>
              <Form.Control type="text" value={formData.passportNumber} onChange={handleChange} />
            </Form.Group>
          </Row>
          <Button variant="primary" type="submit">Update Profile</Button>
        </Form>
      )}

      {/* Experience Table */}
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleExpAdd}>
          + Add Experience
        </Button>
      </div>
      {experiences.length ? (
        <Table className="table table-hover table-dark-custom">
          <thead>
            <tr>
              <th>Company</th>
              <th>Job Title</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.companyName}</td>
                <td>{exp.jobTitle}</td>
                <td>{exp.employmentType}</td>
                <td>
                  {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                </td>
                <td>{exp.reasonForLeaving}</td>
                <td>{exp.location}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleExpEdit(exp)}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleExpDelete(exp.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No experience added yet.</p>
      )}

      {/* Add/Edit Experience Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editExperience ? 'Edit Experience' : 'Add Experience'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="companyName">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formExpData.companyName}
                    onChange={handleExpChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="jobTitle">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formExpData.jobTitle}
                    onChange={handleExpChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="employmentType">
                  <Form.Label>Employment Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={formExpData.employmentType}
                    onChange={handleExpChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="location">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={formExpData.location}
                    onChange={handleExpChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="startDate">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formExpData.startDate}
                    onChange={handleExpChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="endDate">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formExpData.endDate}
                    onChange={handleExpChange}
                    disabled={formExpData.isCurrent}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="isCurrent" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Currently Working Here"
                checked={formExpData.isCurrent}
                onChange={handleExpChange}
              />
            </Form.Group>
            <Form.Group controlId="reasonForLeaving" className="mb-3">
              <Form.Label>Reason For Leaving</Form.Label>
              <Form.Control
                type="text"
                value={formExpData.reasonForLeaving}
                onChange={handleExpChange}
                disabled={formExpData.isCurrent}
              />
            </Form.Group>
            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formExpData.description}
                onChange={handleExpChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExpSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmployeeExperience;
