import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

interface Role {
  id: number;
  name: string;
}

interface Position {
  id: number;
  positionName: string;
  roleId: number;
  isActive: boolean;
}

const ManagePositions: React.FC = () => {
  // Mock Roles (can later come from API)
  const roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Employee' },
  ];

  const [positions, setPositions] = useState<Position[]>([]);
  const [editPosition, setEditPosition] = useState<Position | null>(null);

  const [positionFormData, setPositionFormData] = useState<Position>({
    id: 0,
    positionName: '',
    roleId: 0,
    isActive: true,
  });

  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<number | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<any>
  ) => {
    const { id, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setPositionFormData((prev) => ({
        ...prev,
        [id]: target.checked,
      }));
    } else {
      setPositionFormData((prev) => ({
        ...prev,
        [id]: id === 'roleId' ? Number(value) : value,
      }));
    }
  };

  const openAddModal = () => {
    setEditPosition(null);
    setPositionFormData({
      id: 0,
      positionName: '',
      roleId: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (position: Position) => {
    setEditPosition(position);
    setPositionFormData(position);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editPosition) {
      setPositions((prev) =>
        prev.map((p) => (p.id === positionFormData.id ? positionFormData : p))
      );
    } else {
      setPositions((prev) => [
        ...prev,
        { ...positionFormData, id: Date.now() },
      ]);
    }
    setShowModal(false);
  };

  const confirmDeletePosition = (id: number) => {
    setPositionToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (positionToDelete !== null) {
      setPositions((prev) => prev.filter((p) => p.id !== positionToDelete));
      setConfirmDelete(false);
      setPositionToDelete(null);
    }
  };

  const getRoleName = (roleId: number) =>
    roles.find((r) => r.id === roleId)?.name || '-';

  return (
    <div className="mt-5">
      <h3>Manage Positions</h3>

      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Position
        </Button>
      </div>

      {positions.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Position Name</th>
              <th>Role</th>
              <th>Is Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id}>
                <td>{p.positionName}</td>
                <td>{getRoleName(p.roleId)}</td>
                <td>{p.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => openEditModal(p)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDeletePosition(p.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No positions added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editPosition ? 'Edit Position' : 'Add Position'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="positionName">
                  <Form.Label>Position Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={positionFormData.positionName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="roleId">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={positionFormData.roleId}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group controlId="isActive">
                  <Form.Check
                    type="checkbox"
                    label="Is Active"
                    checked={positionFormData.isActive}
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
            {editPosition ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this position?
        </Modal.Body>
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

export default ManagePositions;
