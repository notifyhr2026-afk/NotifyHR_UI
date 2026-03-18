import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Collapse } from 'react-bootstrap';
import { toast } from 'react-toastify';
import employeeSalaryAssignment from '../../services/employeeSalaryAssignment';

interface SalaryComponent {
  ComponentID: number;
  ComponentName: string;
  ComponentCode: string;
  ComponentTypeName: 'Earning' | 'Deduction';
  CalculationTypeID: number;
  Value: number;
  ComponentAmount: number;
  EmployeeCTC: number;
}

interface SalaryAssignmentInfo {
  EffectiveFrom: string;
  EffectiveTo: string | null;
  CTC: number;
}

const EmployeeSalaryBackupView: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeID: number | undefined = user?.employeeID;

  const [salaryBreakup, setSalaryBreakup] = useState<SalaryComponent[]>([]);
  const [assignmentInfo, setAssignmentInfo] = useState<SalaryAssignmentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // Filtered arrays
  const earnings = salaryBreakup.filter(c => c.ComponentTypeName === 'Earning');
  const deductions = salaryBreakup.filter(c => c.ComponentTypeName === 'Deduction');
  const employeeCTC = assignmentInfo?.CTC || 0;

  useEffect(() => {
    const fetchSalaryBreakup = async () => {
      if (!employeeID) return;
      try {
        setLoading(true);
        const res = await employeeSalaryAssignment.GetEmployeeSalaryBreakupByEmployeeID(employeeID);
        setSalaryBreakup(res || []);
        if (res && res.length > 0) {
          // All components have same CTC and effective dates are part of first component
          setAssignmentInfo({
            EffectiveFrom: res[0]?.EffectiveFrom || new Date().toISOString(),
            EffectiveTo: res[0]?.EffectiveTo || null,
            CTC: res[0]?.EmployeeCTC || 0,
          });
        }
      } catch (error) {
        toast.error("Failed to load salary breakup");
      } finally {
        setLoading(false);
      }
    };
    fetchSalaryBreakup();
  }, [employeeID]);

  return (
    <Container className="mt-5">
      <h3 className="mb-4">My Salary Breakup</h3>

      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Total CTC</Card.Title>
                  <h4>₹ {employeeCTC.toLocaleString()}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Total Earnings</Card.Title>
                  <h4>₹ {earnings.reduce((a, c) => a + c.ComponentAmount, 0).toLocaleString()}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Total Deductions</Card.Title>
                  <h4>₹ {deductions.reduce((a, c) => a + c.ComponentAmount, 0).toLocaleString()}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Toggle Salary Details */}
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <Button
                variant={showDetails ? "outline-secondary" : "primary"}
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide Salary Details" : "Show Salary Details"}
              </Button>
            </Col>
          </Row>

          {/* Earnings & Deductions */}
          <Collapse in={showDetails}>
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Header>Earnings</Card.Header>
                    <Card.Body className="p-0">
                      <Table striped bordered hover size="sm" className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Component</th>
                            <th>Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map(e => (
                            <tr key={e.ComponentID}>
                              <td>{e.ComponentName}</td>
                              <td>{e.ComponentAmount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Header>Deductions</Card.Header>
                    <Card.Body className="p-0">
                      <Table striped bordered hover size="sm" className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Component</th>
                            <th>Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deductions.map(d => (
                            <tr key={d.ComponentID}>
                              <td>{d.ComponentName}</td>
                              <td>{d.ComponentAmount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Collapse>

          {/* Effective Dates */}
          {assignmentInfo && (
            <Row className="mb-4">
              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <p><strong>Effective From:</strong> {new Date(assignmentInfo.EffectiveFrom).toLocaleDateString()}</p>
                    <p><strong>Effective To:</strong> {assignmentInfo.EffectiveTo ? new Date(assignmentInfo.EffectiveTo).toLocaleDateString() : 'Present'}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default EmployeeSalaryBackupView;