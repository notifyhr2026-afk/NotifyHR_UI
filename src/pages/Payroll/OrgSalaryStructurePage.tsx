import React, { useState, useEffect } from 'react';
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

interface OrgSalaryStructureComponent {
  StructureComponentID: number; // Unique ID
  OrganizationID: number;
  StructureID: number;
  ComponentID: number;
  CalculationTypeID: number;
  Value: number;
}

const OrgSalaryStructurePage: React.FC = () => {
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

  // Simulate StructureComponentMaster (all components of all structures)
  const [structureComponents] = useState<OrgSalaryStructureComponent[]>([
    { StructureComponentID: 1, OrganizationID: 0, StructureID: 1, ComponentID: 1, CalculationTypeID: 2, Value: 50 },
    { StructureComponentID: 2, OrganizationID: 0, StructureID: 1, ComponentID: 2, CalculationTypeID: 2, Value: 20 },
    { StructureComponentID: 3, OrganizationID: 0, StructureID: 2, ComponentID: 1, CalculationTypeID: 2, Value: 40 },
  ]);

  // Organization-level data (user edits/adds/deletes)
  const [orgComponents, setOrgComponents] = useState<OrgSalaryStructureComponent[]>([]);

  const [selectedStructureID, setSelectedStructureID] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [newComponentData, setNewComponentData] = useState<OrgSalaryStructureComponent>({
    StructureComponentID: 0,
    OrganizationID: 1, // Example org id
    StructureID: 0,
    ComponentID: 0,
    CalculationTypeID: 1,
    Value: 0,
  });

  // Load default components when structure changes
  useEffect(() => {
    if (selectedStructureID) {
      const filtered = structureComponents.filter(sc => sc.StructureID === selectedStructureID);
      setOrgComponents(filtered.map(sc => ({ ...sc, OrganizationID: 1 })));
    } else {
      setOrgComponents([]);
    }
  }, [selectedStructureID, structureComponents]);

  // Inline value change
  const handleValueChange = (id: number, value: number) => {
    setOrgComponents(prev =>
      prev.map(c => (c.StructureComponentID === id ? { ...c, Value: value } : c))
    );
  };

  // Delete component
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this component for organization?')) {
      setOrgComponents(prev => prev.filter(c => c.StructureComponentID !== id));
    }
  };

  // Add new component
  const handleAddNew = () => {
    setNewComponentData({
      StructureComponentID: Date.now(),
      OrganizationID: 1,
      StructureID: selectedStructureID,
      ComponentID: 0,
      CalculationTypeID: 1,
      Value: 0,
    });
    setShowModal(true);
  };

  const handleNewInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setNewComponentData(prev => ({
      ...prev,
      [id]: parseInt(value),
    }));
  };

  const handleSaveNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComponentData.ComponentID) return alert('Please select a component.');
    setOrgComponents(prev => [...prev, newComponentData]);
    setShowModal(false);
  };

  // Final Save button
  const handleFinalSave = () => {
    if (orgComponents.length === 0) return alert('No data to save.');
    // Here you can call your API to save orgComponents to TblOrgSalaryStructureComponents
    console.log('Saving data:', orgComponents);
    alert('Organization Salary Structure saved successfully!');
  };

  return (
    <div className="org-salary-structure-container mt-5">
      <h3>Organization Salary Structure Management</h3>

      {/* Structure Selector */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="selectedStructureID">
            <Form.Label>Select Salary Structure</Form.Label>
            <Form.Select
              value={selectedStructureID}
              onChange={e => setSelectedStructureID(parseInt(e.target.value))}
            >
              <option value={0}>-- Select Structure --</option>
              {structures.map(s => (
                <option key={s.StructureID} value={s.StructureID}>
                  {s.StructureName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="text-end d-flex align-items-end justify-content-end">
          <Button
            variant="success"
            onClick={handleAddNew}
            disabled={!selectedStructureID}
          >
            + Add Component
          </Button>
        </Col>
      </Row>

      {/* Editable Table */}
      {orgComponents.length ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Component</th>
              <th>Calculation Type</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgComponents.map(c => (
              <tr key={c.StructureComponentID}>
                <td>{components.find(comp => comp.ComponentID === c.ComponentID)?.ComponentName}</td>
                <td>{calculationTypes.find(ct => ct.CalculationTypeID === c.CalculationTypeID)?.CalculationName}</td>
                <td>
                  <Form.Control
                    type="number"
                    value={c.Value}
                    step="0.01"
                    onChange={e => handleValueChange(c.StructureComponentID, parseFloat(e.target.value))}
                  />
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(c.StructureComponentID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Select a structure to see its components.</p>
      )}

      {/* Final Save Button */}
      {orgComponents.length > 0 && (
        <div className="text-end mt-3">
          <Button variant="primary" onClick={handleFinalSave}>
            Save Organization Structure
          </Button>
        </div>
      )}

      {/* Add New Component Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Component</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveNew}>
            <Form.Group className="mb-3" controlId="ComponentID">
              <Form.Label>Component</Form.Label>
              <Form.Select
                value={newComponentData.ComponentID}
                onChange={handleNewInputChange}
                required
              >
                <option value={0}>-- Select Component --</option>
                {components.map(c => (
                  <option key={c.ComponentID} value={c.ComponentID}>
                    {c.ComponentName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="CalculationTypeID">
              <Form.Label>Calculation Type</Form.Label>
              <Form.Select
                value={newComponentData.CalculationTypeID}
                onChange={handleNewInputChange}
              >
                {calculationTypes.map(ct => (
                  <option key={ct.CalculationTypeID} value={ct.CalculationTypeID}>
                    {ct.CalculationName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="Value">
              <Form.Label>Value</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={newComponentData.Value}
                onChange={e =>
                  setNewComponentData(prev => ({ ...prev, Value: parseFloat(e.target.value) }))
                }
              />
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrgSalaryStructurePage;
