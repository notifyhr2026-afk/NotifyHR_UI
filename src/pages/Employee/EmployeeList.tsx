import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Pagination,
} from 'react-bootstrap';
import employeeService from '../../services/employeeService';
import branchService from '../../services/branchService';
import departmentService from '../../services/departmentService';
import { toast } from 'react-toastify';
import { Employee } from '../../types/Employee';

// ===== Dropdown Type =====
interface DropdownItem {
  id: number;
  name: string;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  // ===== Filters =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');

  // ===== Pagination =====
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ===== Dropdowns =====
  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);

  // ===== UI States =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID: number = user?.organizationID;

  // ===== Employee Form =====
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
    personalPhone: '',
    workPhone: '',
    personalEmail: '',
  });

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [empData, branchData, deptData] = await Promise.all([
          employeeService.getEmployeesByOrganizationIdAsync(organizationID),
          branchService.getBranchesAsync(organizationID),
          departmentService.getdepartmentesAsync(organizationID),
        ]);

        const empList = Array.isArray(empData) ? empData : empData?.Table || [];
        const branchList = Array.isArray(branchData) ? branchData : branchData?.Table || [];
        const deptList = Array.isArray(deptData) ? deptData : deptData?.Table || [];

        setEmployees(empList);
        setFilteredEmployees(empList);

        setBranches(
          branchList.map((b: any) => ({
            id: b.BranchID || b.id,
            name: b.BranchName || b.name,
          }))
        );

        setDepartments(
          deptList.map((d: any) => ({
            id: d.DepartmentID || d.id,
            name: d.DepartmentName || d.name,
          }))
        );
      } catch (err) {
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= FILTER + SEARCH =================
  useEffect(() => {
    let filtered = employees.filter((emp: any) => {
      const matchesSearch =
        emp.EmployeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.EmployeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch =
        selectedBranch === '' ? true : emp.BranchID === selectedBranch;

      const matchesDepartment =
        selectedDepartment === '' ? true : emp.DepartmentID === selectedDepartment;

      return matchesSearch && matchesBranch && matchesDepartment;
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees, selectedBranch, selectedDepartment]);

  // ================= PAGINATION =================
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ================= SAVE EMPLOYEE =================
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
        personalPhone: newEmp.personalPhone,
        workPhone: newEmp.workPhone,
        personalEmail: newEmp.personalEmail,
      };

      const newEmployeeID = await employeeService.createEmployee(payload);

      if (newEmployeeID) {
        toast.success(`Employee created (ID: ${newEmployeeID})`);

        const data = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
        setEmployees(data);
        setFilteredEmployees(data);

        setShowModal(false);
      }
    } catch (error) {
      toast.error('Error saving employee');
    } finally {
      setSaving(false);
    }
  };

  // ================= UI =================
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container">
      <h2 className="mb-4">Employee List</h2>

      {/* FILTERS */}
<div className="d-flex align-items-center gap-3 mb-3 flex-nowrap overflow-auto">

  <Form.Control
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ maxWidth: 250, minWidth: 200 }}
  />

  <Form.Select
    value={selectedBranch}
    onChange={(e) =>
      setSelectedBranch(e.target.value ? Number(e.target.value) : '')
    }
    style={{ minWidth: 180 }}
  >
    <option value="">All Branches</option>
    {branches.map((b) => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ))}
  </Form.Select>

  <Form.Select
    value={selectedDepartment}
    onChange={(e) =>
      setSelectedDepartment(e.target.value ? Number(e.target.value) : '')
    }
    style={{ minWidth: 180 }}
  >
    <option value="">All Departments</option>
    {departments.map((d) => (
      <option key={d.id} value={d.id}>{d.name}</option>
    ))}
  </Form.Select>

  <Button
    variant="outline-secondary"
    onClick={() => {
      setSearchTerm('');
      setSelectedBranch('');
      setSelectedDepartment('');
    }}
    style={{ whiteSpace: "nowrap" }}
  >
    Clear
  </Button>

  <Button
    variant="success"
    onClick={() => setShowModal(true)}
    style={{ whiteSpace: "nowrap" }}
  >
    + Add Employee
  </Button>

</div>
      {/* TABLE */}
      <table className="table table-dark-custom">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Email</th>
            <th>DOJ</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {currentEmployees.map((emp) => (
            <tr key={emp.EmployeeID}>
              <td>{emp.EmployeeName}</td>
              <td>{emp.EmployeeCode}</td>
              <td>{emp.OfficialEmail}</td>
              <td>{emp.DateOfJoining}</td>
              <td>
                <Button
                  size="sm"
                  onClick={() => navigate(`/Employees/manageEmployee/${emp.EmployeeID}`)}
                >
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <Pagination>
        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />

        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === currentPage}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>

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
              {/* CONTACT NEW */}
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group controlId="personalPhone">
                                                <Form.Label>Personal Phone</Form.Label>
                                                <Form.Control required value={newEmp.personalPhone} onChange={(e) => setNewEmp({ ...newEmp, personalPhone: e.target.value })}/>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="workPhone">
                                                <Form.Label>Work Phone</Form.Label>
                                                <Form.Control required value={newEmp.workPhone} onChange={(e) => setNewEmp({ ...newEmp, workPhone: e.target.value })}/>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="personalEmail">
                                                <Form.Label>Personal Email</Form.Label>
                                                <Form.Control type="email" required value={newEmp.personalEmail} onChange={(e) => setNewEmp({ ...newEmp, personalEmail: e.target.value })}/>
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
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
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
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
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