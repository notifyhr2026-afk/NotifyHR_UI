import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import branchService from "../../services/branchService";
import departmentService from "../../services/departmentService";
import payrollService from "../../services/payrollService";

interface DropdownItem {
  id: number;
  name: string;
}

interface ProcessedPayroll {
  branch: string;
  department: string;
  month: number;
  year: number;
  count: number;
}

const ManualPayrollPage: React.FC = () => {
  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);

  const [branch, setBranch] = useState<number | "All">("All");
  const [department, setDepartment] = useState<number | "All">("All");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [processedData, setProcessedData] = useState<ProcessedPayroll[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user.organizationID;
  const processedBy =user?.userID || 0;

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      setLoading(true);

      if (!organizationID) {
        setError("Organization ID not found.");
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
      setError("Failed to load dropdown data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    setMessage(null);

    if (branch === "All") {
      setMessage("Please select Branch.");
      return;
    }

    if (department === "All") {
      setMessage("Please select Department.");
      return;
    }

    try {
      setProcessing(true);

      const payload = {
        employeeIDsJSON: "",
        month,
        year,
        processedBy: String(processedBy),
        departmentID: department,
        branchID: branch,
        organizationID,
      };

      const response = await payrollService.RunPayrollBulkAsyncByAsync(
        payload
      );

      const selectedBranch =
        branches.find((x) => x.id === branch)?.name || "";

      const selectedDepartment =
        departments.find((x) => x.id === department)?.name || "";

      let employeeCount = 0;

      if (response?.employeeCount) {
        employeeCount = response.employeeCount;
      } else if (response?.count) {
        employeeCount = response.count;
      }

      setProcessedData((prev) => [
        ...prev,
        {
          branch: selectedBranch,
          department: selectedDepartment,
          month,
          year,
          count: employeeCount,
        },
      ]);

      setMessage(
        response?.message ||
          `Payroll processed successfully for ${selectedDepartment}.`
      );
    } catch (err: any) {
      console.error(err);

      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Payroll processing failed."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container className="mt-3">
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">
            Manual Payroll Processing
          </h3>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Select
                    value={branch}
                    onChange={(e) =>
                      setBranch(
                        e.target.value === "All"
                          ? "All"
                          : Number(e.target.value)
                      )
                    }
                  >
                    <option value="All">Select Branch</option>

                    {branches.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Select
                    value={department}
                    onChange={(e) =>
                      setDepartment(
                        e.target.value === "All"
                          ? "All"
                          : Number(e.target.value)
                      )
                    }
                  >
                    <option value="All">Select Department</option>

                    {departments.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Select
                    value={month}
                    onChange={(e) =>
                      setMonth(Number(e.target.value))
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Control
                    type="number"
                    value={year}
                    onChange={(e) =>
                      setYear(Number(e.target.value))
                    }
                  />
                </Col>

                <Col md={2}>
                  <Button
                    className="w-100"
                    onClick={handleRunPayroll}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Spinner
                          size="sm"
                          animation="border"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      "Run Payroll"
                    )}
                  </Button>
                </Col>
              </Row>

              {message && (
                <Alert
                  variant={
                    message.toLowerCase().includes("success")
                      ? "success"
                      : message.toLowerCase().includes("fail")
                      ? "danger"
                      : "info"
                  }
                >
                  {message}
                </Alert>
              )}

              <h5 className="mt-4">Processed Payrolls</h5>

              {processedData.length === 0 ? (
                <p>No payroll processed yet.</p>
              ) : (
                processedData.map((item, index) => (
                  <Card key={index} className="mb-2">
                    <Card.Body>
                      <strong>Branch:</strong> {item.branch}
                      <br />
                      <strong>Department:</strong>{" "}
                      {item.department}
                      <br />
                      <strong>Month/Year:</strong>{" "}
                      {item.month}/{item.year}
                      <br />
                      <strong>Employees:</strong>{" "}
                      {item.count}
                    </Card.Body>
                  </Card>
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