import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

const ManualPayrollPage: React.FC = () => {
  const [branch, setBranch] = useState("All");
  const [department, setDepartment] = useState("All");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [processedData, setProcessedData] = useState<
    { branch: string; department: string; month: number; year: number; count: number }[]
  >([
    { branch: "Hyderabad", department: "IT", month: 3, year: 2026, count: 5 },
    { branch: "Chennai", department: "HR", month: 3, year: 2026, count: 3 },
  ]);

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRunPayroll = () => {
    if (branch === "All" || department === "All") {
      setMessage("⚠️ Please select both Branch and Department to run payroll.");
      return;
    }

    // Check if already processed
    const alreadyProcessed = processedData.find(
      (p) =>
        p.branch === branch &&
        p.department === department &&
        p.month === month &&
        p.year === year
    );

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);

      if (alreadyProcessed) {
        setMessage(
          `ℹ️ Payroll already processed for ${department} (${branch}) for ${month}/${year}. You can reprocess if needed.`
        );
      } else {
        // Simulate processed count
        const count = Math.floor(Math.random() * 10) + 1;
        setProcessedData([
          ...processedData,
          { branch, department, month, year, count },
        ]);
        setMessage(`✅ Payroll processed for ${count} employees in ${department} (${branch}) for ${month}/${year}.`);
      }
    }, 1000);
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">Manual Payroll Processing</h3>

          <Row className="mb-3">
            <Col md={2}>
              <Form.Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="All">Select Branch</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="All">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </Col>
            <Col md={2}>
              {department !== "All" && (
                <Button
                  onClick={handleRunPayroll}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Run Payroll"}
                </Button>
              )}
            </Col>
          </Row>

          {message && (
            <Row className="mb-3">
              <Col>
                <Alert variant={message.startsWith("✅") ? "success" : message.startsWith("ℹ️") ? "info" : "warning"}>
                  {message}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Summary of already processed payrolls */}
          <Row className="mb-3">
            <Col>
              <h5>Processed Payrolls:</h5>
              {processedData.length === 0 && <p>No payrolls processed yet.</p>}
              {processedData.map((p, idx) => (
                <p key={idx}>
                  Branch: {p.branch}, Department: {p.department}, Month/Year: {p.month}/{p.year}, Employees: {p.count}
                </p>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ManualPayrollPage;