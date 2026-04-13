import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Form,
  Alert
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
  GrossEarnings: number;
  TotalDeductions: number;
  NetPay: number;
  MonthName: string;
  PayrollYear: number;
}

interface PayslipComponent {
  ComponentName: string;
  ComponentType: "Earning" | "Deduction";
  Amount: number;
}

// ---------------------------
// Constants for Dropdowns
// ---------------------------
const MONTHS = [
  { val: 1, name: "January" }, { val: 2, name: "February" }, { val: 3, name: "March" },
  { val: 4, name: "April" }, { val: 5, name: "May" }, { val: 6, name: "June" },
  { val: 7, name: "July" }, { val: 8, name: "August" }, { val: 9, name: "September" },
  { val: 10, name: "October" }, { val: 11, name: "November" }, { val: 12, name: "December" }
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1); // Current year +1 to 3 years back

const EmployeePayslip: React.FC = () => {
  // State for Selection
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // State for Data
  const [summary, setSummary] = useState<PayslipSummary | null>(null);
  const [components, setComponents] = useState<PayslipComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeID: number | undefined = user?.employeeID;

  const fetchPayslip = async () => {
    if (!employeeID) return;
    
    setLoading(true);
    setError(null);
    setSummary(null); // Clear previous results

    try {
      const response = await employeeSalaryAssignment.GetEmployeeMonthlyPayslipByEmployeeID(
        employeeID,
        selectedMonth,
        selectedYear
      );

      // Check if data exists in response
      if (response?.Table?.[0]) {
        setSummary(response.Table[0]);
        setComponents(response.Table1 || []);
      } else {
        setError("No payroll record found for the selected period.");
      }
    } catch (err) {
      console.error("Error fetching payslip:", err);
      setError("Failed to load payslip data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Optional: Auto-fetch on page load for current month
  useEffect(() => {
    fetchPayslip();
  }, []);

  const earnings = components.filter((c) => c.ComponentType === "Earning");
  const deductions = components.filter((c) => c.ComponentType === "Deduction");

  return (
    <Container className="py-4">
      {/* 1. FILTER SECTION */}
      <Card className="mb-4 shadow-sm border-0 bg-light">
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Month</Form.Label>
                  <Form.Select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {MONTHS.map(m => (
                      <option key={m.val} value={m.val}>{m.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Year</Form.Label>
                  <Form.Select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Button 
                  variant="dark" 
                  className="w-100" 
                  onClick={fetchPayslip}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "View Payslip"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 2. MESSAGES SECTION */}
      {error && <Alert variant="warning" className="text-center">{error}</Alert>}
      
      {/* 3. PAYSLIP CONTENT SECTION */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : summary ? (
        <Card className="shadow border-0">
          <Card.Body className="p-4">
            <h3 className="text-center mb-4">
              Payslip – {summary.MonthName} {summary.PayrollYear}
            </h3>

            {/* Static Employee Data (Update from your Redux/Context if available) */}
            <Row className="mb-4 border-bottom pb-3">
              <Col md={6}>
                <p className="mb-1"><strong>Name:</strong> {user?.name || "Employee"}</p>
                <p className="mb-1"><strong>Employee ID:</strong> {employeeID}</p>
              </Col>
              <Col md={6} className="text-md-end">
                <p className="mb-1"><strong>Status:</strong> <span className="badge bg-success">{'Processed'}</span></p>
                <p className="mb-1 text-muted"><small>Generated on: {new Date().toLocaleDateString()}</small></p>
              </Col>
            </Row>

            {/* Attendance */}
            <div className="bg-light p-3 rounded mb-4">
              <Row className="text-center">
                <Col><strong>Total Days</strong><br/>{summary.TotalDays}</Col>
                <Col><strong>Paid Days</strong><br/>{summary.PaidDays}</Col>
                <Col><strong>Leaves</strong><br/>{summary.Leaves}</Col>
                <Col><strong>LOP</strong><br/>{summary.LossOfPay}</Col>
              </Row>
            </div>

            {/* Earnings & Deductions Tables */}
            <Row>
              <Col md={6}>
                <h6 className="text-uppercase text-muted mb-3">Earnings</h6>
                <Table hover size="sm">
                  <tbody>
                    {earnings.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.ComponentName}</td>
                        <td className="text-end">₹{item.Amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold table-success">
                      <td>Gross Earnings</td>
                      <td className="text-end">₹{summary.GrossEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6 className="text-uppercase text-muted mb-3">Deductions</h6>
                <Table hover size="sm">
                  <tbody>
                    {deductions.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.ComponentName}</td>
                        <td className="text-end text-danger">₹{item.Amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold table-danger">
                      <td>Total Deductions</td>
                      <td className="text-end">₹{summary.TotalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* Net Pay Result */}
            <Card className="bg-dark text-white text-center mt-4 p-3 border-0">
              <h5 className="mb-0 text-muted small">NET PAYABLE AMOUNT</h5>
              <h2 className="mb-0 fw-bold">₹{summary.NetPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
            </Card>

            {/* Action Bar */}
            <div className="d-flex justify-content-end gap-2 mt-4 no-print">
              <Button variant="outline-primary" onClick={() => window.print()}>Print</Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        !error && <div className="text-center text-muted py-5">Please select a period to view your payslip.</div>
      )}
    </Container>
  );
};

export default EmployeePayslip;
