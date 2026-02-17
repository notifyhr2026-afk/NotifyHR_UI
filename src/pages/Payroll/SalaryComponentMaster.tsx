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

interface SalaryComponent {
  id: number;
  componentName: string;
  componentCode: string;
  componentType: 'Earning' | 'Deduction';
  isStatutory: boolean;
  defaultTaxable: boolean;
}

const SalaryComponentMaster: React.FC = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editComponent, setEditComponent] = useState<SalaryComponent | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<SalaryComponent>({
    id: 0,
    componentName: '',
    componentCode: '',
    componentType: 'Earning',
    isStatutory: false,
    defaultTaxable: false,
  });

  /* ===================== LOAD COMPONENTS ===================== */

  const fetchSalaryComponents = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await salaryService.GeSalaryComponentMasterAsync();

      const mappedData: SalaryComponent[] = data.map((item: any) => ({
        id: item.ComponentID,
        componentName: item.ComponentName,
        componentCode: item.ComponentCode,
        componentType: item.ComponentTypeID === 1 ? 'Earning' : 'Deduction',
        isStatutory: item.IsStatutory,
        defaultTaxable: item.DefaultTaxable,
      }));

      setComponents(mappedData);
    } catch (err) {
      setError('Failed to load salary components.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryComponents();
  }, []);

  /* ===================== INPUT CHANGE ===================== */

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  /* ===================== SAVE ===================== */

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        componentID: editComponent ? editComponent.id : 0,
        componentName: formData.componentName,
        componentCode: formData.componentCode,
        componentTypeID: formData.componentType === 'Earning' ? 1 : 2,
        isStatutory: formData.isStatutory,
        defaultTaxable: formData.defaultTaxable,
        isActive: true,
      };

      const response = await salaryService.PostSalaryStructurecomponentByAsync(payload);

      if (response.value === 1) {
        await fetchSalaryComponents();
        setShowModal(false);
        setValidated(false);
      } else {
        setError(response.msg || 'Failed to save component.');
      }

    } catch {
      setError('Error saving salary component.');
    } finally {
      setLoading(false);
    }
  };

  /* ===================== ADD ===================== */

  const handleAdd = () => {
    setFormData({
      id: 0,
      componentName: '',
      componentCode: '',
      componentType: 'Earning',
      isStatutory: false,
      defaultTaxable: false,
    });
    setEditComponent(null);
    setValidated(false);
    setShowModal(true);
  };

  /* ===================== EDIT ===================== */

  const handleEdit = (component: SalaryComponent) => {
    setEditComponent(component);
    setFormData(component);
    setValidated(false);
    setShowModal(true);
  };

  /* ===================== DELETE ===================== */

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this component?'))
      return;

    try {
      setLoading(true);

      const response =
        await salaryService.DeleteSalaryStructurecomponentByAsync(id);

      if (response[0]?.value === 1) {
        await fetchSalaryComponents();
      } else {
        setError(response[0]?.msg || 'Delete failed.');
      }

    } catch {
      setError('Error deleting salary component.');
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="salary-component-container mt-5">

      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Component
        </Button>
      </div>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}

      {components.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Type</th>
              <th>Statutory?</th>
              <th>Taxable?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp) => (
              <tr key={comp.id}>
                <td>{comp.componentName}</td>
                <td>{comp.componentCode}</td>
                <td>{comp.componentType}</td>
                <td>{comp.isStatutory ? 'Yes' : 'No'}</td>
                <td>{comp.defaultTaxable ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(comp)}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(comp.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        !loading && <p>No salary components found.</p>
      )}

      {/* ===================== MODAL ===================== */}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editComponent ? 'Edit Component' : 'Add Component'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="componentName">
                  <Form.Label>Component Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.componentName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter component name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="componentCode">
                  <Form.Label>Component Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.componentCode}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter component code.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="componentType">
                  <Form.Label>Component Type</Form.Label>
                  <Form.Select
                    value={formData.componentType}
                    onChange={handleInputChange}
                  >
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Check
                  id="isStatutory"
                  label="Is Statutory"
                  checked={formData.isStatutory}
                  onChange={handleInputChange}
                />
              </Col>

              <Col md={3}>
                <Form.Check
                  id="defaultTaxable"
                  label="Default Taxable"
                  checked={formData.defaultTaxable}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editComponent ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>

          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SalaryComponentMaster;
