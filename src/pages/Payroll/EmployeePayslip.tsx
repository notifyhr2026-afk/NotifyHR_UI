import React from "react";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";

// Employee static data
const employee = {
  EmployeeID: 101,
  EmployeeName: "John Doe",
  Designation: "Software Engineer",
  Department: "IT",
  Month: "November",
  Year: 2025,
  BankName: "ABC Bank",
  AccountNumber: "XXXXXX1234",
};

// Earnings & Deductions
const earnings = [
  { name: "Basic Pay", amount: 50000 },
  { name: "HRA", amount: 10000 },
  { name: "Bonus", amount: 5000 },
];

const deductions = [
  { name: "PF", amount: 6000 },
  { name: "Professional Tax", amount: 200 },
];

const EmployeePayslip: React.FC = () => {
  const totalEarnings = earnings.reduce((acc, item) => acc + item.amount, 0);
  const totalDeductions = deductions.reduce((acc, item) => acc + item.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">
            Payslip – {employee.Month} {employee.Year}
          </h3>

          {/* Employee Info */}
          <Row className="mb-3">
            <Col md={6}>
              <p><strong>Employee Name:</strong> {employee.EmployeeName}</p>
              <p><strong>Employee ID:</strong> {employee.EmployeeID}</p>
              <p><strong>Designation:</strong> {employee.Designation}</p>
            </Col>
            <Col md={6}>
              <p><strong>Department:</strong> {employee.Department}</p>
              <p><strong>Bank:</strong> {employee.BankName}</p>
              <p><strong>Account No:</strong> {employee.AccountNumber}</p>
            </Col>
          </Row>

          {/* Earnings & Deductions */}
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Earnings</h5>
              <Table bordered size="sm">
                <tbody>
                  {earnings.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td className="text-end">
                        ₹ {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-success">
                    <td><strong>Total Earnings</strong></td>
                    <td className="text-end">
                      <strong>₹ {totalEarnings.toLocaleString()}</strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            <Col md={6}>
              <h5 className="mb-3">Deductions</h5>
              <Table bordered size="sm">
                <tbody>
                  {deductions.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td className="text-end">
                        ₹ {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-danger">
                    <td><strong>Total Deductions</strong></td>
                    <td className="text-end">
                      <strong>₹ {totalDeductions.toLocaleString()}</strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* Net Pay */}
          <Row className="mt-3">
            <Col>
              <Card className="bg-light">
                <Card.Body className="text-center">
                  <h5>Net Pay</h5>
                  <h3 className="text-success">
                    ₹ {netPay.toLocaleString()}
                  </h3>
                  <small>(After all deductions)</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Actions */}
          <Row className="mt-4">
            <Col className="text-end">
              <Button variant="primary" className="me-2">
                Download PDF
              </Button>
              <Button variant="secondary">
                Print Payslip
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeePayslip;
