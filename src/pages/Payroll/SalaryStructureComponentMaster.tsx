import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
} from 'react-bootstrap';
import salaryService from '../../services/salaryService';

/* ===================== INTERFACES ===================== */

interface SalaryStructure {
  StructureID: number;
  StructureName: string;
  Description: string;
  IsActive: boolean;
}

interface SalaryComponent {
  ComponentID: number;
  ComponentName: string;
}

interface CalculationType {
  CalculationTypeID: number;
  CalculationName: string;
}

/* API / Table model */
interface SalaryStructureComponent {
  StructureComponentID: number;
  StructureID: number;
  StructureName: string;
  ComponentName: string;
  ComponentCode: string;
  CalculationTypeName: string;
  Value: number;
}

/* Form model */
interface SalaryStructureComponentForm {
  StructureComponentID: number;
  StructureID: number;
  ComponentID: number;
  CalculationTypeID: number;
  Value: number;
}

/* ===================== COMPONENT ===================== */

const SalaryStructureComponentMaster: React.FC = () => {
  /* ---------- Static master data ---------- */
const [structures, setStructures] = useState<SalaryStructure[]>([]);
const [structureLoading, setStructureLoading] = useState(false);

const [structureComponentsOptions, setStructureComponentsOptions] = useState<SalaryComponent[]>([]);
const [loadingComponents, setLoadingComponents] = useState(false);

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

  /* ---------- API state ---------- */
  const [structureComponents, setStructureComponents] =
    useState<SalaryStructureComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- UI state ---------- */
const [showModal, setShowModal] = useState(false);
const [editItem, setEditItem] = useState<SalaryStructureComponent | null>(null); // ✅ add this
const [validated, setValidated] = useState(false);
  const [selectedStructureFilter, setSelectedStructureFilter] = useState<number>(0);

  /* ---------- Form state ---------- */
  const [formData, setFormData] = useState<SalaryStructureComponentForm>({
    StructureComponentID: 0,
    StructureID: 0,
    ComponentID: 0,
    CalculationTypeID: 1,
    Value: 0,
  });

  /* ===================== EFFECTS ===================== */

  useEffect(() => {
    if (!selectedStructureFilter) return;

    const fetchStructureComponents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await salaryService.GetStructureComponentsAsync(
          selectedStructureFilter
        );
        setStructureComponents(data);
      } catch {
        setError('Failed to load salary components');
      } finally {
        setLoading(false);
      }
    };

    fetchStructureComponents();
  }, [selectedStructureFilter]);

  useEffect(() => {
  const fetchStructures = async () => {
    try {
      setStructureLoading(true);
      const data = await salaryService.getSalaryStructuresAsync();
      setStructures(data.filter((s: SalaryStructure) => s.IsActive));
    } catch {
      console.error('Failed to load salary structures');
    } finally {
      setStructureLoading(false);
    }
  };

  fetchStructures();
}, []);

useEffect(() => {
  const fetchComponentsForStructure = async (structureID: number) => {
    if (!structureID) {
      setStructureComponentsOptions([]);
      return;
    }

    try {
      setLoadingComponents(true);
      const data = await salaryService.GetStructureComponentsAsync(structureID);

      // Map API data to { ComponentID, ComponentName }
      const componentsList: SalaryComponent[] = data.map((c: any) => ({
        ComponentID: c.StructureComponentID, // Use StructureComponentID as unique ID
        ComponentName: c.ComponentName,
      }));

      setStructureComponentsOptions(componentsList);
    } catch (err) {
      console.error('Failed to load components for structure', err);
      setStructureComponentsOptions([]);
    } finally {
      setLoadingComponents(false);
    }
  };

  if (formData.StructureID) {
    fetchComponentsForStructure(formData.StructureID);
  }
}, [formData.StructureID]);


  /* ===================== HANDLERS ===================== */

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleAdd = () => {
    setFormData({
      StructureComponentID: 0,
      StructureID: 0,
      ComponentID: 0,
      CalculationTypeID: 1,
      Value: 0,
    });
    setValidated(false);
    setShowModal(true);
  };

