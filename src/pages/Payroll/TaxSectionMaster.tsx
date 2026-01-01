import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

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
  // Sample static data
  const [taxSections, setTaxSections] = useState<TaxSection[]>([
    {
      TaxSectionID: 1,
      SectionCode: '80C',
      SectionName: '80C - Deduction for Life Insurance Premium',
      Description: 'Deduction allowed for life insurance premiums, EPF, PPF, etc.',
      ApplicableRegime: 'Old',
      MaxLimit: 150000.00,
      DeductionPercentage: null,
      IsActive: true,
    },
    {
      TaxSectionID: 2,
      SectionCode: '80D',
      SectionName: '80D - Deduction for Medical Insurance Premium',
      Description: 'Deduction allowed for premiums paid on health insurance policies.',
      ApplicableRegime: 'Both',
      MaxLimit: 25000.00,
      DeductionPercentage: null,
      IsActive: true,
    },
    {
      TaxSectionID: 3,
      SectionCode: '80E',
      SectionName: '80E - Deduction for Education Loan Interest',
      Description: 'Deduction allowed for interest paid on education loans.',
      ApplicableRegime: 'Both',
      MaxLimit: null,
      DeductionPercentage: 100.00,
      IsActive: false,
    },
  ]);

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

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save/Add/Edit
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (editSection) {
      setTaxSections((prev) =>
        prev.map((s) =>
          s.TaxSectionID === editSection.TaxSectionID ? formData : s
        )
      );
    } else {
      setTaxSections((prev) => [
        ...prev,
        { ...formData, TaxSectionID: Date.now() },
      ]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      TaxSectionID: Date.now(),
      SectionCode: '',
      SectionName: '',
      Description: '',
      ApplicableRegime: 'Old',
      MaxLimit: null,
      DeductionPercentage: null,
      IsActive: true,
    });
    setEditSection(null);
    setShowModal(true);
  };

  const handleEdit = (section: TaxSection) => {
    setEditSection(section);
    setFormData(section);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this tax section?')) {
      setTaxSections((prev) => prev.filter((s) => s.TaxSectionID !== id));
    }
  };

  return (
    <div className="tax-section-container mt-5">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Tax Section
        </Button>
      </div>

      {taxSections.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Section Code</th>
              <th>Section Name</th>
              <th>Description</th>
              <th>Is Active?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxSections.map((s) => (
              <tr key={s.TaxSectionID}>
                <td>{s.SectionCode}</td>
                <td>{s.SectionName}</td>
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
                    onClick={() => handleDelete(s.TaxSectionID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No tax sections added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editSection ? 'Edit Tax Section' : 'Add Tax Section'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="SectionCode">
                  <Form.Label>Section Code</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.SectionCode}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a section code.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="SectionName">
                  <Form.Label>Section Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.SectionName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a section name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="ApplicableRegime">
                  <Form.Label>Applicable Regime</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.ApplicableRegime}
                    onChange={handleInputChange}
                  >
                    <option value="Old">Old Regime</option>
                    <option value="New">New Regime</option>
                    <option value="Both">Both</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="MaxLimit">
                  <Form.Label>Max Limit (if applicable)</Form.Label>
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
                  <Form.Label>Deduction Percentage (if applicable)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.DeductionPercentage ?? ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Check
                  className="mb-3"
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
    </div>
  );
};

export default TaxSectionMaster;
