import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import departmentService from '../../services/departmentService';
import branchService from '../../services/branchService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fireAudit } from '../../utils/auditUtils';

interface Department {
  DepartmentID: number;
  OrganizationID: number;
  BranchID: number | null;
  DepartmentCode: string;
  DepartmentName: string;
  Description: string;
  IsActive: boolean;
  CreatedBy: string;
}

interface Branch {
  BranchID: number;
  BranchName: string;
}

const ManageDepartments: React.FC = () => {
   const user = JSON.parse(localStorage.getItem('user') || '{}');
const organizationID: number | undefined = user?.organizationID;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [departmentFormData, setDepartmentFormData] = useState<Department>({
    DepartmentID: 0,
    OrganizationID: organizationID || 0,
    BranchID: null,
    DepartmentCode: '',
    DepartmentName: '',
    Description: '',
    IsActive: true,
    CreatedBy: 'admin',
  });

  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  // Fetch departments and branches on mount
  useEffect(() => {
    fetchDepartments();
    fetchBranches();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getdepartmentesAsync(departmentFormData.OrganizationID);
      setDepartments(data?.Table || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments.');
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchService.getBranchesAsync(departmentFormData.OrganizationID);
      setBranches(data?.Table || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setDepartmentFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' 
      ? checked 
      : (id === 'BranchID' ? (value === "" ? null : Number(value)) : value),
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      toast.warn('Please fill all required fields.');
      return;
    }

    try {
      const saved = await departmentService.createOrUpdatedepartmentAsync(departmentFormData);
      if (editDepartment) {
        setDepartments((prev) =>
          prev.map((d) => (d.DepartmentID === departmentFormData.DepartmentID ? departmentFormData : d))
        );
        toast.success('Department updated successfully!');
        fireAudit("UPDATE", "Department", editDepartment, departmentFormData, organizationID || 0, user?.name || user?.username || "Admin", "ManageDepartments");
      } else {
        const newId = saved?.[0]?.departmentID || Date.now();
        setDepartments((prev) => [...prev, { ...departmentFormData, DepartmentID: newId }]);
        toast.success('Department added successfully!');
        fireAudit("CREATE", "Department", null, departmentFormData, organizationID || 0, user?.name || user?.username || "Admin", "ManageDepartments");
      }
      setShowModal(false);
      setValidated(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Error saving department.');
    }
  };

  const openAddModal = () => {
    setEditDepartment(null);
    setDepartmentFormData({
      DepartmentID: 0,
      OrganizationID: organizationID || 0,
      BranchID: null,
      DepartmentCode: '',
      DepartmentName: '',
      Description: '',
      IsActive: true,
      CreatedBy: 'admin',
    });
    setShowModal(true);
  };

  const openEditModal = (department: Department) => {
    setEditDepartment(department);
    setDepartmentFormData(department);
    setShowModal(true);
  };

  const confirmDeleteDepartment = (id: number) => {
    setDepartmentToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (departmentToDelete !== null) {
      const oldData = departments.find(d => d.DepartmentID === departmentToDelete);
      try {
        await departmentService.deletedepartmentAsync(departmentToDelete);
        setDepartments((prev) => prev.filter((d) => d.DepartmentID !== departmentToDelete));
        toast.success('Department deleted successfully!');
        fireAudit("DELETE", "Department", oldData, null, organizationID || 0, user?.name || user?.username || "Admin", "ManageDepartments");
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department.');
      } finally {
        setConfirmDelete(false);
        setDepartmentToDelete(null);
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
            <i className="bi bi-diagram-2"></i>
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Manage Departments
            </div>

            <div
              style={{
                fontSize: ".8rem",
                opacity: 0.6,
              }}
            >
              Create and manage organization departments
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
          Add Department
        </Button>
      </div>

      {/* Table */}
      {departments.length > 0 ? (
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
                <th>Code</th>
                <th>Department Name</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((d) => (
                <tr key={d.DepartmentID}>
                  <td>{d.DepartmentCode}</td>

                  <td
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {d.DepartmentName}
                  </td>

                  <td>
                    {d.IsActive ? (
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
                        onClick={() => openEditModal(d)}
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
                          confirmDeleteDepartment(
                            d.DepartmentID
                          )
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
            className="bi bi-diagram-2"
            style={{
              fontSize: "2rem",
            }}
          />

          <div className="mt-2">
            No departments found.
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editDepartment
              ? "Edit Department"
              : "Add Department"}
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
                <Form.Group controlId="DepartmentCode">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Department Code *
                  </Form.Label>

                  <Form.Control
                    required
                    type="text"
                    value={departmentFormData.DepartmentCode}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    Department code is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="DepartmentName">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Department Name *
                  </Form.Label>

                  <Form.Control
                    required
                    type="text"
                    value={departmentFormData.DepartmentName}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    Department name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Branch dropdown if enabled later */}
              {/*
              <Col md={6}>
                <Form.Group controlId="BranchID">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={departmentFormData.BranchID || ""}
                    onChange={handleInputChange}
                    style={{ borderRadius: 8 }}
                  >
                    <option value="">
                      -- Select Branch --
                    </option>
                    {branches.map((b) => (
                      <option
                        key={b.BranchID}
                        value={b.BranchID}
                      >
                        {b.BranchName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              */}

              <Col
                md={6}
                className="d-flex align-items-center"
              >
                <Form.Check
                  id="IsActive"
                  type="checkbox"
                  label="Is Active"
                  checked={departmentFormData.IsActive}
                  onChange={handleInputChange}
                />
              </Col>

              <Col md={12}>
                <Form.Group controlId="Description">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Description
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={departmentFormData.Description}
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  />
                </Form.Group>
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
                {editDepartment
                  ? "Update Department"
                  : "Save Department"}
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
          department?
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

export default ManageDepartments;
