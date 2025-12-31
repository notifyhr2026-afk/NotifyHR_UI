import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ToggleSection from '../ToggleSection';
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

const EmployeeExperience: React.FC = () => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const [validated, setValidated] = useState(false);

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

  // Load employee data on mount
  useEffect(() => {
    if (employeeID) {
      const id = parseInt(employeeID);
      setFormData((prev) => ({ ...prev, employeeID: id }));

      employeeService.GetEmployeeDetialsByEmployeeID(id)
        .then((res) => {
          // Personal details
          if (res?.Table && res.Table.length > 0) {
            const emp = res.Table[0];
            setFormData({
              employeeID: id,
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

          // Experience details from Table2
          if (res?.Table2 && res.Table2.length > 0) {
            const expData = res.Table2.map((exp: any) => ({
              id: exp.ID,
              companyName: exp.CompanyName,
              jobTitle: exp.JobTitle,
              employmentType: exp.EmploymentType,
              startDate: exp.StartDate ? exp.StartDate.split('T')[0] : '',
              endDate: exp.EndDate ? exp.EndDate.split('T')[0] : '',
              isCurrent: exp.IsCurrent,
              reasonForLeaving: exp.ReasonForLeaving,
              location: exp.Location,
              description: exp.Description
            }));
            setExperiences(expData);
          }
        })
        .catch((err) => {
          console.error('Error fetching employee details:', err);
        });
    }
  }, [employeeID]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Submit employee data here (no toast)
  };

  // --- Experience handlers ---
  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setFormExpData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExpSave = () => {
    if (editExperience) {
      setExperiences((prev) =>
        prev.map((exp) => (exp.id === editExperience.id ? formExpData : exp))
      );
    } else {
      setExperiences((prev) => [...prev, { ...formExpData, id: Date.now() }]);
    }
    setShowModal(false);
    setEditExperience(null);
  };

  const handleExpEdit = (exp: Experience) => {
    setEditExperience(exp);
    setFormExpData(exp);
    setShowModal(true);
  };

  const handleExpDelete = (id: number) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
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
      {/* Experience Table */}
  
        <div className="text-end mb-3">
          <Button variant="success" onClick={handleExpAdd}>
            + Add Experience
          </Button>
        </div>
        {experiences.length ? (
          <Table striped bordered hover>
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
