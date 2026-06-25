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
  <>
    <ToastContainer position="top-right" autoClose={3000} />

    <div
      style={{
        background: "var(--card-bg, #fff)",
        borderRadius: 12,
        padding: 24,
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(13,110,253,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0d6efd",
            }}
          >
            <i className="bi bi-building"></i>
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Manage Branches
            </div>

            <div
              style={{
                fontSize: ".8rem",
                opacity: 0.6,
              }}
            >
              Create and manage organization branches
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          style={{
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Branch
        </Button>
      </div>

      {/* Branch Table */}
      {branches.length > 0 ? (
        <div
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Table hover responsive className="mb-0">
            <thead
              style={{
                background: "rgba(0,0,0,.03)",
              }}
            >
              <tr>
                <th>Branch Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {branches.map((b) => (
                <tr key={b.BranchID}>
                  <td
                    style={{
                      color: b.IsHeadOffice
                        ? "#198754"
                        : "inherit",
                      fontWeight: b.IsHeadOffice
                        ? 600
                        : 500,
                    }}
                  >
                    {b.BranchName}

                    {b.IsHeadOffice && (
                      <span className="badge bg-success ms-2">
                        Head Office
                      </span>
                    )}
                  </td>

                  <td
                    style={{
                      whiteSpace: "pre-line",
                    }}
                  >
                    {[
                      b.AddressLine1,
                      b.AddressLine2,
                      b.AddressLine3,
                      b.City,
                      b.State,
                      b.Country,
                      b.PostalCode,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  </td>

                  <td>{b.Phone1}</td>

                  <td>{b.Email}</td>

                  <td>
                    {b.IsActive ? (
                      <span className="badge bg-primary">
                        Active
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(b)}
                        style={{
                          borderRadius: 8,
                        }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          confirmDeleteBranch(b.BranchID)
                        }
                        style={{
                          borderRadius: 8,
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "50px 20px",
            border: "1px dashed var(--border-color)",
            borderRadius: 10,
            opacity: 0.7,
          }}
        >
          <i
            className="bi bi-building"
            style={{
              fontSize: "2rem",
            }}
          />

          <div className="mt-2">
            No branches found.
          </div>
        </div>
      )}

      {/* Add/Edit Branch Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editBranch
              ? "Edit Branch"
              : "Add Branch"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form
            noValidate
            validated={validated}
            onSubmit={handleSave}
          >
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="branchName">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Branch Name *
                  </Form.Label>

                  <Form.Control
                    required
                    type="text"
                    value={branchFormData.BranchName}
                    onChange={handleInputChange}
                    placeholder="Enter branch name"
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    Branch name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Email
                  </Form.Label>

                  <Form.Control
                    type="email"
                    value={branchFormData.Email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="addressLine1">
                  <Form.Label>Address Line 1</Form.Label>
                  <Form.Control
                    required
                    value={branchFormData.AddressLine1}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="addressLine2">
                  <Form.Label>Address Line 2</Form.Label>
                  <Form.Control
                    value={branchFormData.AddressLine2}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="addressLine3">
                  <Form.Label>Address Line 3</Form.Label>
                  <Form.Control
                    value={branchFormData.AddressLine3}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="city">
                  <Form.Label>City *</Form.Label>
                  <Form.Control
                    required
                    value={branchFormData.City}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="state">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    value={branchFormData.State}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="country">
                  <Form.Label>Country *</Form.Label>
                  <Form.Control
                    required
                    value={branchFormData.Country}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="postalCode">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    value={branchFormData.PostalCode}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="phone1">
                  <Form.Label>Phone 1 *</Form.Label>
                  <Form.Control
                    required
                    value={branchFormData.Phone1}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="phone2">
                  <Form.Label>Phone 2</Form.Label>
                  <Form.Control
                    value={branchFormData.Phone2}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                    }}
                  />
                </Form.Group>
              </Col>

              <Col
                md={3}
                className="d-flex align-items-center"
              >
                <Form.Check
                  id="isHeadOffice"
                  type="checkbox"
                  label="Head Office"
                  checked={branchFormData.IsHeadOffice}
                  onChange={handleInputChange}
                />
              </Col>

              <Col
                md={3}
                className="d-flex align-items-center"
              >
                <Form.Check
                  id="isActive"
                  type="checkbox"
                  label="Is Active"
                  checked={branchFormData.IsActive}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop:
                  "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(false)}
                style={{
                  borderRadius: 8,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                type="submit"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                {editBranch
                  ? "Update Branch"
                  : "Save Branch"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this
          branch?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setConfirmDelete(false)}
            style={{
              borderRadius: 8,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            style={{
              borderRadius: 8,
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  </>
);
};

export default ManageBranches;
