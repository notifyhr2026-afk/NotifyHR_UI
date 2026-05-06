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
import { toast } from 'react-toastify';
import { Employee } from '../../types/Employee';
import Select from 'react-select';

// ===== Dropdown Type =====
interface DropdownItem {
  id: number;
  name: string;
}

// ===== Sample fallback data =====


const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  // ===== Filters (existing) =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');

  // ===== NEW FILTER MODAL =====
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [tempFilters, setTempFilters] = useState({
    search: '',
    branchID: '',
    departmentID: '',
  });

  // ===== Pagination =====
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ===== Dropdowns =====
  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);
  const [divisions, setDivisions] = useState<DropdownItem[]>([]);
  const [positions, setPositions] = useState<DropdownItem[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<DropdownItem[]>([]);
  // ===== UI States =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID: number = user?.organizationID;

  // ===== Employee Form (unchanged) =====
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
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const data = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);

      const empList = Array.isArray(data) ? data : data?.Table || [];

      if (empList.length > 0) {
        setEmployees(empList);
        setFilteredEmployees(empList);
      } else {
        // fallback sample data
        setEmployees(employees);
        setFilteredEmployees(employees);
      }

    } catch (err) {
      setError('Error loading data');
      setEmployees(employees);
      setFilteredEmployees(employees);
    } finally {
      setLoading(false);
    }
  };
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
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [filtersData] = await Promise.all([
          employeeService.GetEmployeeFiltersDataAsync(organizationID)          
        ]);

        const branchList = filtersData?.Table ||  [];
        const divisionList = filtersData?.Table1 || [];
        const deptList = filtersData?.Table2 || [];
        const positionList = filtersData?.Table3 || [];
        const employmentTypeList = filtersData?.Table4 || [];
        setBranches(
          branchList.map((b: any) => ({
            id: b.BranchID || b.id,
            name: b.BranchName || b.name,
          }))
        );

        setDivisions(
          divisionList.map((d: any) => ({
            id: d.DivisionID || d.id,
            name: d.DivisionName || d.name,
          }))
        );

        setDepartments(
          deptList.map((d: any) => ({
            id: d.DepartmentID || d.id,
            name: d.DepartmentName || d.name,
          }))
        );

        setPositions(
          positionList.map((p: any) => ({
            id: p.PositionID || p.id,
            name: p.PositionTitle || p.name,
          }))
        );
        setEmploymentTypes(
          employmentTypeList.map((e: any) => ({
            id: e.EmploymentTypeID || e.id,
            name: e.EmploymentTypeName || e.name,
          }))
        );


      } catch {
        setBranches([{ id: 1, name: "Sample Branch" }]);
        setDepartments([{ id: 1, name: "Sample Dept" }]);
        setDivisions([{ id: 1, name: "Sample Division" }]);
        setPositions([{ id: 1, name: "Sample Position" }]);
        setEmploymentTypes([{ id: 1, name: "Sample Employment Type" }]);

      }
    };

    loadDropdowns();
    fetchEmployees();
  }, []);

  // ================= LOCAL FILTER (EXISTING - unchanged) =================
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

  // ================= PAGINATION (UNCHANGED) =================
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ================= APPLY FILTER FROM MODAL =================
  const applyPopupFilters = () => {
    const filtered = employees.filter((emp: any) => {
      const matchesSearch =
        tempFilters.search === '' ||
        emp.EmployeeName?.toLowerCase().includes(tempFilters.search.toLowerCase()) ||
        emp.EmployeeCode?.toLowerCase().includes(tempFilters.search.toLowerCase());

      const matchesBranch =
        tempFilters.branchID === '' ? true : emp.BranchID === Number(tempFilters.branchID);

      const matchesDept =
        tempFilters.departmentID === '' ? true : emp.DepartmentID === Number(tempFilters.departmentID);

      return matchesSearch && matchesBranch && matchesDept;
    });

    setFilteredEmployees(filtered);
    setShowFilterModal(false);
    setCurrentPage(1);
  };

  // ================= UI =================
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container">

      <h2 className="mb-4">Employee List</h2>

      {/* FILTER BAR (UNCHANGED) */}
      <div className="d-flex align-items-center gap-3 mb-3 flex-nowrap overflow-auto">

        <Form.Control
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 250, minWidth: 200 }}
        />

        <Button
          variant="primary"
          onClick={() => setShowFilterModal(true)}
        >
          Advanced Filters
        </Button>

        <Button
          variant="success"
          onClick={() => setShowModal(true)}
        >
          + Add Employee
        </Button>

      </div>

      {/* TABLE (UNCHANGED) */}
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

      {/* PAGINATION (UNCHANGED) */}
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

      {/* ================= FILTER POPUP (NEW) ================= */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Advanced Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
       <div className="row mb-3">
         <div className="col"> <Form.Control
            className="mb-2"
            placeholder="Search name/code"
            value={tempFilters.search}
            onChange={(e) =>
              setTempFilters({ ...tempFilters, search: e.target.value })
            }
          />
        </div>
         <div className="col">   <Select
        placeholder="Select Branch"
        options={branches.map(b => ({
          value: b.id,
          label: b.name
        }))}
        onChange={(val: any) =>
          setTempFilters({ ...tempFilters, branchID: val?.value || '' })
        }
        />
        </div>
         </div>
         <div className="row mb-4">
         <div className="col">   <Select
              placeholder="Select division"
              options={divisions.map(d => ({
                value: d.id,
                label: d.name
              }))}
              onChange={(val: any) =>
                setTempFilters({ ...tempFilters, departmentID: val?.value || '' })
              }
            />
            </div>
      
          <div className="col"> <Select
              placeholder="Select Department"
              options={departments.map(d => ({
                value: d.id,
                label: d.name
              }))}
              onChange={(val: any) =>
                setTempFilters({ ...tempFilters, departmentID: val?.value || '' })
              }/></div> 
              </div>
         <div className="row">
          <div className="col"><Select
              placeholder="Select position"
              options={positions.map(p => ({
                value: p.id,
                label: p.name
              }))}
              onChange={(val: any) =>
                setTempFilters({ ...tempFilters, departmentID: val?.value || '' })
              }/></div>
          <div className="col"><Select
              placeholder="Select employment type"
              options={employmentTypes.map(et => ({
                value: et.id,
                label: et.name
              }))}
              onChange={(val: any) =>
                setTempFilters({ ...tempFilters, departmentID: val?.value || '' })
              }/>
              </div>
          </div>   
        
   

        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Close
          </Button>

          <Button variant="primary" onClick={applyPopupFilters}>
            Fetch Data
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= ADD EMPLOYEE MODAL (UNCHANGED) ================= */}
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