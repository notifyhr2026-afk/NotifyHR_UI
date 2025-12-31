import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select'; // At the top

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
  roles: string[]; // <-- New field for roles
}

interface DropdownOption {
  id: number;
  name: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
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
    roles: [], // <-- Initial empty roles
  });

  const [editUser, setEditUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const branches: DropdownOption[] = [{ id: 1, name: 'Branch 1' }, { id: 2, name: 'Branch 2' }];
  const divisions: DropdownOption[] = [{ id: 1, name: 'Division 1' }, { id: 2, name: 'Division 2' }];
  const departments: DropdownOption[] = [{ id: 1, name: 'Department 1' }, { id: 2, name: 'Department 2' }];
  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Employee', label: 'Employee' },
    { value: 'Guest', label: 'Guest' },
  ];
  const rolesOptions: string[] = ['Admin', 'Manager', 'Employee', 'Guest']; // <-- Role options

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      if (id.startsWith('role_')) {
        const role = id.replace('role_', '');
        setUserFormData((prev) => ({
          ...prev,
          roles: target.checked
            ? [...prev.roles, role]
            : prev.roles.filter((r) => r !== role),
        }));
      } else {
        setUserFormData((prev) => ({
          ...prev,
          [id]: target.checked,
        }));
      }
    } else if (id === 'branchID' || id === 'divisionID' || id === 'departmentID') {
      setUserFormData((prev) => ({
        ...prev,
        [id]: value === '' ? null : Number(value),
      }));
    } else {
      setUserFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const openAddModal = () => {
    setEditUser(null);
    setUserFormData({
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
      roles: [],
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditUser(user);
    setUserFormData(user);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userFormData.id ? userFormData : u))
      );
    } else {
      setUsers((prev) => [
        ...prev,
        { ...userFormData, id: Date.now() },
      ]);
    }
    setShowModal(false);
  };

  const confirmDeleteUser = (id: number) => {
    setUserToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (userToDelete !== null) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      setUserToDelete(null);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mt-5">
      <h3>Manage Users</h3>
      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add User
        </Button>
      </div>

      {users.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Username</th>
              <th>Roles</th>
              <th>Is Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.username}</td>
                <td>{u.roles.join(', ')}</td>
                <td>{u.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditModal(u)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDeleteUser(u.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No users added yet.</p>
      )}

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
                <Form.Group className="mb-3" controlId="branchID">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={userFormData.branchID ?? ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Branch --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="divisionID">
                  <Form.Label>Division</Form.Label>
                  <Form.Select
                    value={userFormData.divisionID ?? ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Division --</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="departmentID">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={userFormData.departmentID ?? ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Roles</Form.Label>
                  <Select
                    isMulti
                    options={roleOptions}
                    value={roleOptions.filter((role) => userFormData.roles.includes(role.value))}
                    onChange={(selectedOptions) => {
                      const roles = selectedOptions.map((opt) => opt.value);
                      setUserFormData((prev) => ({ ...prev, roles }));
                    }}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    placeholder="Select roles..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="isPasswordReset">
                  <Form.Check
                    type="checkbox"
                    label="Is Password Reset"
                    checked={userFormData.isPasswordReset}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="isActive">
                  <Form.Check
                    type="checkbox"
                    label="Is Active"
                    checked={userFormData.isActive}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editUser ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Delete Confirmation Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageUsers;
