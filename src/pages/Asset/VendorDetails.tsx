import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import AssetService from '../../services/AssetService';

/* ===========================
   Interfaces
   =========================== */
interface Vendor {
  VendorID: number;
  OrganizationID: number;
  VendorName: string;
  ContactPerson: string;
  ContactNumber: string;
  Email: string;
  Address: string;
}

interface LoggedInUser {
  organizationID: number;
}

/* ===========================
   Component
   =========================== */
const VendorDetails: React.FC = () => {
  /* ---------- Safe localStorage parsing ---------- */
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID: number = user?.organizationID ?? 0;

  /* ---------- State ---------- */
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState<Vendor>({
    VendorID: 0,
    OrganizationID: organizationID,
    VendorName: '',
    ContactPerson: '',
    ContactNumber: '',
    Email: '',
    Address: '',
  });

  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  /* ===========================
     Load Vendors
     =========================== */
  useEffect(() => {
    if (organizationID > 0) {
      loadVendors();
    }
  }, [organizationID]);

const loadVendors = async () => {
  try {
    const response = await AssetService.getVendors(organizationID);
    setVendors(response?.Table ?? []);
  } catch (error) {
    console.error('Error loading vendors:', error);
  }
};

  /* ===========================
     Handlers
     =========================== */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const openAddModal = () => {
    setEditVendor(null);
    setFormData({
      VendorID: 0,
      OrganizationID: organizationID,
      VendorName: '',
      ContactPerson: '',
      ContactNumber: '',
      Email: '',
      Address: '',
    });
    setValidated(false);
    setShowModal(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditVendor(vendor);
    setFormData(vendor);
    setValidated(false);
    setShowModal(true);
  };

  /* ===========================
     Save Vendor
     =========================== */
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      await AssetService.createVendors(formData);
      await loadVendors();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  /* ===========================
     Delete Vendor
     =========================== */
  const confirmDeleteVendor = (id: number) => {
    setVendorToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!vendorToDelete) return;

    try {
      await AssetService.deleteVendors(vendorToDelete);
      await loadVendors();
      setVendorToDelete(null);
      setConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  /* ===========================
     Render
     =========================== */
  return (
    <div className="mt-5">
      <h3>Vendor Details</h3>

      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Vendor
        </Button>
      </div>

      {vendors.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Contact Person</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Address</th>
              <th style={{ width: '160px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.VendorID}>
                <td>{v.VendorName}</td>
                <td>{v.ContactPerson}</td>
                <td>{v.ContactNumber}</td>
                <td>{v.Email}</td>
                <td>{v.Address}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => openEditModal(v)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => confirmDeleteVendor(v.VendorID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No vendors added yet.</p>
      )}

      {/* ===========================
          Add / Edit Modal
         =========================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editVendor ? 'Edit Vendor' : 'Add Vendor'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="VendorName">
                  <Form.Label>Vendor Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.VendorName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="ContactPerson">
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.ContactPerson}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="ContactNumber">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    pattern="^[0-9]{10,15}$"
                    value={formData.ContactNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="Email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    value={formData.Email}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="Address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={3}
                    value={formData.Address}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editVendor ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ===========================
          Delete Confirmation
         =========================== */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this vendor?</Modal.Body>
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

export default VendorDetails;
