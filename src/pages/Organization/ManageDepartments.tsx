import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import departmentService from '../../services/departmentService';
import branchService from '../../services/branchService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Department {
  DepartmentID: number;
  OrganizationID: number;
  BranchID: number;
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
    BranchID: 0,
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
      [id]: type === 'checkbox' ? checked : id === 'BranchID' ? Number(value) : value,
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
      } else {
        const newId = saved?.[0]?.departmentID || Date.now();
        setDepartments((prev) => [...prev, { ...departmentFormData, DepartmentID: newId }]);
        toast.success('Department added successfully!');
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
      BranchID: 0,
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
      try {
        await departmentService.deletedepartmentAsync(departmentToDelete);
        setDepartments((prev) => prev.filter((d) => d.DepartmentID !== departmentToDelete));
        toast.success('Department deleted successfully!');
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
    <div className="mt-5">
      <h3>Manage Departments</h3>
      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Department
        </Button>
      </div>

      {/* Department Table */}
      {departments.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.DepartmentID}>
                <td>{d.DepartmentCode}</td>
                <td>{d.DepartmentName}</td>
                <td>{branches.find((b) => b.BranchID === d.BranchID)?.BranchName || 'N/A'}</td>
                <td>
                  {d.IsActive ? (
                    <span className="badge bg-primary">Active</span>
                  ) : (
                    <span className="badge bg-danger">Inactive</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditModal(d)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDeleteDepartment(d.DepartmentID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No departments found.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editDepartment ? 'Edit Department' : 'Add Department'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="DepartmentCode">
                  <Form.Label>Department Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={departmentFormData.DepartmentCode}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Department code is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="DepartmentName">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={departmentFormData.DepartmentName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Department name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="BranchID">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    required
                    value={departmentFormData.BranchID || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Branch --</option>
                    {branches.map((b) => (
                      <option key={b.BranchID} value={b.BranchID}>
                        {b.BranchName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a branch.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="d-flex align-items-center">
                <Form.Check
                  id="IsActive"
                  type="checkbox"
                  label="Is Active"
                  checked={departmentFormData.IsActive}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Form.Group controlId="Description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={departmentFormData.Description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editDepartment ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this department?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageDepartments;
