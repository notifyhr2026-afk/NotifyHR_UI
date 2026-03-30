import React, { useState } from 'react';
import { Button, Tab, Tabs, Form, Row, Col, Card, Alert } from 'react-bootstrap';

interface TaxDeduction {
  EmpTaxDeductionID: number;
  EmployeePayrollID: number;
  TaxSectionID: number;
  DeductionType: string;
  Amount: number;
  isDirty?: boolean;
}

interface TaxSection {
  TaxSectionID: number;
  SectionCode: string;
  SectionName: string;
}

const EmployeeTaxDeclaration: React.FC = () => {
  const taxSections: TaxSection[] = [
    { TaxSectionID: 1, SectionCode: '80C', SectionName: '80C - Life Insurance Premium' },
    { TaxSectionID: 2, SectionCode: '80D', SectionName: '80D - Medical Insurance Premium' },
    { TaxSectionID: 3, SectionCode: '80E', SectionName: '80E - Education Loan Interest' },
  ];

  const [declarations, setDeclarations] = useState<TaxDeduction[]>([
    { EmpTaxDeductionID: 1, EmployeePayrollID: 101, TaxSectionID: 1, DeductionType: 'Insurance', Amount: 20000 },
    { EmpTaxDeductionID: 2, EmployeePayrollID: 101, TaxSectionID: 2, DeductionType: 'Health Insurance', Amount: 15000 },
    { EmpTaxDeductionID: 3, EmployeePayrollID: 101, TaxSectionID: 3, DeductionType: 'Interest on Loan', Amount: 10000 },
  ]);

  const [activeKey, setActiveKey] = useState<string>('80C');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<any>,
    sectionID: number,
    field: 'DeductionType' | 'Amount'
  ) => {
    const value = field === 'Amount' ? parseFloat(e.target.value) || 0 : e.target.value;

    setDeclarations((prev) =>
      prev.map((decl) =>
        decl.TaxSectionID === sectionID
          ? { ...decl, [field]: value, isDirty: true }
          : decl
      )
    );
  };

  const handleSave = (sectionID: number) => {
    setDeclarations((prev) =>
      prev.map((decl) =>
        decl.TaxSectionID === sectionID ? { ...decl, isDirty: false } : decl
      )
    );

    setSuccessMsg(`Section ${sectionID} saved successfully!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getDeclaration = (sectionID: number) =>
    declarations.find((d) => d.TaxSectionID === sectionID);

  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h4 className="mb-1">Employee Tax Declaration</h4>
          <p className="text-muted mb-4">
            Declare your tax-saving investments under different sections.
          </p>

          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Tabs
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k || '')}
            className="mb-3"
          >
            {taxSections.map((section) => {
              const declaration = getDeclaration(section.TaxSectionID);

              return (
                <Tab
                  key={section.TaxSectionID}
                  eventKey={section.SectionCode}
                  title={section.SectionCode}
                >
                  <Card className="p-3 border-0 bg-light">
                    <h5 className="mb-3">{section.SectionName}</h5>

                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Deduction Type</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., LIC Premium"
                              value={declaration?.DeductionType || ''}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  section.TaxSectionID,
                                  'DeductionType'
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Amount (₹)</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="Enter amount"
                              value={declaration?.Amount || ''}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  section.TaxSectionID,
                                  'Amount'
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted">
                          Total Declared:{' '}
                          <strong>
                            ₹ {declaration?.Amount?.toLocaleString('en-IN') || 0}
                          </strong>
                        </div>

                        <Button
                          variant="primary"
                          disabled={!declaration?.isDirty}
                          onClick={() => handleSave(section.TaxSectionID)}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  </Card>
                </Tab>
              );
            })}
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeTaxDeclaration;