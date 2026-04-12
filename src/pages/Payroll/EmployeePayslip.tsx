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

// ---------------------------
// TypeScript Interfaces
// ---------------------------
interface PayslipSummary {
  TotalDays: number;
  PaidDays: number;
  Leaves: number;
  LossOfPay: number;
  GrossSalary: number;
  TotalDeductions: number;
  NetSalary: number;
}

interface PayslipComponent {
  ComponentName: string;
  ComponentTypeName: "Earning" | "Deduction";
  MonthlyAmount: number;
}

// ---------------------------
// Static Employee Info
// ---------------------------
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

// ---------------------------
// Main Component
// ---------------------------
const EmployeePayslip: React.FC = () => {
  const [summary, setSummary] = useState<PayslipSummary | null>(null);
  const [components, setComponents] = useState<PayslipComponent[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeID: number | undefined = user?.employeeID;

  // Fetch Payslip Data
  const fetchPayslip = async () => {
    if (!employeeID) return;

    try {
      const response =
        await employeeSalaryAssignment.GetEmployeeMonthlyPayslipByEmployeeID(
          employeeID,
          employee.Month,
          employee.Year
        );

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
  const earnings = components.filter((c) => c.ComponentTypeName === "Earning");
  const deductions = components.filter(
    (c) => c.ComponentTypeName === "Deduction"
  );

  // ---------------------------
  // Loading state
  // ---------------------------
  if (loading || !summary) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // ---------------------------
  // JSX Rendering
  // ---------------------------
  return (
    <Container>
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
              <strong>Total Days:</strong> {summary.TotalDays}
            </Col>
            <Col md={3}>
              <strong>Paid Days:</strong> {summary.PaidDays}
            </Col>
            <Col md={3}>
              <strong>Leaves:</strong> {summary.Leaves}
            </Col>
            <Col md={3}>
              <strong>LOP:</strong> {summary.LossOfPay}
            </Col>
          </Row>

          {/* Earnings & Deductions */}
          <Row>
            {/* Earnings */}
            <Col md={6}>
              <h5 className="mb-3">Earnings</h5>
              <Table bordered size="sm" responsive>
                <tbody>
                  {earnings.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ComponentName}</td>
                      <td className="text-end">
                        ₹{" "}
                        {Number(item.MonthlyAmount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-success">
                    <td>
                      <strong>Total Earnings</strong>
                    </td>
                    <td className="text-end">
                      <strong>
                        ₹{" "}
                        {Number(summary.GrossSalary).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            {/* Deductions */}
            <Col md={6}>
              <h5 className="mb-3">Deductions</h5>
              <Table bordered size="sm" responsive>
                <tbody>
                  {deductions.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ComponentName}</td>
                      <td className="text-end">
                        ₹{" "}
                        {Number(item.MonthlyAmount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-danger">
                    <td>
                      <strong>Total Deductions</strong>
                    </td>
                    <td className="text-end">
                      <strong>
                        ₹{" "}
                        {Number(summary.TotalDeductions).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
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
                    ₹{" "}
                    {Number(summary.NetSalary).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
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
              <Button variant="secondary" onClick={() => window.print()}>
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