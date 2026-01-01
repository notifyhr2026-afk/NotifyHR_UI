import React, { useState } from 'react';
import { Button, Tab, Tabs, Form, Row, Col } from 'react-bootstrap';

interface TaxDeduction {
  EmpTaxDeductionID: number;
  EmployeePayrollID: number;
  TaxSectionID: number;
  DeductionType: string;
  Amount: number;
}

interface TaxSection {
  TaxSectionID: number;
  SectionCode: string;
  SectionName: string;
}

const EmployeeTaxDeclaration: React.FC = () => {
  // Sample static data for Tax Sections
  const taxSections: TaxSection[] = [
    { TaxSectionID: 1, SectionCode: '80C', SectionName: '80C - Life Insurance Premium' },
    { TaxSectionID: 2, SectionCode: '80D', SectionName: '80D - Medical Insurance Premium' },
    { TaxSectionID: 3, SectionCode: '80E', SectionName: '80E - Education Loan Interest' },
  ];

  // State to hold form data for each Tax Section
  const [declarations, setDeclarations] = useState<TaxDeduction[]>([
    { EmpTaxDeductionID: 1, EmployeePayrollID: 101, TaxSectionID: 1, DeductionType: 'Insurance', Amount: 20000 },
    { EmpTaxDeductionID: 2, EmployeePayrollID: 101, TaxSectionID: 2, DeductionType: 'Health Insurance', Amount: 15000 },
    { EmpTaxDeductionID: 3, EmployeePayrollID: 101, TaxSectionID: 3, DeductionType: 'Interest on Loan', Amount: 10000 },
  ]);

  const [activeKey, setActiveKey] = useState<string>('80C'); // Default active tab

  // Input change handler for each deduction
  const handleInputChange = (e: React.ChangeEvent<any>, sectionID: number) => {
    const { id, value } = e.target;
    setDeclarations((prevDeclarations) =>
      prevDeclarations.map((decl) =>
        decl.TaxSectionID === sectionID
          ? { ...decl, [id]: id === 'Amount' ? parseFloat(value) : value }
          : decl
      )
    );
  };

  // Handle Save
  const handleSave = (sectionID: number) => {
    // Simulating a save action
    console.log(`Saved data for Section ${sectionID}`);
  };

  return (
    <div className="employee-tax-declaration mt-5">
      <h3>Employee Tax Declaration</h3>

      <Tabs
        id="tax-declaration-tabs"
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || '')}
        className="mb-3"
      >
        {taxSections.map((section) => (
          <Tab eventKey={section.SectionCode} title={section.SectionName} key={section.TaxSectionID}>
            <div className="tab-content p-3">
              {/* Form inside each tab */}
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId={`DeductionType-${section.TaxSectionID}`}>
                      <Form.Label>Deduction Type</Form.Label>
                      <Form.Control
                        type="text"
                        value={declarations.find((decl) => decl.TaxSectionID === section.TaxSectionID)?.DeductionType || ''}
                        onChange={(e) => handleInputChange(e, section.TaxSectionID)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId={`Amount-${section.TaxSectionID}`}>
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={declarations.find((decl) => decl.TaxSectionID === section.TaxSectionID)?.Amount || ''}
                        onChange={(e) => handleInputChange(e, section.TaxSectionID)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Save button */}
                <Button variant="primary" onClick={() => handleSave(section.TaxSectionID)}>
                  Save
                </Button>
              </Form>
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default EmployeeTaxDeclaration;
