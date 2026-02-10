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
import salaryService from '../../services/salaryService'; // adjust path

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

  useEffect(() => {
  const fetchSalaryComponents = async () => {
    try {
      setLoading(true);
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

  fetchSalaryComponents();
}, []);


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

    if (editComponent) {
      setComponents((prev) =>
        prev.map((comp) => (comp.id === editComponent.id ? formData : comp))
      );
    } else {
      setComponents((prev) => [...prev, { ...formData, id: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      id: Date.now(),
      componentName: '',
      componentCode: '',
      componentType: 'Earning',
      isStatutory: false,
      defaultTaxable: false,
    });
    setEditComponent(null);
    setShowModal(true);
  };

  const handleEdit = (component: SalaryComponent) => {
    setEditComponent(component);
    setFormData(component);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      setComponents((prev) => prev.filter((c) => c.id !== id));
    }
  };

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
        <p>No salary components added yet.</p>
      )}

      {/* Add/Edit Modal */}
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
                    required
                    value={formData.componentType}
                    onChange={handleInputChange}
                  >
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select component type.
                  </Form.Control.Feedback>
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
