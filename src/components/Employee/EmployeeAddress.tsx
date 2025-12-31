import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import ToggleSection from '../ToggleSection';

interface EmployeeAddress {
  id: number;
  addressType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

const EmployeeAddress: React.FC = () => {
  const [addresses, setAddresses] = useState<EmployeeAddress[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<EmployeeAddress>({
    id: 0,
    addressType: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });
  const [editAddress, setEditAddress] = useState<EmployeeAddress | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (editAddress) {
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === editAddress.id ? formData : addr))
      );
    } else {
      setAddresses((prev) => [...prev, { ...formData, id: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      id: Date.now(),
      addressType: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    });
    setEditAddress(null);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== deleteId));
    setConfirmDelete(false);
  };

  return (
    <div className="employee-education-container">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Address
        </Button>
      </div>

      {addresses.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Type</th>
              <th>Address Line 1</th>
              <th>Address Line 2</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Postal Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((addr) => (
              <tr key={addr.id}>
                <td>{addr.addressType}</td>
                <td>{addr.addressLine1}</td>
                <td>{addr.addressLine2}</td>
                <td>{addr.city}</td>
                <td>{addr.state}</td>
                <td>{addr.country}</td>
                <td>{addr.postalCode}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setEditAddress(addr);
                      setFormData(addr);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(addr.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No addresses added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editAddress ? 'Edit Address' : 'Add Address'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="addressType">
                  <Form.Label>Address Type</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Permanent / Current"
                    value={formData.addressType}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter address type.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="postalCode">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    pattern="^[0-9]{4,10}$"
                    placeholder="e.g., 500001"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid postal code.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="addressLine1">
                  <Form.Label>Address Line 1</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter address line 1.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="addressLine2">
                  <Form.Label>Address Line 2</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="city">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter city.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="state">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter state.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="country">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter country.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editAddress ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this address?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteAction}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeAddress;
