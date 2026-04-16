import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Pagination,
  Badge,
  Card
} from 'react-bootstrap';
import Select from 'react-select';
import userService from '../../services/userService';
import employeeService from '../../services/employeeService';

interface User {
  id: number;
  branchID: number | null;
  divisionID: number | null;
  departmentID: number | null;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  passwordHash: string;
  isPasswordReset: boolean;
  passwordResetDate: string | null;
  isActive: boolean;
  isCompanyEmail: boolean;
  roles: string[];
}

interface DropdownItem {
  id: number;
  name: string;
}

const ManageUsers: React.FC = () => {

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number = userFromStorage?.organizationID ?? 0;

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [generating, setGenerating] = useState(false);

  // ===== FILTERS =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ===== DROPDOWNS =====
  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);

  // ===== FORM =====
  const [userFormData, setUserFormData] = useState<User>({
    id: 0,
    branchID: null,
    divisionID: null,
    departmentID: null,
    fullName: '',
    email: '',
    phone: '',
    username: '',
    passwordHash: '',
    isPasswordReset: false,
    passwordResetDate: null,
    isActive: true,
    isCompanyEmail: false,
    roles: [],
  });

  const [editUser, setEditUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Employee', label: 'Employee' },
    { value: 'Guest', label: 'Guest' },
  ];

  // ================= FETCH =================
  const loadUsers = async () => {
    try {
      const data = await userService.getUsersByOrganizationIdAsync(organizationID);

      const mapped: User[] = data.map((u: any) => ({
        id: u.UserID,
        branchID: u.BranchID || null,
        divisionID: u.DivisionID || null,
        departmentID: u.DepartmentID || null,
        fullName: u.FullName,
        email: u.Email,
        phone: u.Phone,
        username: u.Username,
        passwordHash: '',
        isPasswordReset: u.IsPasswordReset,
        passwordResetDate: u.PasswordResetDate,
        isActive: u.IsActive,
        isCompanyEmail: u.IsCompanyEmail,
        roles: u.Roles ? u.Roles.split(',').map((r: string) => r.trim()) : []
      }));

      setUsers(mapped);
      setFilteredUsers(mapped);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();

    // mock dropdowns (replace with API if needed)
    setBranches([
      { id: 1, name: 'Branch 1' },
      { id: 2, name: 'Branch 2' },
    ]);

    setDepartments([
      { id: 1, name: 'HR' },
      { id: 2, name: 'IT' },
    ]);
  }, []);

  // ================= FILTER =================
  useEffect(() => {

    let filtered = users.filter(u => {

      const search =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase());

      const branch =
        selectedBranch === '' || u.branchID === selectedBranch;

      const dept =
        selectedDepartment === '' || u.departmentID === selectedDepartment;

      const role =
        selectedRole === '' || u.roles.includes(selectedRole);

      return search && branch && dept && role;

    });

    setFilteredUsers(filtered);
    setCurrentPage(1);

  }, [searchTerm, selectedBranch, selectedDepartment, selectedRole, users]);

  // ================= PAGINATION =================
  const indexOfLast = currentPage * pageSize;
  const currentUsers = filteredUsers.slice(indexOfLast - pageSize, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // ================= GENERATE =================
  const handleGenerateLogins = async () => {
    try {
      setGenerating(true);

      const employees = await employeeService.getEmployeeByOrganizationIdAsync(organizationID);

      const res = await userService.PostGenerateLoginsAsync({
        employeeJsonData: JSON.stringify(employees),
        createdBy: "Admin"
      });

      await employeeService.PutUpdateEmployeeUserIdAsync({
        jsonData: JSON.stringify(res),
        createdBy: "Admin"
      });

      await loadUsers();
      alert("Generated!");

    } catch {
      alert("Error!");
    } finally {
      setGenerating(false);
    }
  };

  // ================= INPUT =================
  const handleInputChange = (e: any) => {
    const { id, value, type, checked } = e.target;

    setUserFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // ================= SAVE =================
  const handleSave = () => {

    if (editUser) {
      setUsers(prev =>
        prev.map(u => u.id === userFormData.id ? userFormData : u)
      );
    } else {
      setUsers(prev => [...prev, { ...userFormData, id: Date.now() }]);
    }

    setShowModal(false);
  };

  // ================= DELETE =================
  const handleDelete = () => {
    if (userToDelete !== null) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      setConfirmDelete(false);
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-3">

      <Card className="shadow-sm">
        <Card.Body>

          <div className="d-flex justify-content-between mb-3">
            <h4>Manage Users</h4>

            <div className="d-flex gap-2">
              <Button onClick={handleGenerateLogins}>
                {generating ? "Generating..." : "Generate Logins"}
              </Button>

              <Button variant="success" onClick={() => {
                setEditUser(null);
                setShowModal(true);
              }}>
                + Add User
              </Button>
            </div>
          </div>

          {/* ===== FILTERS ===== */}
          <div className="d-flex align-items-center gap-2 mb-3 flex-nowrap overflow-auto">

  <Form.Control
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ minWidth: 200, maxWidth: 250 }}
  />

  <Form.Select
    value={selectedBranch}
    onChange={(e) =>
      setSelectedBranch(e.target.value ? Number(e.target.value) : '')
    }
    style={{ minWidth: 160 }}
  >
    <option value="">Branch</option>
    {branches.map(b => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ))}
  </Form.Select>

  <Form.Select
    value={selectedDepartment}
    onChange={(e) =>
      setSelectedDepartment(e.target.value ? Number(e.target.value) : '')
    }
    style={{ minWidth: 160 }}
  >
    <option value="">Department</option>
    {departments.map(d => (
      <option key={d.id} value={d.id}>{d.name}</option>
    ))}
  </Form.Select>

  <Form.Select
    value={selectedRole}
    onChange={(e) => setSelectedRole(e.target.value)}
    style={{ minWidth: 150 }}
  >
    <option value="">Role</option>
    {roleOptions.map(r => (
      <option key={r.value} value={r.value}>{r.value}</option>
    ))}
  </Form.Select>

  <Button
    variant="outline-secondary"
    onClick={() => {
      setSearchTerm('');
      setSelectedBranch('');
      setSelectedDepartment('');
      setSelectedRole('');
    }}
    style={{ whiteSpace: 'nowrap' }}
  >
    Clear
  </Button>

