import React, { useEffect, useState, useMemo } from 'react';
import { Button, Modal, Form, Table, Row, Col, Pagination } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GetRolesAsync } from '../../services/roleService';

interface Role {
  RoleID: number;
  RoleCode?: string | null;
  RoleName: string;
  Description: string;
  IsActive: boolean;
  CreatedBy?: string;
}

const ManageRoles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [validated, setValidated] = useState(false);

  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newRole, setNewRole] = useState<Role>({
    RoleID: 0,
    RoleName: '',
    Description: '',
    IsActive: true,
  });

  /* ================= API ================= */

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await GetRolesAsync();
      setRoles(response);
      setFilteredRoles(response);
    } catch (error) {
      toast.error('Failed to load roles');
      console.error(error);
    }
  };

  /* ================= SEARCH ================= */

  useEffect(() => {
    const filtered = roles.filter((role) =>
      role.RoleName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
    setCurrentPage(1); // Reset page when searching
  }, [searchTerm, roles]);

  /* ================= PAGINATION LOGIC ================= */

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoles, currentPage]);

  /* ================= MODAL ================= */

  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditRole(role);
      setNewRole(role);
    } else {
      setEditRole(null);
      setNewRole({
        RoleID: 0,
        RoleName: '',
        Description: '',
        IsActive: true,
      });
    }
    setValidated(false);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setEditRole(null);
    setValidated(false);
  };

  /* ================= FORM ================= */

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setNewRole((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);

    if (!e.currentTarget.checkValidity()) return;

    if (editRole) {
      setRoles((prev) =>
        prev.map((r) => (r.RoleID === newRole.RoleID ? newRole : r))
      );
      toast.success('Role updated successfully!');
    } else {
      const newID = roles.length
        ? Math.max(...roles.map((r) => r.RoleID)) + 1
        : 1;

      setRoles((prev) => [...prev, { ...newRole, RoleID: newID }]);
      toast.success('Role added successfully!');
    }

    handleCloseRoleModal();
  };

  /* ================= STATUS TOGGLE ================= */

  const handleToggleActive = (roleID: number) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.RoleID === roleID ? { ...r, IsActive: !r.IsActive } : r
      )
    );
    toast.info('Role status updated!');
  };

  /* ================= UI ================= */

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
            {paginatedRoles.length ? (
              paginatedRoles.map((role) => (
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
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenRoleModal(role)}
                    >
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

      {/* ✅ Pagination UI */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />

          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </Pagination>
      )}

      {/* ===== MODAL ===== */}
      <Modal show={showRoleModal} onHide={handleCloseRoleModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editRole ? 'Edit Role' : 'Add New Role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSaveRole}>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Role Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="RoleName"
                    value={newRole.RoleName}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Role Name is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="Description"
                    rows={3}
                    value={newRole.Description}
                    onChange={handleChange}
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
