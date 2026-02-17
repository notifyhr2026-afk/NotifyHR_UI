import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Alert
} from 'react-bootstrap';
import salaryService from '../../services/salaryService';
import LoggedInUser from '../../types/LoggedInUser';

/* ===================== TYPES ===================== */
interface SalaryStructure {
  StructureID: number;
  StructureName: string;
}

interface SalaryComponent {
  ComponentID: number;
  ComponentName: string;
  ComponentCode: string;
  ComponentTypeID: number;
  IsStatutory: boolean;
  DefaultTaxable: boolean;
}

interface CalculationType {
  CalculationTypeID: number;
  CalculationName: string;
}

interface OrgSalaryStructureComponent {
  StructureComponentID: number;
  StructureID: number;
  ComponentID: number;
  ComponentName: string;
  CalculationTypeID: number;
  CalculationTypeName: string;
  Value: number;
}

/* ===================== COMPONENT ===================== */
const OrgSalaryStructurePage: React.FC = () => {
  /* ================= USER ================= */
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;
  const organizationID = user?.organizationID ?? 0;

  /* ================= STATE ================= */
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [selectedStructureID, setSelectedStructureID] = useState<number>(0);

  const [loadingStructures, setLoadingStructures] = useState(false);
  const [errorStructures, setErrorStructures] = useState<string | null>(null);

  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [errorComponents, setErrorComponents] = useState<string | null>(null);

  const [orgComponents, setOrgComponents] = useState<OrgSalaryStructureComponent[]>([]);
  const [loadingOrgComponents, setLoadingOrgComponents] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentData, setCurrentData] = useState<OrgSalaryStructureComponent>({
    StructureComponentID: 0,
    StructureID: 0,
    ComponentID: 0,
    ComponentName: '',
    CalculationTypeID: 1,
    CalculationTypeName: '',
    Value: 0,
  });

  /* ================= STATIC CALCULATION TYPES ================= */
  const calculationTypes: CalculationType[] = [
    { CalculationTypeID: 1, CalculationName: 'Fixed' },
    { CalculationTypeID: 2, CalculationName: '% of Basic' },
    { CalculationTypeID: 3, CalculationName: '% of Gross' },
  ];

  /* ================= LOAD STRUCTURES FROM API ================= */
  const fetchSalaryStructures = async () => {
    try {
      setLoadingStructures(true);
      setErrorStructures(null);

      const response = await salaryService.getSalaryStructuresAsync(organizationID);
      const data = response?.data ?? response ?? [];
      setStructures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorStructures('Failed to load salary structures.');
    } finally {
      setLoadingStructures(false);
    }
  };

  /* ================= LOAD COMPONENTS FROM API ================= */
  const fetchComponents = async () => {
    try {
      setLoadingComponents(true);
      setErrorComponents(null);

      const data = await salaryService.GeSalaryComponentMasterAsync();
      setComponents(data);
    } catch (err) {
      console.error(err);
      setErrorComponents('Failed to load salary components.');
    } finally {
      setLoadingComponents(false);
    }
  };

  /* ================= LOAD EXISTING STRUCTURE COMPONENTS ================= */
  const fetchStructureComponents = async (structureID: number) => {
    try {
      setLoadingOrgComponents(true);
      const data = await salaryService.GetStructureComponentsAsync(structureID);
      setOrgComponents(
        data.map((d: any) => ({
          StructureComponentID: d.StructureComponentID,
          StructureID: d.StructureID,
          ComponentID: components.find(c => c.ComponentName === d.ComponentName)?.ComponentID || 0,
          ComponentName: d.ComponentName,
          CalculationTypeID: calculationTypes.find(ct => ct.CalculationName === d.CalculationTypeName)?.CalculationTypeID || 1,
          CalculationTypeName: d.CalculationTypeName,
          Value: d.Value,
        }))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to load structure components.');
    } finally {
      setLoadingOrgComponents(false);
    }
  };

  useEffect(() => {
    if (organizationID > 0) {
      fetchSalaryStructures();
      fetchComponents();
    }
  }, [organizationID]);

  /* ================= HANDLE STRUCTURE CHANGE ================= */
  const handleStructureChange = (structureID: number) => {
    setSelectedStructureID(structureID);
    if (structureID > 0) fetchStructureComponents(structureID);
    else setOrgComponents([]);
  };

  /* ================= ADD / EDIT / DELETE ================= */
  const handleAdd = () => {
    if (!selectedStructureID) return alert('Please select a structure first!');
    setIsEditMode(false);
    setCurrentData({
      StructureComponentID: 0,
      StructureID: selectedStructureID,
      ComponentID: 0,
      ComponentName: '',
      CalculationTypeID: 1,
      CalculationTypeName: '',
      Value: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (data: OrgSalaryStructureComponent) => {
    setIsEditMode(true);
    setCurrentData(data);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this component?')) return;

    try {
      await salaryService.DeleteSalaryStructurecomponentMappingByAsync(id);
      setOrgComponents(prev => prev.filter(c => c.StructureComponentID !== id));
      alert('Deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete component.');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentData.ComponentID) return alert('Please select component');

    try {
      const payload = {
        structureComponentID: currentData.StructureComponentID,
        structureID: currentData.StructureID,
        componentID: currentData.ComponentID,
        calculationTypeID: currentData.CalculationTypeID,
        value: currentData.Value,
      };

      const savedData = await salaryService.PostSalaryStructurecomponentMappingByAsync(payload);

      if (!isEditMode) {
        setOrgComponents(prev => [...prev, { ...currentData, StructureComponentID: savedData.structureComponentID }]);
      } else {
        setOrgComponents(prev =>
          prev.map(c =>
            c.StructureComponentID === currentData.StructureComponentID
              ? { ...currentData, StructureComponentID: savedData.structureComponentID }
              : c
          )
        );
      }

      setShowModal(false);
      alert('Saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save component.');
    }
  };

  return (
    <div className="mt-5 container">
      <h3>Organization Salary Structure Management</h3>

      {/* STRUCTURE DROPDOWN */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Label>Select Salary Structure</Form.Label>
          {loadingStructures && <Spinner size="sm" className="ms-2" />}
          <Form.Select
            value={selectedStructureID}
            onChange={e => handleStructureChange(parseInt(e.target.value))}
          >
            <option value={0}>-- Select Structure --</option>
            {structures.map(s => (
              <option key={s.StructureID} value={s.StructureID}>
                {s.StructureName}
              </option>
            ))}
          </Form.Select>
          {errorStructures && <Alert variant="danger" className="mt-2">{errorStructures}</Alert>}
        </Col>
        <Col md={6} className="text-end d-flex align-items-end justify-content-end">
          <Button
            variant="success"
            onClick={handleAdd}
            disabled={!selectedStructureID || loadingComponents}
          >
            + Add Component
          </Button>
        </Col>
      </Row>

      {/* TABLE */}
      {loadingOrgComponents ? (
        <Spinner animation="border" />
      ) : orgComponents.length > 0 ? (
        <Table bordered hover>
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
                <td>{c.ComponentName}</td>
                <td>{calculationTypes.find(ct => ct.CalculationTypeID === c.CalculationTypeID)?.CalculationName || c.CalculationTypeName}</td>
                <td>{c.Value}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
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
        <p>Select a structure to load its components.</p>
      )}

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Component' : 'Add Component'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Component</Form.Label>
              <Form.Select
                value={currentData.ComponentID}
                onChange={e =>
                  setCurrentData(prev => ({
                    ...prev,
                    ComponentID: parseInt(e.target.value),
                    ComponentName: components.find(c => c.ComponentID === parseInt(e.target.value))?.ComponentName || '',
                  }))
                }
                disabled={isEditMode} // cannot change component in edit
              >
                <option value={0}>-- Select Component --</option>
                {components.map(c => (
                  <option key={c.ComponentID} value={c.ComponentID}>
                    {c.ComponentName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Calculation Type</Form.Label>
              <Form.Select
                value={currentData.CalculationTypeID}
                onChange={e =>
                  setCurrentData(prev => ({
                    ...prev,
                    CalculationTypeID: parseInt(e.target.value),
                    CalculationTypeName: calculationTypes.find(ct => ct.CalculationTypeID === parseInt(e.target.value))?.CalculationName || '',
                  }))
                }
              >
                {calculationTypes.map(ct => (
                  <option key={ct.CalculationTypeID} value={ct.CalculationTypeID}>
                    {ct.CalculationName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Value</Form.Label>
              <Form.Control
                type="number"
                value={currentData.Value}
                onChange={e =>
                  setCurrentData(prev => ({
                    ...prev,
                    Value: parseFloat(e.target.value),
                  }))
                }
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrgSalaryStructurePage;