const handleEdit = (item: SalaryStructureComponent) => {
  setEditItem(item);
  
  setFormData({
    StructureComponentID: item.StructureComponentID,
    StructureID: item.StructureID,
    ComponentID: 0, // temporarily 0, will be set after API loads
    CalculationTypeID:
      calculationTypes.find(ct => ct.CalculationName === item.CalculationTypeName)
        ?.CalculationTypeID || 1,
    Value: item.Value,
  });

  // After API loads, select correct component
  // Optional: you can use another useEffect or setTimeout to select correct ComponentID
  setTimeout(() => {
    const matchedComponent = structureComponentsOptions.find(
      c => c.ComponentName === item.ComponentName
    );
    if (matchedComponent) {
      setFormData(prev => ({ ...prev, ComponentID: matchedComponent.ComponentID }));
    }
  }, 100); // small delay for API fetch to complete

  setShowModal(true);
};


  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const structure = structures.find(s => s.StructureID === formData.StructureID);
    const component = components.find(c => c.ComponentID === formData.ComponentID);
    const calcType = calculationTypes.find(
      ct => ct.CalculationTypeID === formData.CalculationTypeID
    );

    if (!structure || !component || !calcType) return;

    const displayItem: SalaryStructureComponent = {
      StructureComponentID:
        formData.StructureComponentID || Date.now(),
      StructureID: formData.StructureID,
      StructureName: structure.StructureName,
      ComponentName: component.ComponentName,
      ComponentCode: component.ComponentName.toUpperCase().slice(0, 4),
      CalculationTypeName: calcType.CalculationName,
      Value: formData.Value,
    };

    setStructureComponents(prev => {
      const exists = prev.some(
        p => p.StructureComponentID === displayItem.StructureComponentID
      );
      return exists
        ? prev.map(p =>
            p.StructureComponentID === displayItem.StructureComponentID
              ? displayItem
              : p
          )
        : [...prev, displayItem];
    });

    setShowModal(false);
    setValidated(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this structure component?')) {
      setStructureComponents(prev =>
        prev.filter(s => s.StructureComponentID !== id)
      );
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="salary-structure-component-container mt-5">
      <Row className="mb-3 align-items-end">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Structure</Form.Label>
            <Form.Select
              value={selectedStructureFilter}
              onChange={(e) =>
                setSelectedStructureFilter(Number(e.target.value))
              }
            >
              <option value={0}>All Structures</option>
              {structures.map(s => (
                <option key={s.StructureID} value={s.StructureID}>
                  {s.StructureName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={8} className="text-end">
          <Button variant="success" onClick={handleAdd}>
            + Add Structure Component
          </Button>
        </Col>
      </Row>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && structureComponents.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Structure</th>
              <th>Component</th>
              <th>Code</th>
              <th>Calculation Type</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {structureComponents.map(s => (
              <tr key={s.StructureComponentID}>
                <td>{s.StructureName}</td>
                <td>{s.ComponentName}</td>
                <td>{s.ComponentCode}</td>
                <td>{s.CalculationTypeName}</td>
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
        !loading && <p>No structure components found.</p>
      )}

      {/* ===================== MODAL ===================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add / Edit Structure Component</Modal.Title>
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
                    <option value={0}>-- Select --</option>
                    {structures.map(s => (
                      <option key={s.StructureID} value={s.StructureID}>
                        {s.StructureName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="ComponentID">
                  <Form.Label>Component</Form.Label>
                  <Form.Select
                    required
                    value={formData.ComponentID}
                    onChange={handleInputChange}
                    disabled={loadingComponents}
                  >
                    <option value={0}>-- Select Component --</option>
                    {structureComponentsOptions.map((c) => (
                      <option key={c.ComponentID} value={c.ComponentID}>
                        {c.ComponentName}
                      </option>
                    ))}
                  </Form.Select>
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
                    {calculationTypes.map(ct => (
                      <option
                        key={ct.CalculationTypeID}
                        value={ct.CalculationTypeID}
                      >
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
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SalaryStructureComponentMaster;
