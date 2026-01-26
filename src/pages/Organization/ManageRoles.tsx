import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Accordion, Card } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Role {
  RoleID: number;
  RoleName: string;
  Description: string;
  IsActive: boolean;
  AssignedMenus?: number[];
}

interface Menu {
  MenuID: number;
  ParentMenuID: number | null;
  MenuName: string;
  MenuOrder: number;
  IsActive: boolean;
}

// Sample menu data (replace with API call)
const sampleMenus: Menu[] = [
  { MenuID: 18, ParentMenuID: null, MenuName: 'Leave', MenuOrder: 0, IsActive: true },
  { MenuID: 19, ParentMenuID: 18, MenuName: 'Test Leave', MenuOrder: 1, IsActive: true },
  { MenuID: 1, ParentMenuID: null, MenuName: 'System Admin', MenuOrder: 1, IsActive: true },
  { MenuID: 28, ParentMenuID: 1, MenuName: 'Assign Features', MenuOrder: 3, IsActive: true },
];

const ManageRoles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    { RoleID: 1, RoleName: 'Admin', Description: 'Full access to system', IsActive: true, AssignedMenus: [18,19] },
    { RoleID: 2, RoleName: 'User', Description: 'Regular user', IsActive: true, AssignedMenus: [] },
    { RoleID: 3, RoleName: 'Manager', Description: 'Manage team tasks', IsActive: false, AssignedMenus: [] },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoles, setFilteredRoles] = useState<Role[]>(roles);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Role>({ RoleID: 0, RoleName: '', Description: '', IsActive: true });
  const [validated, setValidated] = useState(false);

  // Assign Menu state
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedMenus, setSelectedMenus] = useState<number[]>([]);

  useEffect(() => {
    const filtered = roles.filter((role) =>
      role.RoleName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  // --- Role Add/Edit ---
  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditRole(role);
      setNewRole(role);
    } else {
      setEditRole(null);
      setNewRole({ RoleID: 0, RoleName: '', Description: '', IsActive: true });
    }
    setValidated(false);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setNewRole({ RoleID: 0, RoleName: '', Description: '', IsActive: true });
    setEditRole(null);
    setValidated(false);
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setNewRole((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    const form = e.currentTarget;
    if (!form.checkValidity()) return;

    if (editRole) {
      setRoles((prev) => prev.map((r) => (r.RoleID === newRole.RoleID ? newRole : r)));
      toast.success('Role updated successfully!');
    } else {
      const newID = roles.length ? Math.max(...roles.map((r) => r.RoleID)) + 1 : 1;
      setRoles((prev) => [...prev, { ...newRole, RoleID: newID }]);
      toast.success('Role added successfully!');
    }
    handleCloseRoleModal();
  };

  const handleToggleActive = (roleID: number) => {
    setRoles((prev) =>
      prev.map((r) => (r.RoleID === roleID ? { ...r, IsActive: !r.IsActive } : r))
    );
    toast.info('Role status updated!');
  };

  // --- Assign Menu ---
  const handleOpenMenuModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedMenus(role.AssignedMenus || []);
    setShowMenuModal(true);
  };

  const handleToggleMenu = (menuID: number) => {
    setSelectedMenus((prev) =>
      prev.includes(menuID) ? prev.filter((id) => id !== menuID) : [...prev, menuID]
    );
  };

  const handleSaveAssignedMenus = () => {
    if (!selectedRole) return;

    const updatedRoles = roles.map((r) =>
      r.RoleID === selectedRole.RoleID ? { ...r, AssignedMenus: selectedMenus } : r
    );
    setRoles(updatedRoles);
    toast.success(`Menus assigned to role "${selectedRole.RoleName}" successfully!`);
    setShowMenuModal(false);
  };

  const parentMenus = sampleMenus.filter((m) => m.ParentMenuID === null).sort((a, b) => a.MenuOrder - b.MenuOrder);
  const getChildMenus = (parentID: number) => sampleMenus.filter((m) => m.ParentMenuID === parentID).sort((a, b) => a.MenuOrder - b.MenuOrder);

  return (
    <div className="mt-5">
      <h2 className="mb-4">Manage Roles</h2>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <Form.Control
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <Button variant="success" onClick={() => handleOpenRoleModal()}>
          + Add New Role
        </Button>
      </div>

      <div className="table-responsive">
        <Table bordered hover>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.length ? (
              filteredRoles.map((role) => (
                <tr key={role.RoleID}>
                  <td>{role.RoleName}</td>
                  <td>{role.Description}</td>
                  <td>
                    <Form.Check
                      type="switch"
                      checked={role.IsActive}
                      onChange={() => handleToggleActive(role.RoleID)}
                    />
                  </td>
                  <td className="d-flex gap-2 flex-wrap">
                    <Button size="sm" variant="primary" onClick={() => handleOpenRoleModal(role)}>
                      Edit
                    </Button>                 
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Add/Edit Role Modal */}
      <Modal show={showRoleModal} onHide={handleCloseRoleModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editRole ? 'Edit Role' : 'Add New Role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSaveRole}>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="roleName">
                  <Form.Label>Role Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter role name"
                    name="RoleName"
                    value={newRole.RoleName}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Role Name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Enter role description"
                    name="Description"
                    value={newRole.Description}
                    onChange={handleChange}
                    rows={3}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="Active"
                  name="IsActive"
                  checked={newRole.IsActive}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseRoleModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editRole ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageRoles;
