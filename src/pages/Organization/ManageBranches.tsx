import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import branchService from "../../services/branchService";
import { Branch } from "../../types/Branch";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageBranches: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
const organizationID: number | undefined = user?.organizationID;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFormData, setBranchFormData] = useState<Branch>({
    BranchID: 0,
    OrganizationID: organizationID || 0,
    BranchName: "",
    AddressLine1: "",
    AddressLine2: "",
    AddressLine3: "",
    City: "",
    State: "",
    Country: "",
    PostalCode: "",
    Phone1: "",
    Phone2: "",
    Email: "",
    IsHeadOffice: false,
    IsActive: true,
    IsDeleted: false,
    CreatedBy: "admin",
  });

  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  // ✅ Load branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await branchService.getBranchesAsync(branchFormData.OrganizationID);
      setBranches(data?.Table || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setBranchFormData((prev) => ({
      ...prev,
      [id.charAt(0).toUpperCase() + id.slice(1)]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      toast.warn("Please fill all required fields correctly.");
      return;
    }

    try {
      const saved = await branchService.createOrUpdateBranchAsync(branchFormData);

      if (editBranch) {
        setBranches((prev) =>
          prev.map((b) => (b.BranchID === branchFormData.BranchID ? branchFormData : b))
        );
        toast.success("Branch updated successfully!");
      } else {
        const newId = saved?.[0]?.BranchID || 0;
        setBranches((prev) => [...prev, { ...branchFormData, BranchID: newId }]);
        toast.success("Branch added successfully!");
      }

      setShowModal(false);
      setValidated(false);
      fetchBranches();
    } catch (error) {
      console.error("Error saving branch:", error);
      toast.error("Error saving branch. Please try again.");
    }
  };

  const openAddModal = () => {
    setEditBranch(null);
    setBranchFormData({
      BranchID: 0,
      OrganizationID: organizationID ?? 0,
      BranchName: "",
      AddressLine1: "",
      AddressLine2: "",
      AddressLine3: "",
      City: "",
      State: "",
      Country: "",
      PostalCode: "",
      Phone1: "",
      Phone2: "",
      Email: "",
      IsHeadOffice: false,
      IsActive: true,
      IsDeleted: false,
      CreatedBy: "admin",
    });
    setShowModal(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditBranch(branch);
    setBranchFormData(branch);
    setShowModal(true);
  };

  const confirmDeleteBranch = (id: number) => {
    setBranchToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (branchToDelete !== null) {
      try {
        await branchService.deleteBranchAsync(branchToDelete);
        setBranches((prev) => prev.filter((b) => b.BranchID !== branchToDelete));
        setBranchToDelete(null);
        setConfirmDelete(false);
        toast.success("Branch deleted successfully!");
      } catch (error) {
        console.error("Error deleting branch:", error);
        toast.error("Failed to delete branch. Please try again.");
      }
    }
  };

  return (
    <div className="mt-5">
      <h3>Manage Branches</h3>
      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Branch
        </Button>
      </div>

      {/* ✅ Branch Table */}
      {branches.length > 0 ? (
        <Table striped bordered hover responsive className="shadow-sm table-sm">
          <thead className="table-dark">
            <tr>
              <th>Branch Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.BranchID}>
                <td
                  style={{
                    color: b.IsHeadOffice ? "#198754" : "inherit",
                    fontWeight: b.IsHeadOffice ? "bold" : "normal",
                  }}
                >
                  {b.BranchName}
                </td>
                <td style={{ whiteSpace: "pre-line" }}>
                  {[b.AddressLine1, b.AddressLine2, b.AddressLine3, b.City, b.State, b.Country, b.PostalCode]
                    .filter(Boolean)
                    .join("\n")}
                </td>
                <td>{b.Phone1}</td>
                <td>{b.Email}</td>
                <td>
                  {b.IsActive ? (
                    <span className="badge bg-primary">Active</span>
                  ) : (
                    <span className="badge bg-danger">Inactive</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditModal(b)}
                    className="me-2"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDeleteBranch(b.BranchID)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No branches found.</p>
      )}

      {/* ✅ Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editBranch ? "Edit Branch" : "Add Branch"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="branchName">
                  <Form.Label>Branch Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={branchFormData.BranchName}
                    onChange={handleInputChange}
                    placeholder="Enter branch name"
                  />
                  <Form.Control.Feedback type="invalid">
                    Branch name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={branchFormData.Email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="addressLine1">
                  <Form.Label>Address Line 1</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={branchFormData.AddressLine1}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="addressLine2">
                  <Form.Label>Address Line 2</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchFormData.AddressLine2}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="addressLine3">
                  <Form.Label>Address Line 3</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchFormData.AddressLine3}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="city">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={branchFormData.City}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="state">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchFormData.State}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="country">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={branchFormData.Country}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="postalCode">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchFormData.PostalCode}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="phone1">
                  <Form.Label>Phone 1</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={branchFormData.Phone1}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="phone2">
                  <Form.Label>Phone 2</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchFormData.Phone2}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-center">
                <Form.Check
                  id="isHeadOffice"
                  type="checkbox"
                  label="Head Office"
                  checked={branchFormData.IsHeadOffice}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={3} className="d-flex align-items-center">
                <Form.Check
                  id="isActive"
                  type="checkbox"
                  label="Is Active"
                  checked={branchFormData.IsActive}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editBranch ? "Update" : "Save"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ✅ Delete Confirmation Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this branch?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageBranches;
