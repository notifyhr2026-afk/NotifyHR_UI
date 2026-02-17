import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Container,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { PencilSquare, Trash, PlusCircle } from 'react-bootstrap-icons';
import payrollService from '../../services/payrollService';

interface TaxSection {
  TaxSectionID: number;
  SectionCode: string;
  SectionName: string;
  Description: string;
  ApplicableRegime: string;
  MaxLimit: number | null;
  DeductionPercentage: number | null;
  IsActive: boolean;
}

const TaxSectionMaster: React.FC = () => {
  const [taxSections, setTaxSections] = useState<TaxSection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'warning' | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editSection, setEditSection] = useState<TaxSection | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<TaxSection>({
    TaxSectionID: 0,
    SectionCode: '',
    SectionName: '',
    Description: '',
    ApplicableRegime: 'Old',
    MaxLimit: null,
    DeductionPercentage: null,
    IsActive: true,
  });

  // 🔹 FETCH TAX SECTIONS
  const fetchTaxSections = async () => {
    try {
      setLoading(true);
      const data = await payrollService.GetTaxSectionsAsync();
      setTaxSections(data);
    } catch (err) {
      setError('Failed to load tax sections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxSections();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? value === '' ? null : Number(value)
          : value,
    }));
  };

  // 🔹 SAVE / UPDATE
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
        taxSectionID: editSection ? formData.TaxSectionID : 0,
        sectionCode: formData.SectionCode,
        sectionName: formData.SectionName,
        maxLimit: formData.MaxLimit ?? 0,
        isActive: formData.IsActive,
        deductionPercentage: formData.DeductionPercentage ?? 0,
        description: formData.Description,
        applicableRegime: formData.ApplicableRegime,
        createdBy: 'Admin', // replace with logged-in user
      };

      const response = await payrollService.PostSalaryStructurecomponentMappingByAsync(payload);

      if (response.value === 0) {
        setAlertVariant('warning');
        setAlertMessage(response.message || 'Operation failed.');
      } else {
        setAlertVariant('success');
        setAlertMessage(response.message || 'Saved successfully.');
        setShowModal(false);
        fetchTaxSections();
      }
    } catch (err) {
      setAlertVariant('warning');
      setAlertMessage('Something went wrong.');
    } finally {
      setLoading(false);
      setValidated(false);
    }
  };

  // 🔹 DELETE
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tax section?')) return;

    try {
      setLoading(true);

      const payload = {
        taxSectionID: id,
        createdBy: 'Admin',
      };

      const response = await payrollService.DeleteSalaryStructurecomponentMappingByAsync(payload);

      if (response.value === 0) {
        setAlertVariant('warning');
        setAlertMessage('Delete failed.');
      } else {
        setAlertVariant('success');
        setAlertMessage('Deleted successfully.');
        fetchTaxSections();
      }
    } catch (err) {
      setAlertVariant('warning');
      setAlertMessage('Error deleting tax section.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditSection(null);
    setFormData({
      TaxSectionID: 0,
      SectionCode: '',
      SectionName: '',
      Description: '',
      ApplicableRegime: 'Old',
      MaxLimit: null,
      DeductionPercentage: null,
      IsActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (section: TaxSection) => {
    setEditSection(section);
    setFormData(section);
    setShowModal(true);
  };

  return (
    <Container className="mt-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Tax Section Master</h3>
          <p className="text-muted mb-0">
            Manage income tax deduction sections
          </p>
        </div>

        <Button variant="success" onClick={handleAdd}>
          <PlusCircle className="me-1" />
          Add Tax Section
        </Button>
      </div>

      {alertMessage && (
        <Alert
          variant={alertVariant || 'success'}
          onClose={() => setAlertMessage(null)}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && taxSections.length > 0 && (
        <Table bordered hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Code</th>
              <th>Section Name</th>
              <th>Description</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxSections.map(s => (
              <tr key={s.TaxSectionID}>
                <td>{s.SectionCode}</td>
                <td>{s.SectionName}</td>
                <td>{s.Description}</td>
                <td className="text-center">
                  <Badge bg={s.IsActive ? 'success' : 'secondary'} pill>
                    {s.IsActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleEdit(s)}
                  >
                    <PencilSquare />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(s.TaxSectionID)}
                  >
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && taxSections.length === 0 && (
        <p className="text-muted">No tax sections found.</p>
      )}

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editSection ? 'Edit Tax Section' : 'Add Tax Section'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="SectionCode">
                  <Form.Label>Section Code</Form.Label>
                  <Form.Control
                    required
                    value={formData.SectionCode}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="SectionName">
                  <Form.Label>Section Name</Form.Label>
                  <Form.Control
                    required
                    value={formData.SectionName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="Description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.Description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="ApplicableRegime">
                  <Form.Label>Applicable Regime</Form.Label>
                  <Form.Select
                    value={formData.ApplicableRegime}
                    onChange={handleInputChange}
                  >
                    <option value="Old">Old Regime</option>
                    <option value="New">New Regime</option>
                    <option value="Both">Both</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="MaxLimit">
                  <Form.Label>Max Limit</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.MaxLimit ?? ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="DeductionPercentage">
                  <Form.Label>Deduction %</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.DeductionPercentage ?? ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="d-flex align-items-center">
                <Form.Check
                  id="IsActive"
                  label="Is Active"
                  checked={formData.IsActive}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editSection ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TaxSectionMaster;
