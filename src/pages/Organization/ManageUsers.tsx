import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
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

interface DropdownOption {
  id: number;
  name: string;
}

const ManageUsers: React.FC = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [generating, setGenerating] = useState(false);

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

  const branches: DropdownOption[] = [
    { id: 1, name: 'Branch 1' },
    { id: 2, name: 'Branch 2' },
  ];

  const divisions: DropdownOption[] = [
    { id: 1, name: 'Division 1' },
    { id: 2, name: 'Division 2' },
  ];

  const departments: DropdownOption[] = [
    { id: 1, name: 'Department 1' },
    { id: 2, name: 'Department 2' },
  ];

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Employee', label: 'Employee' },
    { value: 'Guest', label: 'Guest' },
  ];

  // =============================
  // GENERATE LOGINS
  // =============================
  const handleGenerateLogins = async () => {
    try {
      setGenerating(true);

      const organizationID = 9;

      const employees =
        await employeeService.getEmployeeByOrganizationIdAsync(organizationID);

      if (!employees || employees.length === 0) {
        alert("No employees found");
        return;
      }

    const payload = {
        employeeJsonData: JSON.stringify(employees),
        createdBy: "Admin"
     };

  const loginResponse =
    await userService.PostGenerateLoginsAsync(payload);
    

      if (!loginResponse || loginResponse.length === 0) {
        alert("No users created");
        return;
      }
   
        const payload1 = {
        jsonData: JSON.stringify(loginResponse),
        createdBy: "Admin"
      };

      await employeeService.PutUpdateEmployeeUserIdAsync(payload1);

      alert("Logins generated successfully");

    } catch (error) {
      console.error("Error generating logins", error);
      alert("Error generating logins");
    } finally {
      setGenerating(false);
    }
  };

  // =============================
  // INPUT CHANGE
  // =============================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {

    const { id, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setUserFormData((prev) => ({
        ...prev,
        [id]: target.checked,
      }));
    } else {
      setUserFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  // =============================
  // OPEN MODALS
  // =============================
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
      isCompanyEmail: false,
      roles: [],
    });

    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditUser(user);
    setUserFormData(user);
    setShowModal(true);
  };

  // =============================
  // SAVE / UPDATE
  // =============================
  const handleSave = () => {

    if (editUser) {

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userFormData.id ? userFormData : u
        )
      );

    } else {

      setUsers((prev) => [
        ...prev,
        { ...userFormData, id: Date.now() },
      ]);

    }

    setShowModal(false);
  };

  // =============================
  // DELETE
  // =============================
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

      <div className="d-flex justify-content-end gap-2 mb-3">

        <Button
          variant="primary"
          onClick={handleGenerateLogins}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Logins"}
        </Button>

        <Button
          variant="success"
          onClick={openAddModal}
        >
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
              <th>Company Email</th>
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
                <td>{u.isCompanyEmail ? 'Yes' : 'No'}</td>
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