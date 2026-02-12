import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import AssetService from '../../services/AssetService';
import LoggedInUser from '../../types/LoggedInUser'
/* ===========================
   Interfaces
   =========================== */
interface Asset {
  AssetID: number;
  OrganizationID: number;
  AssetCategoryID: number;
  AssetTag: string;
  AssetName: string;
  Description: string;
}

interface AssetCategory {
  AssetCategoryID: number;
  CategoryName: string;
  Description?: string;
  IsActive: boolean;
}


const ManageAssets: React.FC = () => {
  /* ===========================
     User / Org
     =========================== */
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;
  const organizationID = user?.organizationID ?? 0;

  /* ===========================
     State
     =========================== */
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Asset>({
    AssetID: 0,
    OrganizationID: organizationID,
    AssetCategoryID: 0,
    AssetTag: '',
    AssetName: '',
    Description: '',
  });

  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  /* ===========================
     Load Assets + Categories
     =========================== */
  useEffect(() => {
    if (organizationID > 0) {
      loadAssets();
      loadCategories();
    }
  }, [organizationID]);

  const loadAssets = async () => {
    try {
      const response = await AssetService.getAssets(organizationID);
      setAssets(response?.Table ?? []);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await AssetService.getAssetCategories();
      setCategories(response?.Table ?? []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  /* ===========================
     Handlers
     =========================== */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'AssetCategoryID' ? Number(value) : value,
    }));
  };

  const openAddModal = () => {
    setEditAsset(null);
    setFormData({
      AssetID: 0,
      OrganizationID: organizationID,
      AssetCategoryID: 0,
      AssetTag: '',
      AssetName: '',
      Description: '',
    });
    setValidated(false);
    setShowModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditAsset(asset);
    setFormData(asset);
    setValidated(false);
    setShowModal(true);
  };

  /* ===========================
     Save Asset
     =========================== */
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    try {
      await AssetService.createAsset(formData);
      await loadAssets();
      setShowModal(false);
    } catch (error) {
      console.error('Save asset failed:', error);
    }
  };

  /* ===========================
     Delete Asset
     =========================== */
  const confirmDeleteAsset = (id: number) => {
    setAssetToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;

    try {
      await AssetService.deleteAsset(assetToDelete);
      await loadAssets();
      setConfirmDelete(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error('Delete asset failed:', error);
    }
  };

  /* ===========================
     Search Filter
     =========================== */
  const filteredAssets = assets.filter(asset =>
    asset.AssetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ===========================
     Render
     =========================== */
  return (
    <div className="mt-5">
      <h3>Manage Assets</h3>

      <Row className="align-items-center mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search by Asset Name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="success" onClick={openAddModal}>
            + Add Asset
          </Button>
        </Col>
      </Row>

      {filteredAssets.length > 0 ? (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Category</th>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Description</th>
              <th style={{ width: '160px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(a => (
              <tr key={a.AssetID}>
                <td>
                  {
                    categories.find(c => c.AssetCategoryID === a.AssetCategoryID)
                      ?.CategoryName
                  }
                </td>
                <td>{a.AssetTag}</td>
                <td>{a.AssetName}</td>
                <td>{a.Description}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => openEditModal(a)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => confirmDeleteAsset(a.AssetID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No assets found.</p>
      )}

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editAsset ? 'Edit Asset' : 'Add Asset'}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="AssetCategoryID">
                  <Form.Label>Asset Category</Form.Label>
                  <Form.Select
                    required
                    value={formData.AssetCategoryID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.AssetCategoryID} value={c.AssetCategoryID}>
                        {c.CategoryName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a category.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="AssetTag">
                  <Form.Label>Asset Tag</Form.Label>
                  <Form.Control
                    required
                    value={formData.AssetTag}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="AssetName">
              <Form.Label>Asset Name</Form.Label>
              <Form.Control
                required
                value={formData.AssetName}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="Description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.Description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editAsset ? 'Update' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this asset?</Modal.Body>
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

export default ManageAssets;
