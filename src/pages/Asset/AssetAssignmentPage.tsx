import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

import AssetService from '../../services/AssetService';
import branchService from '../../services/branchService';
import departmentService from '../../services/departmentService';

/* ===========================
   Interfaces
   =========================== */
interface AssetAssignment {
  AssetAssignmentID: number;
  AssetID: number;
  AssignedToEmployeeID: number;
  AssignedToDepartmentID: number;
  AssignedDate: string;
  ExpectedReturnDate: string;
  ActualReturnDate: string;
  ConditionOnReturn: string;
  Remarks: string;
  OrganizationID: number;
}

interface Asset {
  AssetID: number;
  AssetName: string;
}

interface Branch {
  BranchID: number;
  BranchName: string;
}

interface Department {
  DepartmentID: number;
  DepartmentName: string;
}

interface LoggedInUser {
  organizationID: number;
}

/* ===========================
   Static Employees (TEMP)
   =========================== */
const employees = [
  { id: 1, name: 'Alice', branchId: 1 },
  { id: 2, name: 'Bob', branchId: 2 },
];

/* ===========================
   Component
   =========================== */
const AssetAssignmentPage: React.FC = () => {
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;
  const organizationID = user?.organizationID ?? 0;

  /* ===========================
     State
     =========================== */
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [selectedBranchID, setSelectedBranchID] = useState<number>(0);

  const [formData, setFormData] = useState<AssetAssignment>({
    AssetAssignmentID: 0,
    AssetID: 0,
    AssignedToEmployeeID: 0,
    AssignedToDepartmentID: 0,
    AssignedDate: '',
    ExpectedReturnDate: '',
    ActualReturnDate: '',
    ConditionOnReturn: '',
    Remarks: '',
    OrganizationID: organizationID,
  });

  const [editItem, setEditItem] = useState<AssetAssignment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  /* ===========================
     Load Data
     =========================== */
  useEffect(() => {
    if (organizationID > 0) {
      loadAssignments();
      loadAssets();
      loadBranches();
      loadDepartments();
    }
  }, [organizationID]);

  const loadAssignments = async () => {
    const res = await AssetService.getAssetAssignment(organizationID);
    setAssignments(res?.Table ?? []);
  };

  const loadAssets = async () => {
    const res = await AssetService.getAssets(organizationID);
    setAssets(res?.Table ?? []);
  };

  const loadBranches = async () => {
    const res = await branchService.getBranchesAsync(organizationID);
    setBranches(res?.Table ?? []);
  };

  const loadDepartments = async () => {
    const res = await departmentService.getdepartmentesAsync(organizationID);
    setDepartments(res?.Table ?? []);
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
      [id]: Number(value) || value,
    }));
  };

  const openAddModal = () => {
    setEditItem(null);
    setSelectedBranchID(0);
    setFormData({
      AssetAssignmentID: 0,
      AssetID: 0,
      AssignedToEmployeeID: 0,
      AssignedToDepartmentID: 0,
      AssignedDate: '',
      ExpectedReturnDate: '',
      ActualReturnDate: '',
      ConditionOnReturn: '',
      Remarks: '',
      OrganizationID: organizationID,
    });
    setValidated(false);
    setShowModal(true);
  };

  const openEditModal = (item: AssetAssignment) => {
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

    await AssetService.createAssetAssignment(formData);
    await loadAssignments();
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await AssetService.deleteAssetAssignment(itemToDelete);
    await loadAssignments();
    setConfirmDelete(false);
  };

  /* ===========================
     Filter Employees by Branch
     =========================== */
  const filteredEmployees =
    selectedBranchID > 0
      ? employees.filter(e => e.branchId === selectedBranchID)
      : employees;

  /* ===========================
     Render
     =========================== */
  return (
    <div className="mt-5">
      <h3>Asset Assignment</h3>

      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Assign Asset
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Assigned Date</th>
            <th>Expected Return</th>
            <th>Actual Return</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(a => (
            <tr key={a.AssetAssignmentID}>
              <td>{assets.find(x => x.AssetID === a.AssetID)?.AssetName}</td>
              <td>{employees.find(x => x.id === a.AssignedToEmployeeID)?.name}</td>
              <td>{departments.find(x => x.DepartmentID === a.AssignedToDepartmentID)?.DepartmentName}</td>
              <td>{a.AssignedDate}</td>
              <td>{a.ExpectedReturnDate}</td>
              <td>{a.ActualReturnDate}</td>
              <td>{a.Remarks}</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => openEditModal(a)}>
                  Edit
                </Button>{' '}
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => {
                    setItemToDelete(a.AssetAssignmentID);
                    setConfirmDelete(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ===========================
          Add / Edit Modal
          =========================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editItem ? 'Edit Assignment' : 'Assign Asset'}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              <Col md={4}>
                <Form.Group controlId="AssetID">
                  <Form.Label>Asset</Form.Label>
                  <Form.Select required value={formData.AssetID} onChange={handleInputChange}>
                    <option value={0}>-- Select Asset --</option>
                    {assets.map(a => (
                      <option key={a.AssetID} value={a.AssetID}>
                        {a.AssetName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Branch (UI only) */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={selectedBranchID}
                    onChange={e => setSelectedBranchID(Number(e.target.value))}
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

              {/* Employee */}
              <Col md={4}>
                <Form.Group controlId="AssignedToEmployeeID">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    required
                    value={formData.AssignedToEmployeeID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Employee --</option>
                    {filteredEmployees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={4}>
                <Form.Group controlId="AssignedToDepartmentID">
                  <Form.Label>Assigned Department</Form.Label>
                  <Form.Select
                    required
                    value={formData.AssignedToDepartmentID}
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

              <Col md={4}>
                <Form.Group controlId="AssignedDate">
                  <Form.Label>Assigned Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.AssignedDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="ExpectedReturnDate">
                  <Form.Label>Expected Return</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.ExpectedReturnDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Group controlId="ConditionOnReturn">
                  <Form.Label>Condition on Return</Form.Label>
                  <Form.Control value={formData.ConditionOnReturn} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="Remarks">
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.Remarks}
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
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Body>Are you sure you want to delete?</Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssetAssignmentPage;
