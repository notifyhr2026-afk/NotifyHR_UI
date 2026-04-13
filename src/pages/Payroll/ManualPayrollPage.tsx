import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import branchService from "../../services/branchService";
import departmentService from "../../services/departmentService";

// ===== Types =====
interface DropdownItem {
  id: number;
  name: string;
}

const ManualPayrollPage: React.FC = () => {
  // ===== States =====
  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);

  const [branch, setBranch] = useState<number | "All">("All");
  const [department, setDepartment] = useState<number | "All">("All");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [processedData, setProcessedData] = useState<
    { branch: string; department: string; month: number; year: number; count: number }[]
  >([]);

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ===== Fetch Dropdown Data =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID;

        if (!organizationID) {
          setError("Organization ID not found");
          return;
        }

        const [branchesData, departmentsData] = await Promise.all([
          branchService.getBranchesAsync(organizationID),
          departmentService.getdepartmentesAsync(organizationID),
        ]);

        const branchesList = Array.isArray(branchesData)
          ? branchesData
          : branchesData?.Table || [];

        const departmentsList = Array.isArray(departmentsData)
          ? departmentsData
          : departmentsData?.Table || [];

        setBranches(
          branchesList.map((b: any) => ({
            id: b.BranchID || b.id,
            name: b.BranchName || b.name,
          }))
        );

        setDepartments(
          departmentsList.map((d: any) => ({
            id: d.DepartmentID || d.id,
            name: d.DepartmentName || d.name,
          }))
        );

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load dropdown data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== Run Payroll =====
  const handleRunPayroll = () => {
    if (branch === "All" || department === "All") {
      setMessage("⚠️ Please select both Branch and Department.");
      return;
    }

    const selectedBranch = branches.find((b) => b.id === branch)?.name || "";
    const selectedDept = departments.find((d) => d.id === department)?.name || "";

    const alreadyProcessed = processedData.find(
      (p) =>
        p.branch === selectedBranch &&
        p.department === selectedDept &&
        p.month === month &&
        p.year === year
    );

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);

      if (alreadyProcessed) {
        setMessage(
          `ℹ️ Payroll already processed for ${selectedDept} (${selectedBranch}) for ${month}/${year}.`
        );
      } else {
        const count = Math.floor(Math.random() * 10) + 1;

        setProcessedData((prev) => [
          ...prev,
          {
            branch: selectedBranch,
            department: selectedDept,
            month,
            year,
            count,
          },
        ]);

        setMessage(
          `✅ Payroll processed for ${count} employees in ${selectedDept} (${selectedBranch}) for ${month}/${year}.`
        );
      }
    }, 1000);
  };

  // ===== UI =====
  return (
    <Container>
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">Manual Payroll Processing</h3>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p>Loading...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <Row className="mb-3">
                {/* Branch */}
                <Col md={3}>
                  <Form.Select
                    value={branch}
                    onChange={(e) =>
                      setBranch(e.target.value === "All" ? "All" : Number(e.target.value))
                    }
                  >
                    <option value="All">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Department */}
                <Col md={3}>
                  <Form.Select
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value === "All" ? "All" : Number(e.target.value))
                    }
                  >
                    <option value="All">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Month */}
                <Col md={2}>
                  <Form.Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Year */}
                <Col md={2}>
                  <Form.Control
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                </Col>

                {/* Button */}
                <Col md={2}>
                  <Button onClick={handleRunPayroll} disabled={processing}>
                    {processing ? "Processing..." : "Run Payroll"}
                  </Button>
                </Col>
              </Row>

              {/* Message */}
              {message && (
                <Alert
                  variant={
                    message.startsWith("✅")
                      ? "success"
                      : message.startsWith("ℹ️")
                      ? "info"
                      : "warning"
                  }
                >
                  {message}
                </Alert>
              )}

              {/* Summary */}
              <h5>Processed Payrolls:</h5>
              {processedData.length === 0 ? (
                <p>No payrolls processed yet.</p>
              ) : (
                processedData.map((p, idx) => (
                  <p key={idx}>
                    Branch: {p.branch}, Department: {p.department}, Month/Year: {p.month}/{p.year}, Employees: {p.count}
                  </p>
                ))
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ManualPayrollPage;