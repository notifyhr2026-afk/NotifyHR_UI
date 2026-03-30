import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Collapse, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import employeeSalaryAssignment from '../../services/employeeSalaryAssignment';
import 'bootstrap-icons/font/bootstrap-icons.css'; // <-- Bootstrap Icons CSS

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

  const earnings = salaryBreakup.filter(c => c.ComponentTypeName === 'Earning');
  const deductions = salaryBreakup.filter(c => c.ComponentTypeName === 'Deduction');
  const totalEarnings = earnings.reduce((a, c) => a + c.ComponentAmount, 0);
  const totalDeductions = deductions.reduce((a, c) => a + c.ComponentAmount, 0);
  const employeeCTC = assignmentInfo?.CTC || 0;

  useEffect(() => {
    const fetchSalaryBreakup = async () => {
      if (!employeeID) return;
      try {
        setLoading(true);
        const res = await employeeSalaryAssignment.GetEmployeeSalaryBreakupByEmployeeID(employeeID);
        setSalaryBreakup(res || []);
        if (res && res.length > 0) {
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
      <h3 className="mb-4 text-center">💰 My Salary Breakdown</h3>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Row className="mb-4 g-4">
            <Col xs={12} md={4}>
              <Card className="shadow-sm border-0 rounded-3">
                <Card.Body className="text-center">
                  <Card.Title className="text-muted">Total CTC</Card.Title>
                  <h4 className="mt-2">₹ {employeeCTC.toLocaleString()}</h4>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card className="shadow-sm border-0 rounded-3">
                <Card.Body className="text-center text-success">
                  <Card.Title>
                    Total Earnings <i className="bi bi-arrow-up-short"></i>
                  </Card.Title>
                  <h4 className="mt-2">₹ {totalEarnings.toLocaleString()}</h4>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card className="shadow-sm border-0 rounded-3">
                <Card.Body className="text-center text-danger">
                  <Card.Title>
                    Total Deductions <i className="bi bi-arrow-down-short"></i>
                  </Card.Title>
                  <h4 className="mt-2">₹ {totalDeductions.toLocaleString()}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm border-0 rounded-3 p-3">
                <Card.Body>
                  <h6 className="mb-2">CTC Allocation</h6>
                  <ProgressBar>
                    <ProgressBar 
                      now={(totalEarnings / employeeCTC) * 100} 
                      label="Earnings" 
                      variant="success" 
                      key={1} 
                    />
                    <ProgressBar 
                      now={(totalDeductions / employeeCTC) * 100} 
                      label="Deductions" 
                      variant="danger" 
                      key={2} 
                    />
                  </ProgressBar>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <Button
                variant="outline-primary"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <>Hide Salary Details <i className="bi bi-chevron-up"></i></>
                ) : (
                  <>Show Salary Details <i className="bi bi-chevron-down"></i></>
                )}
              </Button>
            </Col>
          </Row>

          <Collapse in={showDetails}>
            <div>
              <Row className="mb-4 g-4">
                <Col xs={12} md={6}>
                  <Card className="shadow-sm border-0 rounded-3">
                    <Card.Header className="bg-success text-white">Earnings</Card.Header>
                    <Card.Body className="p-0">
                      <Table striped hover responsive className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Component</th>
                            <th className="text-end">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map(e => (
                            <tr key={e.ComponentID}>
                              <td>{e.ComponentName}</td>
                              <td className="text-end">{e.ComponentAmount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12} md={6}>
                  <Card className="shadow-sm border-0 rounded-3">
                    <Card.Header className="bg-danger text-white">Deductions</Card.Header>
                    <Card.Body className="p-0">
                      <Table striped hover responsive className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Component</th>
                            <th className="text-end">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deductions.map(d => (
                            <tr key={d.ComponentID}>
                              <td>{d.ComponentName}</td>
                              <td className="text-end">{d.ComponentAmount.toLocaleString()}</td>
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

          {assignmentInfo && (
            <Row className="mb-4">
              <Col xs={12} md={6}>
                <Card className="shadow-sm border-0 rounded-3">
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