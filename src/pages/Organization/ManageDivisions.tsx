import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import divisionService from '../../services/divisionService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Division {
  DivisionID: number;
  OrganizationID: number;
  DivisionCode: string;
  DivisionName: string;
  ParentDivisionID: number | null;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedBy: string;
}

const ManageDivisions: React.FC = () => {
   const user = JSON.parse(localStorage.getItem('user') || '{}');
const organizationID: number | undefined = user?.organizationID;
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [divisionFormData, setDivisionFormData] = useState<Division>({
    DivisionID: 0,
    OrganizationID: organizationID || 0,
    DivisionCode: '',
    DivisionName: '',
    ParentDivisionID: null,
    IsActive: true,
    IsDeleted: false,
    CreatedBy: 'admin',
  });

  const [editDivision, setEditDivision] = useState<Division | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  // ✅ Load divisions on mount
  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const data = await divisionService.getdivisionesAsync(divisionFormData.OrganizationID);
      setDivisions(data?.Table || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error('Failed to load divisions.');
    }
  };

  // ✅ Fixed input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;

    setDivisionFormData((prev) => ({
      ...prev,
      [id]:
        type === 'checkbox'
          ? checked
          : id === 'ParentDivisionID'
          ? value === '' ? null : Number(value)
          : value,
    }));
  };

  // ✅ Save or update division
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      // toast.warn('Please fill all required fields correctly.');
      return;
    }

    try {
      const saved = await divisionService.createOrUpdatedivisionAsync(divisionFormData);

      if (editDivision) {
        // ✅ Update existing division
        setDivisions((prev) =>
          prev.map((d) => (d.DivisionID === divisionFormData.DivisionID ? divisionFormData : d))
        );
        toast.success('Division updated successfully!');
      } else {
        // ✅ Add new division
        const newId = saved?.[0]?.DivisionID || 0;
        setDivisions((prev) => [...prev, { ...divisionFormData, DivisionID: newId }]);
        toast.success('Division added successfully!');
      }

      setShowModal(false);
      setValidated(false);
      fetchDivisions();
    } catch (error) {
      console.error('Error saving division:', error);
      toast.error('Error saving division. Please try again.');
    }
  };

  const openAddModal = () => {
    setEditDivision(null);
    setDivisionFormData({
      DivisionID: 0,
      OrganizationID: organizationID || 0,
      DivisionCode: '',
      DivisionName: '',
      ParentDivisionID: null,
      IsActive: true,
      IsDeleted: false,
      CreatedBy: 'admin',
    });
    setShowModal(true);
  };

  const openEditModal = (division: Division) => {
    setEditDivision(division);
    setDivisionFormData(division);
    setShowModal(true);
  };

  const confirmDeleteDivision = (id: number) => {
    setDivisionToDelete(id);
    setConfirmDelete(true);
  };

  // ✅ Delete division
  const handleDelete = async () => {
    if (divisionToDelete !== null) {
      try {
        await divisionService.deletedivisionAsync(divisionToDelete);
        setDivisions((prev) => prev.filter((d) => d.DivisionID !== divisionToDelete));
        setDivisionToDelete(null);
        setConfirmDelete(false);
        toast.success('Division deleted successfully!');
      } catch (error) {
        console.error('Error deleting division:', error);
        toast.error('Failed to delete division.');
      }
    }
  };

  return (
    <div className="mt-5">
      <h3>Manage Divisions</h3>
      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Division
        </Button>
      </div>

      {/* ✅ Division Table */}
      {divisions.length > 0 ? (
        <Table striped bordered hover responsive className="shadow-sm table-sm">
          <thead className="table-dark">
            <tr>
              <th>Division Code</th>
              <th>Division Name</th>
              <th>Parent Division</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((d) => (
              <tr key={d.DivisionID}>
                <td>{d.DivisionCode}</td>
                <td>{d.DivisionName}</td>
                <td>
                  {divisions.find((p) => p.DivisionID === d.ParentDivisionID)?.DivisionName || 'N/A'}
                </td>
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
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDeleteDivision(d.DivisionID)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No divisions found.</p>
      )}

      {/* ✅ Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editDivision ? 'Edit Division' : 'Add Division'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="DivisionCode">
                  <Form.Label>Division Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={divisionFormData.DivisionCode}
                    onChange={handleInputChange}
                    placeholder="Enter code"
                  />
                  <Form.Control.Feedback type="invalid">
                    Division code is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="DivisionName">
                  <Form.Label>Division Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={divisionFormData.DivisionName}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                  />
                  <Form.Control.Feedback type="invalid">
                    Division name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="ParentDivisionID">
                  <Form.Label>Parent Division</Form.Label>
                  <Form.Select
                    value={divisionFormData.ParentDivisionID ?? ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- None --</option>
                    {divisions
                      .filter((d) => d.DivisionID !== divisionFormData.DivisionID)
                      .map((d) => (
                        <option key={d.DivisionID} value={d.DivisionID}>
                          {d.DivisionName}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} className="d-flex align-items-center">
                <Form.Check
                  id="IsActive"
                  type="checkbox"
                  label="Is Active"
                  checked={divisionFormData.IsActive}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editDivision ? 'Update' : 'Save'}
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
        <Modal.Body>Are you sure you want to delete this division?</Modal.Body>
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

export default ManageDivisions;
