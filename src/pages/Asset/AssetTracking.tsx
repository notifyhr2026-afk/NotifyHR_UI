import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import LoggedInUser from '../../types/LoggedInUser'
import AssetService from '../../services/AssetService';
import branchService from '../../services/branchService';
import departmentService from '../../services/departmentService';

/* ===========================
   Interfaces
   =========================== */
interface AssetTracking {
  TrackingID: number;
  AssetID: number;
  VendorID: number;
  BranchID: number;
  DepartmentID: number;
  Quantity: number;
  PurchaseDate: string;
  WarrantyExpiryDate: string;
  Cost: number;
  CurrentValue: number;
  StatusID: number;
  Location: string;
  OrganizationID: number;
}

interface Asset {
  AssetID: number;
  AssetName: string;
}

interface Vendor {
  VendorID: number;
  VendorName: string;
}

interface Branch {
  BranchID: number;
  BranchName: string;
}

interface Department {
  DepartmentID: number;
  DepartmentName: string;
}


const statuses = [
  { id: 1, name: 'Active' },
  { id: 2, name: 'Disposed' },
  { id: 3, name: 'Maintenance' },
];

const AssetTracking: React.FC = () => {
  /* ========== Organization Info from Local Storage ========== */
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;
  const organizationID = user?.organizationID ?? 0;

  /* ========== State ========== */
  const [trackingList, setTrackingList] = useState<AssetTracking[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [editItem, setEditItem] = useState<AssetTracking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<AssetTracking>({
    TrackingID: 0,
    AssetID: 0,
    VendorID: 0,
    BranchID: 0,
    DepartmentID: 0,
    Quantity: 1,
    PurchaseDate: '',
    WarrantyExpiryDate: '',
    Cost: 0,
    CurrentValue: 0,
    StatusID: 0,
    Location: '',
    OrganizationID: organizationID,
  });

  /* ====================
     Load Data on Component Mount
     ==================== */
  useEffect(() => {
    if (organizationID > 0) {
      loadTracking();
      loadAssetList();
      loadVendorList();
      loadBranches();
      loadDepartments();
    }
  }, [organizationID]);

  const loadTracking = async () => {
    try {
      const response = await AssetService.getAssetsTracking(organizationID);
      setTrackingList(response?.Table ?? []);
    } catch (error) {
      console.error('Load tracking failed', error);
    }
  };

  const loadAssetList = async () => {
    try {
      const response = await AssetService.getAssets(organizationID);
      setAssets(response?.Table ?? []);
    } catch (error) {
      console.error('Load assets failed', error);
    }
  };

  const loadVendorList = async () => {
    try {
      const response = await AssetService.getVendors(organizationID);
      setVendors(response?.Table ?? []);
    } catch (error) {
      console.error('Load vendors failed', error);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchService.getBranchesAsync(organizationID);
      setBranches(response?.Table ?? []);
    } catch (error) {
      console.error('Load branches failed', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getdepartmentesAsync(organizationID);
      setDepartments(response?.Table ?? []);
    } catch (error) {
      console.error('Load departments failed', error);
    }
  };

  /* ====================
     Input Change Handler
     ==================== */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]:
        ['AssetID', 'VendorID', 'BranchID', 'DepartmentID', 'StatusID'].includes(id)
          ? Number(value)
          : ['Quantity', 'Cost', 'CurrentValue'].includes(id)
          ? Number(value)
          : value,
    }));
  };

  /* ====================
     Modal Open / Close
     ==================== */
  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      TrackingID: 0,
      AssetID: 0,
      VendorID: 0,
      BranchID: 0,
      DepartmentID: 0,
      Quantity: 1,
      PurchaseDate: '',
      WarrantyExpiryDate: '',
      Cost: 0,
      CurrentValue: 0,
      StatusID: 0,
      Location: '',
      OrganizationID: organizationID,
    });
    setValidated(false);
    setShowModal(true);
  };

  const openEditModal = (item: AssetTracking) => {
    setEditItem(item);
    setFormData(item);
    setValidated(false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity() === false) {
      setValidated(true);
      return;
    }
    try {
      await AssetService.createAssetsTracking(formData);
      await loadTracking();
      setShowModal(false);
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const confirmDeleteItem = (id: number) => {
    setItemToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await AssetService.deleteAssetsTracking(itemToDelete);
      await loadTracking();
      setConfirmDelete(false);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <div className="mt-5">
      <h3>Assets Tracking</h3>

      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Asset Tracking
        </Button>
      </div>

      {/* =======================
          Table of Tracking Records
          ======================= */}
      {trackingList.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Vendor</th>
              <th>Branch</th>
              <th>Department</th>
              <th>Qty</th>
              <th>Purchase Date</th>
              <th>Warranty Expiry</th>
              <th>Cost</th>
              <th>Current Value</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trackingList.map(t => (
              <tr key={t.TrackingID}>
                <td>{assets.find(a => a.AssetID === t.AssetID)?.AssetName}</td>
                <td>{vendors.find(v => v.VendorID === t.VendorID)?.VendorName}</td>
                <td>{branches.find(b => b.BranchID === t.BranchID)?.BranchName}</td>
                <td>{departments.find(d => d.DepartmentID === t.DepartmentID)?.DepartmentName}</td>
                <td>{t.Quantity}</td>
                <td>{t.PurchaseDate}</td>
                <td>{t.WarrantyExpiryDate}</td>
                <td>{t.Cost}</td>
                <td>{t.CurrentValue}</td>
                <td>{statuses.find(s => s.id === t.StatusID)?.name}</td>
                <td>{t.Location}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => openEditModal(t)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => confirmDeleteItem(t.TrackingID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No asset tracking records found.</p>
      )}

      {/* =======================
          Add/Edit Modal
          ======================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editItem ? 'Edit Tracking' : 'Add Tracking'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              {/* Asset */}
              <Col md={4}>
                <Form.Group className="mb-3" controlId="AssetID">
                  <Form.Label>Asset</Form.Label>
                  <Form.Select
                    required
                    value={formData.AssetID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Asset --</option>
                    {assets.map(a => (
                      <option key={a.AssetID} value={a.AssetID}>
                        {a.AssetName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Vendor */}
              <Col md={4}>
                <Form.Group className="mb-3" controlId="VendorID">
                  <Form.Label>Vendor</Form.Label>
                  <Form.Select
                    required
                    value={formData.VendorID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Vendor --</option>
                    {vendors.map(v => (
                      <option key={v.VendorID} value={v.VendorID}>
                        {v.VendorName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Branch */}
              <Col md={4}>
                <Form.Group className="mb-3" controlId="BranchID">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    required
                    value={formData.BranchID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Branch --</option>
                    {branches.map(b => (
                      <option key={b.BranchID} value={b.BranchID}>
                        {b.BranchName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {/* Department */}
              <Col md={4}>
                <Form.Group className="mb-3" controlId="DepartmentID">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    required
                    value={formData.DepartmentID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d.DepartmentID} value={d.DepartmentID}>
                        {d.DepartmentName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Quantity */}
              <Col md={4}>
                <Form.Group className="mb-3" controlId="Quantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min={1}
                    value={formData.Quantity}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              {/* Status */}
              <Col md={4}>
                <Form.Group className="mb-3" controlId="StatusID">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    required
                    value={formData.StatusID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Status --</option>
                    {statuses.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="PurchaseDate">
                  <Form.Label>Purchase Date</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.PurchaseDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3" controlId="WarrantyExpiryDate">
                  <Form.Label>Warranty Expiry</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.WarrantyExpiryDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3" controlId="Cost">
                  <Form.Label>Cost</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min={0}
                    value={formData.Cost}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="CurrentValue">
                  <Form.Label>Current Value</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    min={0}
                    value={formData.CurrentValue}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group className="mb-3" controlId="Location">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.Location}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editItem ? 'Update' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* =======================
          Delete Confirmation
          ======================= */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
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

export default AssetTracking;
