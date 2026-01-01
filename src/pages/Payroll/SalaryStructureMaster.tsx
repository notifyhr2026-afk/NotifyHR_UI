import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

interface SalaryStructure {
  StructureID: number;
  StructureName: string;
  Description: string;
  IsActive: boolean;
}

const SalaryStructureMaster: React.FC = () => {
  // Sample static data
  const [structures, setStructures] = useState<SalaryStructure[]>([
    {
      StructureID: 1,
      StructureName: 'Standard Salary Structure',
      Description: 'Default structure for all employees',
      IsActive: true,
    },
    {
      StructureID: 2,
      StructureName: 'Contract Employee Structure',
      Description: 'Structure for contract-based employees',
      IsActive: false,
    },
    {
      StructureID: 3,
      StructureName: 'Intern Salary Structure',
      Description: 'Structure for interns',
      IsActive: true,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editStructure, setEditStructure] = useState<SalaryStructure | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<SalaryStructure>({
    StructureID: 0,
    StructureName: '',
    Description: '',
    IsActive: true,
  });

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save Add/Edit
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (editStructure) {
      setStructures((prev) =>
        prev.map((s) => (s.StructureID === editStructure.StructureID ? formData : s))
      );
    } else {
      setStructures((prev) => [...prev, { ...formData, StructureID: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      StructureID: Date.now(),
      StructureName: '',
      Description: '',
      IsActive: true,
    });
    setEditStructure(null);
    setShowModal(true);
  };

  const handleEdit = (structure: SalaryStructure) => {
    setEditStructure(structure);
    setFormData(structure);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this structure?')) {
      setStructures((prev) => prev.filter((s) => s.StructureID !== id));
    }
  };

  return (
    <div className="salary-structure-container mt-5">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Structure
        </Button>
      </div>

      {structures.length ? (
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
                    onClick={() => handleDelete(s.StructureID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No salary structures added yet.</p>
      )}

      {/* Add/Edit Modal */}
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
              <Button variant="secondary" onClick={() => setShowModal(false)}>
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
