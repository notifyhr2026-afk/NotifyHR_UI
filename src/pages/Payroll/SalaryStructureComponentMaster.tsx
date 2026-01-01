import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

interface SalaryStructure {
  StructureID: number;
  StructureName: string;
}

interface SalaryComponent {
  ComponentID: number;
  ComponentName: string;
}

interface CalculationType {
  CalculationTypeID: number;
  CalculationName: string;
}

interface SalaryStructureComponent {
  StructureComponentID: number;
  StructureID: number;
  ComponentID: number;
  CalculationTypeID: number;
  Value: number;
}

const SalaryStructureComponentMaster: React.FC = () => {
  // Sample static data
  const [structures] = useState<SalaryStructure[]>([
    { StructureID: 1, StructureName: 'Standard Salary Structure' },
    { StructureID: 2, StructureName: 'Contract Employee Structure' },
  ]);

  const [components] = useState<SalaryComponent[]>([
    { ComponentID: 1, ComponentName: 'Basic Pay' },
    { ComponentID: 2, ComponentName: 'House Rent Allowance' },
    { ComponentID: 3, ComponentName: 'Provident Fund' },
  ]);

  const [calculationTypes] = useState<CalculationType[]>([
    { CalculationTypeID: 1, CalculationName: 'Fixed' },
    { CalculationTypeID: 2, CalculationName: '% of Basic' },
    { CalculationTypeID: 3, CalculationName: '% of Gross' },
  ]);

  const [structureComponents, setStructureComponents] = useState<SalaryStructureComponent[]>([
    {
      StructureComponentID: 1,
      StructureID: 1,
      ComponentID: 1,
      CalculationTypeID: 2,
      Value: 50,
    },
    {
      StructureComponentID: 2,
      StructureID: 1,
      ComponentID: 2,
      CalculationTypeID: 2,
      Value: 20,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SalaryStructureComponent | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<SalaryStructureComponent>({
    StructureComponentID: 0,
    StructureID: 0,
    ComponentID: 0,
    CalculationTypeID: 1,
    Value: 0,
  });

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) : parseInt(value),
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

    if (editItem) {
      setStructureComponents((prev) =>
        prev.map((s) =>
          s.StructureComponentID === editItem.StructureComponentID ? formData : s
        )
      );
    } else {
      setStructureComponents((prev) => [
        ...prev,
        { ...formData, StructureComponentID: Date.now() },
      ]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      StructureComponentID: Date.now(),
      StructureID: 0,
      ComponentID: 0,
      CalculationTypeID: 1,
      Value: 0,
    });
    setEditItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: SalaryStructureComponent) => {
    setEditItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this structure component?')) {
      setStructureComponents((prev) => prev.filter((s) => s.StructureComponentID !== id));
    }
  };

  return (
    <div className="salary-structure-component-container mt-5">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Structure Component
        </Button>
      </div>

      {structureComponents.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Structure</th>
              <th>Component</th>
              <th>Calculation Type</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {structureComponents.map((s) => (
              <tr key={s.StructureComponentID}>
                <td>{structures.find((st) => st.StructureID === s.StructureID)?.StructureName}</td>
                <td>{components.find((c) => c.ComponentID === s.ComponentID)?.ComponentName}</td>
                <td>
                  {calculationTypes.find((ct) => ct.CalculationTypeID === s.CalculationTypeID)
                    ?.CalculationName}
                </td>
                <td>{s.Value}</td>
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
                    onClick={() => handleDelete(s.StructureComponentID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No structure components added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Edit Structure Component' : 'Add Structure Component'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="StructureID">
                  <Form.Label>Structure</Form.Label>
                  <Form.Select
                    required
                    value={formData.StructureID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Structure --</option>
                    {structures.map((s) => (
                      <option key={s.StructureID} value={s.StructureID}>
                        {s.StructureName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a structure.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="ComponentID">
                  <Form.Label>Component</Form.Label>
                  <Form.Select
                    required
                    value={formData.ComponentID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>-- Select Component --</option>
                    {components.map((c) => (
                      <option key={c.ComponentID} value={c.ComponentID}>
                        {c.ComponentName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a component.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="CalculationTypeID">
                  <Form.Label>Calculation Type</Form.Label>
                  <Form.Select
                    required
                    value={formData.CalculationTypeID}
                    onChange={handleInputChange}
                  >
                    {calculationTypes.map((ct) => (
                      <option key={ct.CalculationTypeID} value={ct.CalculationTypeID}>
                        {ct.CalculationName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="Value">
                  <Form.Label>Value</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    step="0.01"
                    value={formData.Value}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a value.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editItem ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SalaryStructureComponentMaster;
