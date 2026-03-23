import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Badge, Button } from "react-bootstrap";
import branchService from "../../services/branchService";
import payrollService from "../../services/payrollService";

interface Branch {
  id: number;
  name: string;
}

interface PayrollCycle {
  id: number;
  cycleName: string;
  status: "Active" | "Inactive";
}

const OrgPayrollCyclePage: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCycles, setSelectedCycles] = useState<number[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [cyclesError, setCyclesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID;

        if (!organizationID) {
          setError("Organization ID not found");
          setLoading(false);
          return;
        }

        const branchesData = await branchService.getBranchesAsync(organizationID);
        
        // Handle different response formats
        let branchesArray = Array.isArray(branchesData) ? branchesData : branchesData?.Table || [];
        
        if (branchesArray.length === 0) {
          console.warn("No branches returned from API");
        }
        
        // Map API response to component interface
        const mappedBranches = branchesArray.map((branch: any) => ({
          id: branch.BranchID || branch.id,
          name: branch.BranchName || branch.name,
        }));
        
        console.log("Mapped branches:", mappedBranches);
        setBranches(mappedBranches);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch branches - Error details:", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
        }
        setError("Failed to load branches. Please check the browser console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

useEffect(() => {
  const fetchCycles = async () => {
    try {
      setCyclesLoading(true);

      const data = await payrollService.GetPayrollCycleTemplates();

      // Map API response → your interface
      const mappedCycles: PayrollCycle[] = data.map((cycle: any) => ({
        id: cycle.PayrollCycleTemplateID,
        cycleName: cycle.CycleName,
        status: cycle.IsActive ? "Active" : "Inactive",
      }));

      setPayrollCycles(mappedCycles);
      setCyclesError(null);
    } catch (err) {
      console.error("Failed to fetch payroll cycles:", err);
      setCyclesError("Failed to load payroll cycles");
    } finally {
      setCyclesLoading(false);
    }
  };

  fetchCycles();
}, []);

  const toggleCycle = (id: number) => {
    setSelectedCycles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <Card className="p-5 shadow-sm">
      <h4 className="mb-4">Organization Payroll Cycles</h4>

      {/* Branch Selection */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Select Branch</Form.Label>
        {loading && <p className="text-muted">Loading branches...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && (
          <Form.Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">-- Select Branch --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Form.Select>
        )}
      </Form.Group>

      {/* Payroll Cycle Cards */}
     {cyclesLoading && <p className="text-muted">Loading payroll cycles...</p>}
{cyclesError && <p className="text-danger">{cyclesError}</p>}

<Row>
  {!cyclesLoading &&
    !cyclesError &&
    payrollCycles.map((cycle) => {
      const isSelected = selectedCycles.includes(cycle.id);

      return (
        <Col md={6} lg={4} key={cycle.id} className="mb-4">
          <Card className={`h-100 ${isSelected ? "border-primary shadow" : ""}`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title className="mb-0">
                  {cycle.cycleName}
                </Card.Title>

                <Badge bg={cycle.status === "Active" ? "success" : "secondary"}>
                  {cycle.status}
                </Badge>
              </div>

              <Form.Check
                type="checkbox"
                label="Enable this payroll cycle"
                checked={isSelected}
                onChange={() => toggleCycle(cycle.id)}
                className="mb-3"
              />

              {isSelected && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control type="date" />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control type="date" />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Payment Date</Form.Label>
                    <Form.Control type="date" />
                  </Form.Group>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      );
    })}
</Row>

      {/* Save Button */}
      <div className="text-end mt-4">
        <Button
          variant="primary"
          disabled={!selectedBranch || selectedCycles.length === 0}
        >
          Save Payroll Cycles
        </Button>
      </div>
    </Card>
  );
};

export default OrgPayrollCyclePage;