</div>

          {/* ===== TABLE ===== */}
          <Table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.roles.map(r => <Badge bg="info" key={r} className="me-1">{r}</Badge>)}
                  </td>
                  <td>
                    <Badge bg={u.isActive ? 'success' : 'danger'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" onClick={() => {
                      setEditUser(u);
                      setUserFormData(u);
                      setShowModal(true);
                    }}>Edit</Button>

                    <Button size="sm" variant="danger" className="ms-2"
                      onClick={() => {
                        setUserToDelete(u.id);
                        setConfirmDelete(true);
                      }}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* PAGINATION */}
          <Pagination className="justify-content-end">
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>

        </Card.Body>
      </Card>

            {/* Add/Edit Modal */}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">

        <Modal.Header closeButton>
          <Modal.Title>{editUser ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form>

            <Row>

              <Col md={6}>

                <Form.Group className="mb-3" controlId="fullName">

                  <Form.Label>Full Name</Form.Label>

                  <Form.Control
                    type="text"
                    value={userFormData.fullName}
                    onChange={handleInputChange}
                  />

                </Form.Group>

              </Col>

              <Col md={6}>

                <Form.Group className="mb-3" controlId="email">

                  <Form.Label>Email</Form.Label>

                  <Form.Control
                    type="email"
                    value={userFormData.email}
                    onChange={handleInputChange}
                  />

                </Form.Group>

              </Col>

            </Row>

            <Row>

              <Col md={6}>

                <Form.Group className="mb-3" controlId="phone">

                  <Form.Label>Phone</Form.Label>

                  <Form.Control
                    type="text"
                    value={userFormData.phone}
                    onChange={handleInputChange}
                  />

                </Form.Group>

              </Col>

              <Col md={6}>

                <Form.Group className="mb-3" controlId="username">

                  <Form.Label>Username</Form.Label>

                  <Form.Control
                    type="text"
                    value={userFormData.username}
                    onChange={handleInputChange}
                  />

                </Form.Group>

              </Col>

            </Row>

            <Row>

              <Col md={6}>

                <Form.Group className="mb-3" controlId="passwordHash">

                  <Form.Label>Password</Form.Label>

                  <Form.Control
                    type="password"
                    value={userFormData.passwordHash}
                    onChange={handleInputChange}
                  />

                </Form.Group>

              </Col>

              <Col md={6}>

                <Form.Group className="mb-3">

                  <Form.Label>Roles</Form.Label>

                  <Select
                    isMulti
                    options={roleOptions}
                    value={roleOptions.filter((role) =>
                      userFormData.roles.includes(role.value)
                    )}
                    onChange={(selectedOptions) => {

                      const roles = selectedOptions.map((opt) => opt.value);

                      setUserFormData((prev) => ({ ...prev, roles }));

                    }}
                  />

                </Form.Group>

              </Col>

            </Row>

            <Row>

              <Col>

                <Form.Check
                  type="checkbox"
                  label="Is Password Reset"
                  id="isPasswordReset"
                  checked={userFormData.isPasswordReset}
                  onChange={handleInputChange}
                />

              </Col>

              <Col>

                <Form.Check
                  type="checkbox"
                  label="Is Active"
                  id="isActive"
                  checked={userFormData.isActive}
                  onChange={handleInputChange}
                />

              </Col>

              <Col>

                <Form.Check
                  type="checkbox"
                  label="Company Email"
                  id="isCompanyEmail"
                  checked={userFormData.isCompanyEmail}
                  onChange={handleInputChange}
                />

              </Col>

            </Row>

          </Form>

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
          >
            {editUser ? 'Update' : 'Save'}
          </Button>

        </Modal.Footer>

      </Modal>

      {/* Delete Modal */}

      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>

        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this user?
        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>

        </Modal.Footer>

      </Modal>
    </div>
  );
};

export default ManageUsers;