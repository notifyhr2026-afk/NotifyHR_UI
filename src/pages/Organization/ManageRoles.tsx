import React, { useEffect, useState, useMemo } from 'react';
import { Button, Modal, Form, Table, Row, Col, Pagination } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {GetRolesAsync, PostRoleByAsync, DeleteRoleByAsync } from '../../services/roleService';

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
    setCurrentPage(1);
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

  const handleSaveRole = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setValidated(true);
  if (!e.currentTarget.checkValidity()) return;

  try {
    const payload = {
      roleID: newRole.RoleID,
      roleName: newRole.RoleName,
      roleCode: newRole.RoleCode || '',
      description: newRole.Description,
      isActive: newRole.IsActive,
      createdBy: 'Admin',
    };

    const result = await PostRoleByAsync(payload);

    // Normalize: if result is array, take first element, else use object
    const normalizedResult = Array.isArray(result) ? result[0] : result;

    if (normalizedResult?.value === 1) {
      toast.success(normalizedResult.message || 'Role saved successfully!');
      fetchRoles();
      handleCloseRoleModal();
    } else {
      toast.warning(normalizedResult?.message || 'Something went wrong!');
    }
  } catch (error) {
    console.error(error);
    toast.error('Failed to save role');
  }
};


  /* ================= DELETE ROLE ================= */
  const handleDeleteRole = async (roleID: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      const result = await DeleteRoleByAsync(roleID);
      
      if (result[0]?.value === 1) {
        toast.success(result[0].Message);
        fetchRoles();
      } else {
        toast.warning(result[0]?.Message || 'Failed to delete role');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting role');
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const handleToggleActive = async (role: Role) => {
    // Toggle locally first for instant UI feedback
    setRoles((prev) =>
      prev.map((r) =>
        r.RoleID === role.RoleID ? { ...r, IsActive: !r.IsActive } : r
      )
    );

    try {
      // Call backend to update
      const payload = {
        roleID: role.RoleID,
        roleName: role.RoleName,
        roleCode: role.RoleCode || '',
        description: role.Description,
        isActive: !role.IsActive,
        createdBy: 'Admin',
      };
      const result = await PostRoleByAsync(payload);

      if (result.value === 1) {
        toast.info('Role status updated!');
      } else {
        toast.warning(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update role status');
    }
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
                      onChange={() => handleToggleActive(role)}
                    />
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenRoleModal(role)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteRole(role.RoleID)}
                    >
                      Delete
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
