import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Pagination,
  InputGroup,
  Badge,
} from 'react-bootstrap';
import {
  BsSearch,
  BsFunnel,
  BsPlusLg,
  BsPeople,
  BsPersonCheck,
  BsPersonGear,
  BsPersonPlus,
  BsX,
} from 'react-icons/bs';
import employeeService from '../../services/employeeService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Employee } from '../../types/Employee';
import Select from 'react-select';
import '../../css/EmployeeList.css';

const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface DropdownItem {
  id: number;
  name: string;
}

interface TempFilters {
  search: string;
  branchID: string;
  divisionID: string;
  departmentID: string;
  positionID: string;
  employmentTypeID: string;
}

const emptyTempFilters: TempFilters = {
  search: '',
  branchID: '',
  divisionID: '',
  departmentID: '',
  positionID: '',
  employmentTypeID: '',
};

const avatarColors = ['#0d6efd', '#198754', '#6f42c1', '#fd7e14', '#dc3545', '#20c997', '#6610f2'];

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) =>
  avatarColors[Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % avatarColors.length];

const selectProps = {
  className: 'org-select',
  classNamePrefix: 'org-select',
};
 const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="app-form-section">
      <div className="app-form-section-title">{title}</div>
      {children}
    </div>
  );

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [advancedFilters, setAdvancedFilters] = useState({
    divisionID: '',
    positionID: '',
    employmentTypeID: '',
  });

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<TempFilters>(emptyTempFilters);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);
  const [divisions, setDivisions] = useState<DropdownItem[]>([]);
  const [positions, setPositions] = useState<DropdownItem[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<DropdownItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID: number = user?.organizationID;

  const defaultNewEmp = (): Employee => ({
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

  const [newEmp, setNewEmp] = useState<Employee>(defaultNewEmp());

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
      const empList = Array.isArray(data) ? data : data?.Table || [];

      if (empList.length > 0) {
        setEmployees(empList);
        setFilteredEmployees(empList);
      } else {
        setEmployees([]);
        setFilteredEmployees([]);
      }
    } catch {
      setError('Error loading data');
      setEmployees([]);
      setFilteredEmployees([]);
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

  const response = await employeeService.createEmployee(payload);

const result = response;

if (result?.value === 1) {
  toast.success(result.msg || "Employee Details Created Successfully.");

  const data = await employeeService.getEmployeesByOrganizationIdAsync(
    organizationID
  );

  const empList = Array.isArray(data) ? data : data?.Table || [];

  setEmployees(empList);
  setFilteredEmployees(empList);

  // Close only on success
  handleCloseAddModal();
} else if (result?.value === 0) {
  // Keep popup open
  toast.warning(result.msg || "Validation failed.");
} else {
  toast.error("Unable to create employee.");
}
} catch {
  toast.error("Error saving employee");
} finally {
  setSaving(false);
}
  };

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const filtersData = await employeeService.GetEmployeeFiltersDataAsync(organizationID);

        const branchList = filtersData?.Table || [];
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
        setBranches([{ id: 1, name: 'Sample Branch' }]);
        setDepartments([{ id: 1, name: 'Sample Dept' }]);
        setDivisions([{ id: 1, name: 'Sample Division' }]);
        setPositions([{ id: 1, name: 'Sample Position' }]);
        setEmploymentTypes([{ id: 1, name: 'Sample Employment Type' }]);
      }
    };

    loadDropdowns();
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter((emp: any) => {
      const matchesSearch =
        searchTerm === '' ||
        emp.EmployeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.EmployeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = selectedBranch === '' ? true : emp.BranchID === selectedBranch;
      const matchesDepartment =
        selectedDepartment === '' ? true : emp.DepartmentID === selectedDepartment;

      const matchesDivision =
        advancedFilters.divisionID === ''
          ? true
          : emp.DivisionID === Number(advancedFilters.divisionID);

      const matchesPosition =
        advancedFilters.positionID === ''
          ? true
          : emp.PositionID === Number(advancedFilters.positionID);

      const matchesEmploymentType =
        advancedFilters.employmentTypeID === ''
          ? true
          : emp.EmploymentTypeID === Number(advancedFilters.employmentTypeID);

      return (
        matchesSearch &&
        matchesBranch &&
        matchesDepartment &&
        matchesDivision &&
        matchesPosition &&
        matchesEmploymentType
      );
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees, selectedBranch, selectedDepartment, advancedFilters]);

  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const openFilterModal = () => {
    setTempFilters({
      search: searchTerm,
      branchID: selectedBranch === '' ? '' : String(selectedBranch),
      divisionID: advancedFilters.divisionID,
      departmentID: selectedDepartment === '' ? '' : String(selectedDepartment),
      positionID: advancedFilters.positionID,
      employmentTypeID: advancedFilters.employmentTypeID,
    });
    setShowFilterModal(true);
  };

  const applyPopupFilters = () => {
    setSearchTerm(tempFilters.search);
    setSelectedBranch(tempFilters.branchID === '' ? '' : Number(tempFilters.branchID));
    setSelectedDepartment(tempFilters.departmentID === '' ? '' : Number(tempFilters.departmentID));
    setAdvancedFilters({
      divisionID: tempFilters.divisionID,
      positionID: tempFilters.positionID,
      employmentTypeID: tempFilters.employmentTypeID,
    });
    setShowFilterModal(false);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedBranch('');
    setSelectedDepartment('');
    setAdvancedFilters({ divisionID: '', positionID: '', employmentTypeID: '' });
    setTempFilters(emptyTempFilters);
  };

  const handleCloseAddModal = () => {
    setShowModal(false);
    setValidated(false);
    setNewEmp(defaultNewEmp());
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedBranch !== '' ||
    selectedDepartment !== '' ||
    advancedFilters.divisionID !== '' ||
    advancedFilters.positionID !== '' ||
    advancedFilters.employmentTypeID !== '';

  const toSelectOptions = (items: DropdownItem[]) =>
    items.map((item) => ({ value: item.id, label: item.name }));

 
  if (loading) {
    return (
      <div className="employee-list-page container">
        <div className="employee-loading">
          <Spinner animation="border" variant="primary" />
          <span>Loading employees...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-list-page container">
        <div className="alert alert-danger mt-3">{error}</div>
      </div>
    );
  }

  return (
    
    <div className="employee-list-page container">
       <ToastContainer position="top-right" autoClose={3000} /> 
      {/* <div className="employee-stat-cards">
        <div className="employee-stat-card">
          <div className="employee-stat-icon total">
            {Icon(BsPeople)}
          </div>
          <div>
            <div className="employee-stat-label">Total Employees</div>
            <div className="employee-stat-value">{employees.length}</div>
          </div>
        </div>
        <div className="employee-stat-card">
          <div className="employee-stat-icon filtered">
            {Icon(BsPersonCheck)}
          </div>
          <div>
            <div className="employee-stat-label">Showing</div>
            <div className="employee-stat-value">{filteredEmployees.length}</div>
          </div>
        </div>
      </div> */}

      <div className="employee-toolbar">
        <div className="employee-search-wrap">
          <InputGroup>
            <InputGroup.Text>
              {Icon(BsSearch)}
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name or employee code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        <div className="employee-toolbar-actions">
           <Button
              variant="outline-primary"
              onClick={() => window.location.href = "/employee-data"}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              View Employee Data
            </Button>
          <Button variant="success" onClick={() => setShowModal(true)}>
          {Icon(BsPlusLg, { className: 'me-2' })}
          Add Employee
        </Button>
          <Button variant="outline-primary" onClick={openFilterModal}>
            {Icon(BsFunnel, { className: 'me-2' })}
            Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outline-secondary" onClick={clearAllFilters}>
              {Icon(BsX, { className: 'me-2' })}
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="employee-active-filters mb-3">
          {searchTerm && <Badge bg="primary">Search: {searchTerm}</Badge>}
          {selectedBranch !== '' && (
            <Badge bg="secondary">
              Branch: {branches.find((b) => b.id === selectedBranch)?.name || selectedBranch}
            </Badge>
          )}
          {selectedDepartment !== '' && (
            <Badge bg="secondary">
              Dept: {departments.find((d) => d.id === selectedDepartment)?.name || selectedDepartment}
            </Badge>
          )}
        </div>
      )}

      <div className="employee-table-card">
        <div className="table-responsive">
          <table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Date of Joining</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.length > 0 ? (
                currentEmployees.map((emp) => {
                  const displayName = emp.EmployeeName || `${emp.FirstName} ${emp.LastName}`.trim();
                  return (
                    <tr key={emp.EmployeeID}>
                      <td>
                        <div className="employee-name-cell">
                          <div
                            className="employee-avatar"
                            style={{ backgroundColor: getAvatarColor(displayName) }}
                          >
                            {getInitials(displayName)}
                          </div>
                          <div>
                            <div className="employee-name-text">{displayName}</div>
                            <div className="employee-code-text">{emp.EmployeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.OfficialEmail || '—'}</td>
                      <td>{emp.DateOfJoining ? emp.DateOfJoining.slice(0, 10) : '—'}</td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/Employees/manageEmployee/${emp.EmployeeID}`)}
                        >
                          {Icon(BsPersonGear, { className: 'me-1' })}
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="employee-empty-state">
                      {Icon(BsPeople)}
                      <p className="mb-0">No employees found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length > 0 && (
        <div className="employee-pagination-wrap">
          <span className="employee-page-info">
            Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredEmployees.length)} of{' '}
            {filteredEmployees.length}
          </span>
          {totalPages > 1 && (
            <Pagination className="mb-0">
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
              <Pagination.Next
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {Icon(BsFunnel)}
            Advanced Filters
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="app-filter-grid">
            <div className="app-filter-field">
              <label>Search</label>
              <Form.Control
                placeholder="Name or employee code"
                value={tempFilters.search}
                onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
              />
            </div>
            <div className="app-filter-field">
              <label>Branch</label>
              <Select
                {...selectProps}
                isClearable
                placeholder="All branches"
                options={toSelectOptions(branches)}
                value={
                  tempFilters.branchID
                    ? toSelectOptions(branches).find((o) => String(o.value) === tempFilters.branchID)
                    : null
                }
                onChange={(val) =>
                  setTempFilters({ ...tempFilters, branchID: val ? String(val.value) : '' })
                }
              />
            </div>
            <div className="app-filter-field">
              <label>Division</label>
              <Select
                {...selectProps}
                isClearable
                placeholder="All divisions"
                options={toSelectOptions(divisions)}
                value={
                  tempFilters.divisionID
                    ? toSelectOptions(divisions).find((o) => String(o.value) === tempFilters.divisionID)
                    : null
                }
                onChange={(val) =>
                  setTempFilters({ ...tempFilters, divisionID: val ? String(val.value) : '' })
                }
              />
            </div>
            <div className="app-filter-field">
              <label>Department</label>
              <Select
                {...selectProps}
                isClearable
                placeholder="All departments"
                options={toSelectOptions(departments)}
                value={
                  tempFilters.departmentID
                    ? toSelectOptions(departments).find((o) => String(o.value) === tempFilters.departmentID)
                    : null
                }
                onChange={(val) =>
                  setTempFilters({ ...tempFilters, departmentID: val ? String(val.value) : '' })
                }
              />
            </div>
            <div className="app-filter-field">
              <label>Position</label>
              <Select
                {...selectProps}
                isClearable
                placeholder="All positions"
                options={toSelectOptions(positions)}
                value={
                  tempFilters.positionID
                    ? toSelectOptions(positions).find((o) => String(o.value) === tempFilters.positionID)
                    : null
                }
                onChange={(val) =>
                  setTempFilters({ ...tempFilters, positionID: val ? String(val.value) : '' })
                }
              />
            </div>
            <div className="app-filter-field">
              <label>Employment Type</label>
              <Select
                {...selectProps}
                isClearable
                placeholder="All types"
                options={toSelectOptions(employmentTypes)}
                value={
                  tempFilters.employmentTypeID
                    ? toSelectOptions(employmentTypes).find(
                        (o) => String(o.value) === tempFilters.employmentTypeID
                      )
                    : null
                }
                onChange={(val) =>
                  setTempFilters({ ...tempFilters, employmentTypeID: val ? String(val.value) : '' })
                }
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setTempFilters(emptyTempFilters);
            }}
          >
            Reset
          </Button>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={applyPopupFilters}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseAddModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {Icon(BsPersonPlus)}
            Add New Employee
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSaveEmployee}>
          <Modal.Body>
            <FormSection title="Personal Information">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="firstName">
                    <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={newEmp.FirstName}
                      onChange={(e) => setNewEmp({ ...newEmp, FirstName: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Please enter first name</Form.Control.Feedback>
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
                    <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={newEmp.LastName}
                      onChange={(e) => setNewEmp({ ...newEmp, LastName: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Please enter last name</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="dob">
                    <Form.Label>Date of Birth <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="date"
                      value={newEmp.DateOfBirth}
                      onChange={(e) => setNewEmp({ ...newEmp, DateOfBirth: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Please select date of birth</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="gender">
                    <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
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
                    <Form.Control.Feedback type="invalid">Please select gender</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="maritalStatus">
                    <Form.Label>Marital Status <span className="text-danger">*</span></Form.Label>
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
                    <Form.Control.Feedback type="invalid">Please select marital status</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </FormSection>

            <FormSection title="Contact Details">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="personalPhone">
                    <Form.Label>Personal Phone <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      value={newEmp.personalPhone}
                      onChange={(e) => setNewEmp({ ...newEmp, personalPhone: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Personal phone is required</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="workPhone">
                    <Form.Label>Work Phone</Form.Label>
                    <Form.Control
                      value={newEmp.workPhone}
                      onChange={(e) => setNewEmp({ ...newEmp, workPhone: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="personalEmail">
                    <Form.Label>Personal Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={newEmp.personalEmail}
                      onChange={(e) => setNewEmp({ ...newEmp, personalEmail: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Please enter a valid email</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </FormSection>

            <FormSection title="Employment Details">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="employeeCode">
                    <Form.Label>Employee Code <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={newEmp.EmployeeCode}
                      onChange={(e) => setNewEmp({ ...newEmp, EmployeeCode: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Please enter employee code</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="officialEmail">
                    <Form.Label>Official Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="email"
                      value={newEmp.OfficialEmail}
                      onChange={(e) => setNewEmp({ ...newEmp, OfficialEmail: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Please enter a valid email</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="dateOfJoining">
                    <Form.Label>Date of Joining <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      required
                      type="date"
                      value={newEmp.DateOfJoining}
                      onChange={(e) => setNewEmp({ ...newEmp, DateOfJoining: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Please select date of joining</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </FormSection>

            <FormSection title="Identity Documents">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="pan">
                    <Form.Label>PAN <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={newEmp.PAN}
                      onChange={(e) => setNewEmp({ ...newEmp, PAN: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">PAN is required</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="aadhar">
                    <Form.Label>Aadhar <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={newEmp.Aadhar}
                      onChange={(e) => setNewEmp({ ...newEmp, Aadhar: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">Aadhar is required</Form.Control.Feedback>
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
            </FormSection>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save Employee'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeList;
