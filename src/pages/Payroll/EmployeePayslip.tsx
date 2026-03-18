import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
} from "react-bootstrap";
import employeeSalaryAssignment from "../../services/employeeSalaryAssignment";

// Static Employee Info (for now)
const employee = {
  EmployeeID: 1024,
  EmployeeName: "John Doe",
  Designation: "Software Engineer",
  Department: "IT",
  Month: 3,
  Year: 2026,
  BankName: "ABC Bank",
  AccountNumber: "XXXXXX1234",
};

const EmployeePayslip: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayslip = async () => {
    try {
      const response =
        await employeeSalaryAssignment.GetEmployeeMonthlyPayslipByEmployeeID(
          employee.EmployeeID,
          employee.Month,
          employee.Year
        );

      console.log("API Response:", response);

      setSummary(response?.Table?.[0] || null);
      setComponents(response?.Table1 || []);
    } catch (error) {
      console.error("Error fetching payslip:", error);
      setSummary(null);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslip();
  }, []);

  // Split Earnings & Deductions
  const earnings = components.filter(
    (c) => c.ComponentTypeName === "Earning"
  );
  const deductions = components.filter(
    (c) => c.ComponentTypeName === "Deduction"
  );

  // ✅ Safe loading / null guard
  if (loading || !summary) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">
            Payslip – {employee.Month}/{employee.Year}
          </h3>

          {/* Employee Info */}
          <Row className="mb-3">
            <Col md={6}>
              <p>
                <strong>Employee Name:</strong> {employee.EmployeeName}
              </p>
              <p>
                <strong>Employee ID:</strong> {employee.EmployeeID}
              </p>
              <p>
                <strong>Designation:</strong> {employee.Designation}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Department:</strong> {employee.Department}
              </p>
              <p>
                <strong>Bank:</strong> {employee.BankName}
              </p>
              <p>
                <strong>Account No:</strong> {employee.AccountNumber}
              </p>
            </Col>
          </Row>

          {/* Attendance Info */}
          <Row className="mb-3">
            <Col md={3}>
              <strong>Total Days:</strong> {summary?.TotalDays}
            </Col>
            <Col md={3}>
              <strong>Paid Days:</strong> {summary?.PaidDays}
            </Col>
            <Col md={3}>
              <strong>Leaves:</strong> {summary?.Leaves}
            </Col>
            <Col md={3}>
              <strong>LOP:</strong> {summary?.LossOfPay}
            </Col>
          </Row>

          {/* Earnings & Deductions */}
          <Row>
            {/* Earnings */}
            <Col md={6}>
              <h5 className="mb-3">Earnings</h5>
              <Table bordered size="sm">
                <tbody>
                  {earnings.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ComponentName}</td>
                      <td className="text-end">
                        ₹ {Number(item.MonthlyAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-success">
                    <td>
                      <strong>Total Earnings</strong>
                    </td>
                    <td className="text-end">
                      <strong>
                        ₹ {Number(summary?.GrossSalary).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            {/* Deductions */}
            <Col md={6}>
              <h5 className="mb-3">Deductions</h5>
              <Table bordered size="sm">
                <tbody>
                  {deductions.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ComponentName}</td>
                      <td className="text-end">
                        ₹ {Number(item.MonthlyAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-danger">
                    <td>
                      <strong>Total Deductions</strong>
                    </td>
                    <td className="text-end">
                      <strong>
                        ₹ {Number(summary?.TotalDeductions).toFixed(2)}
                      </strong>
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
                    ₹ {Number(summary?.NetSalary).toFixed(2)}
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
              <Button
                variant="secondary"
                onClick={() => window.print()}
              >
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