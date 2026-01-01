import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Button, Collapse } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useParams } from 'react-router-dom';

// Define the Component interface
interface Component {
  ComponentName: string;
  CalculationType: 'Fixed' | 'Percentage'; // Assuming these two types for calculation
  Value: number;
}

// Define the SalaryStructure interface
interface SalaryStructure {
  StructureID: number;
  StructureName: string;
  Components: Component[];
}

// Sample static data for salary structures and employee salary components
const salaryStructures: SalaryStructure[] = [
  {
    StructureID: 1,
    StructureName: 'Monthly Salary',
    Components: [
      { ComponentName: 'Basic Pay', CalculationType: 'Fixed', Value: 50000 },
      { ComponentName: 'HRA', CalculationType: 'Percentage', Value: 20 },
      { ComponentName: 'PF', CalculationType: 'Percentage', Value: 12 },
      { ComponentName: 'Bonus', CalculationType: 'Fixed', Value: 5000 },
    ],
  },
  {
    StructureID: 2,
    StructureName: 'Contract Salary',
    Components: [
      { ComponentName: 'Basic Pay', CalculationType: 'Fixed', Value: 40000 },
      { ComponentName: 'HRA', CalculationType: 'Percentage', Value: 15 },
      { ComponentName: 'PF', CalculationType: 'Percentage', Value: 10 },
    ],
  },
];

// Sample employee data (replace with dynamic data from your API)
const employee = {
  EmployeeID: 101,
  EmployeeName: 'John Doe',
  StructureID: 1, // Assigned to Monthly Salary structure
  CTC: 600000,
  EffectiveFrom: '2023-01-01',
  EffectiveTo: '2023-12-31',
};

const EmployeeSalaryBackupView: React.FC = () => {
    const { employeeId } = useParams<{ employeeId: string }>();
  const [selectedStructure, setSelectedStructure] = useState<SalaryStructure | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const structure = salaryStructures.find(
      (structure) => structure.StructureID === employee.StructureID
    );
    setSelectedStructure(structure || null);
  }, []);

  // Calculate total CTC
  const calculateCTC = (components: Component[]) => {
    return components.reduce((acc, component) => {
      if (component.CalculationType === 'Fixed') {
        acc += component.Value;
      } else if (component.CalculationType === 'Percentage') {
        acc += (employee.CTC * component.Value) / 100;
      }
      return acc;
    }, 0);
  };

  return (
    <Container className="mt-5">
      <h3>Employee Salary Backup - {employee.EmployeeName}</h3>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Salary Structure: {selectedStructure?.StructureName}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Employee ID: {employee.EmployeeID}
              </Card.Subtitle>
              <Card.Text>
                This page shows the detailed breakdown of the salary structure and components for{' '}
                {employee.EmployeeName}.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Real-time Update Button */}
        <Col md={4} className="d-flex justify-content-end align-items-end">
          <Button variant="success" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Salary Details' : 'Show Salary Details'}
          </Button>
        </Col>
      </Row>

      {/* Salary Breakdown Table */}
      <Collapse in={showDetails}>
        <div>
          <Card>
            <Card.Body>
              <Table bordered hover responsive size="sm">
                <thead className="table-light">
                  <tr>
                    <th>Component Name</th>
                    <th>Calculation Type</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStructure?.Components.map((component: Component) => (
                    <tr key={component.ComponentName}>
                      <td>{component.ComponentName}</td>
                      <td>{component.CalculationType}</td>
                      <td>
                        {component.CalculationType === 'Percentage'
                          ? `${component.Value}% of CTC`
                          : component.Value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2}><strong>Total CTC</strong></td>
                    <td><strong>{calculateCTC(selectedStructure?.Components || []).toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </Collapse>

      {/* Optional: Real-Time Interaction Section */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Backup Information</Card.Title>
              <Card.Text>
                <strong>Effective From:</strong> {employee.EffectiveFrom} <br />
                <strong>Effective To:</strong> {employee.EffectiveTo} <br />
                <strong>CTC:</strong> {employee.CTC.toLocaleString()} <br />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeSalaryBackupView;
