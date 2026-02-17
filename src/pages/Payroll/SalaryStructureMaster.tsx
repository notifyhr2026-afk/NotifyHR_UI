import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap';
import salaryService from '../../services/salaryService';

interface SalaryStructure {
  StructureID: number;
  StructureName: string;
  Description: string;
  IsActive: boolean;
}

interface LoggedInUser {
  organizationID: number;
}

const SalaryStructureMaster: React.FC = () => {
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID = user?.organizationID ?? 0;

  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editStructure, setEditStructure] =
    useState<SalaryStructure | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<SalaryStructure>({
    StructureID: 0,
    StructureName: '',
    Description: '',
    IsActive: true,
  });

  // ================= FETCH DATA =================
  const fetchStructures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salaryService.getSalaryStructuresAsync(organizationID);
      setStructures(data);
    } catch (err) {
      setError('Failed to load salary structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  // ================= INPUT CHANGE =================
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // ================= SAVE / UPDATE =================
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        structureID: editStructure ? formData.StructureID : 0,
        structureName: formData.StructureName,
        description: formData.Description,
        isActive: formData.IsActive,
        organizationID: organizationID,
      };

      const response = await salaryService.PostSalaryStructureByAsync({
        requestType: 'Salary/SaveOrUpdateSalaryStructure',
        ...payload,
      });

      if (response.value === 1) {
        setSuccessMessage(response.msg);
        setShowModal(false);
        setValidated(false);
        await fetchStructures();
      } else {
        setError(response.msg || 'Operation failed.');
      }
    } catch (err) {
      setError('Failed to save salary structure.');
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD =================
  const handleAdd = () => {
    setFormData({
      StructureID: 0,
      StructureName: '',
      Description: '',
      IsActive: true,
    });
    setEditStructure(null);
    setShowModal(true);
  };

  // ================= EDIT =================
  const handleEdit = (structure: SalaryStructure) => {
    setEditStructure(structure);
    setFormData(structure);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (structureID: number) => {
    if (!window.confirm('Are you sure you want to delete this structure?'))
      return;

    try {
      setLoading(true);
      const response =
        await salaryService.DeleteSalaryStructureByAsync(structureID);

      if (response[0]?.value === 1) {
        setSuccessMessage(response[0].msg);
        await fetchStructures();
      } else {
        setError(response[0]?.msg || 'Delete failed.');
      }
    } catch (err) {
      setError('Failed to delete salary structure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salary-structure-container mt-5">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Structure
        </Button>
      </div>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage(null)}
          dismissible
        >
          {successMessage}
        </Alert>
      )}

      {!loading && structures.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Structure Name</th>
              <th>Description</th>
              <th>Is Active?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {structures.map((s) => (
              <tr key={s.StructureID}>
                <td>{s.StructureName}</td>
                <td>{s.Description}</td>
                <td>{s.IsActive ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() =>
                      handleDelete(s.StructureID)
                    }
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && structures.length === 0 && (
        <p>No salary structures added yet.</p>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editStructure ? 'Edit Structure' : 'Add Structure'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Form.Group className="mb-3" controlId="StructureName">
              <Form.Label>Structure Name</Form.Label>
              <Form.Control
                required
                type="text"
                value={formData.StructureName}
                onChange={handleInputChange}
              />
              <Form.Control.Feedback type="invalid">
                Please enter structure name.
              </Form.Control.Feedback>
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

            <Form.Check
              className="mb-3"
              id="IsActive"
              label="Is Active"
              checked={formData.IsActive}
              onChange={handleInputChange}
            />

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editStructure ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SalaryStructureMaster;
