import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import employeeService from '../../services/employeeService';
import { toast } from 'react-toastify';
import { Employee } from '../../types/Employee';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID: number | undefined = user?.organizationID;

  const [newEmp, setNewEmp] = useState<Employee>({
    EmployeeID: 0,
    OrganizationID: organizationID || 0,
    FirstName: '',
    MiddleName: '',
    LastName: '',
    EmployeeCode: '',
    DateOfBirth: '',
    Gender: '',
    OfficialEmail: '',
    DateOfJoining: '',
    MaritalStatus: '',
    EmployeeName: '',
    PAN: '',
    Aadhar: '',
    PassportNumber: '',
  });

  // ✅ Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getEmployees();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err) {
        setError('Error loading employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Search Filter
  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.EmployeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.EmployeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // ✅ Save Employee
  const handleSaveEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setSaving(true);

    try {
      // ✅ Build request payload (camelCase keys for API)
      const payload = {
        organizationID: newEmp.OrganizationID,
        firstName: newEmp.FirstName,
        middleName: newEmp.MiddleName || null,
        lastName: newEmp.LastName,
        employeeCode: newEmp.EmployeeCode,
        dob: newEmp.DateOfBirth,
        dateOfJoining: newEmp.DateOfJoining,
        gender: newEmp.Gender,
        officialEmail: newEmp.OfficialEmail,
        maritalStatus: newEmp.MaritalStatus,
        createdBy: 'admin',
        pan: newEmp.PAN,
        aadhar: newEmp.Aadhar,
        passportNumber: newEmp.PassportNumber,
      };

      console.log('🔹 Sending Employee Payload:', payload);

      const newEmployeeID = await employeeService.createEmployee(payload);

      if (newEmployeeID) {
        toast.success(`✅ Employee created successfully (ID: ${newEmployeeID})`);

        const data = await employeeService.getEmployees();
        setEmployees(data);
        setFilteredEmployees(data);

        setShowModal(false);
        setValidated(false);
        setNewEmp({
          EmployeeID: 0,
          OrganizationID: organizationID || 0,
          FirstName: '',
          MiddleName: '',
          LastName: '',
          EmployeeCode: '',
          DateOfBirth: '',
          Gender: '',
          OfficialEmail: '',
          DateOfJoining: '',
          MaritalStatus: '',
          EmployeeName: '',
          PAN: '',
          Aadhar: '',
          PassportNumber: '',
        });
      } else {
        toast.error('❌ Failed to create employee.');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('⚠️ Something went wrong while saving employee.');
    } finally {
      setSaving(false);
      setValidated(true);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="mt-5">
      <h2 className="mb-4">Employee List</h2>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center flex-grow-1" style={{ maxWidth: '450px' }}>
          <Form.Control
            type="text"
            placeholder="Search by employee name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="toggle-tooltip">Open Manage Page in New Tab</Tooltip>}
        >
          <Form.Check
            type="switch"
            id="openInNewTabSwitch"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            className="ms-3 mt-2 mt-md-0"
          />
        </OverlayTrigger>

        <Button variant="success" className="mt-2 mt-md-0" onClick={() => setShowModal(true)}>
          + Add New Employee
        </Button>
      </div>

      {/* ✅ Employee Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Employee Name</th>
              <th>Employee Code</th>
              <th>Official Email</th>
              <th>Date of Joining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.EmployeeID}>
                  <td>{emp.EmployeeName}</td>
                  <td>{emp.EmployeeCode}</td>
                  <td>{emp.OfficialEmail || '-'}</td>
                  <td>
                    {emp.DateOfJoining
                      ? new Date(emp.DateOfJoining).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const path = `/Employees/manageEmployee/${emp.EmployeeID}`;
                        if (openInNewTab) {
                          window.open(path, '_blank');
                        } else {
                          navigate(path);
                        }
                      }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Add Employee Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSaveEmployee}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={newEmp.FirstName}
                    onChange={(e) => setNewEmp({ ...newEmp, FirstName: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter first name
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="middleName">
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmp.MiddleName}
                    onChange={(e) => setNewEmp({ ...newEmp, MiddleName: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={newEmp.LastName}
                    onChange={(e) => setNewEmp({ ...newEmp, LastName: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter last name
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="employeeCode">
                  <Form.Label>Employee Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={newEmp.EmployeeCode}
                    onChange={(e) => setNewEmp({ ...newEmp, EmployeeCode: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter employee code
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="officialEmail">
                  <Form.Label>Official Email</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    value={newEmp.OfficialEmail}
                    onChange={(e) => setNewEmp({ ...newEmp, OfficialEmail: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="dob">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={newEmp.DateOfBirth}
                    onChange={(e) => setNewEmp({ ...newEmp, DateOfBirth: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please select date of birth
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="dateOfJoining">
                  <Form.Label>Date of Joining</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={newEmp.DateOfJoining}
                    onChange={(e) => setNewEmp({ ...newEmp, DateOfJoining: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please select date of joining
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    required
                    value={newEmp.Gender}
                    onChange={(e) => setNewEmp({ ...newEmp, Gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select gender
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="maritalStatus">
                  <Form.Label>Marital Status</Form.Label>
                  <Form.Select
                    required
                    value={newEmp.MaritalStatus}
                    onChange={(e) => setNewEmp({ ...newEmp, MaritalStatus: e.target.value })}
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select marital status
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ✅ PAN, Aadhar, Passport */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="pan">
                  <Form.Label>PAN</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={newEmp.PAN}
                    onChange={(e) => setNewEmp({ ...newEmp, PAN: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    PAN is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="aadhar">
                  <Form.Label>Aadhar</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={newEmp.Aadhar}
                    onChange={(e) => setNewEmp({ ...newEmp, Aadhar: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">
                    Aadhar is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="passport">
                  <Form.Label>Passport Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmp.PassportNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, PassportNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" className="me-2" /> : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeList;
