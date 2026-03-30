import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Badge, Button, Spinner } from "react-bootstrap";
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

interface CycleDates {
  startDate: string;
  endDate: string;
}

const OrgPayrollCyclePage: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCycles, setSelectedCycles] = useState<number[]>([]);
  const [cycleDates, setCycleDates] = useState<Record<number, CycleDates>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);

  const [loading, setLoading] = useState(true);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [cyclesError, setCyclesError] = useState<string | null>(null);

  // ================= FETCH BRANCHES =================
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID;

        const branchesData = await branchService.getBranchesAsync(organizationID);

        const branchesArray = Array.isArray(branchesData)
          ? branchesData
          : branchesData?.Table || [];

        const mappedBranches = branchesArray.map((branch: any) => ({
          id: branch.BranchID || branch.id,
          name: branch.BranchName || branch.name,
        }));

        setBranches(mappedBranches);
      } catch (err) {
        console.error(err);
        setError("Failed to load branches");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // ================= FETCH TEMPLATES =================
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setCyclesLoading(true);

        const data = await payrollService.GetPayrollCycleTemplates();

        const mappedCycles: PayrollCycle[] = data.map((cycle: any) => ({
          id: cycle.PayrollCycleTemplateID,
          cycleName: cycle.CycleName,
          status: cycle.IsActive ? "Active" : "Inactive",
        }));

        setPayrollCycles(mappedCycles);
      } catch (err) {
        console.error(err);
        setCyclesError("Failed to load payroll cycles");
      } finally {
        setCyclesLoading(false);
      }
    };

    fetchCycles();
  }, []);

  // ================= FETCH SAVED DATA =================
  useEffect(() => {
    const fetchSavedCycles = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID || 0;

        const data = await payrollService.GetOrgPayrollCycles(
          organizationID,
          selectedBranch ? Number(selectedBranch) : 0
        );

        if (!data || data.length === 0) return;

        const selected: number[] = [];
        const dates: Record<number, CycleDates> = {};

        data.forEach((item: any) => {
          if (item.PayrollCycleID) {
            selected.push(item.PayrollCycleTemplateID);

            dates[item.PayrollCycleTemplateID] = {
              startDate: item.StartDate?.split("T")[0],
              endDate: item.EndDate?.split("T")[0],
            };
          }
        });

        setSelectedCycles(selected);
        setCycleDates(dates);
      } catch (err) {
        console.error("Failed to load saved cycles", err);
      }
    };

    fetchSavedCycles();
  }, [selectedBranch]);

  // ================= TOGGLE =================
  const toggleCycle = (id: number) => {
    setSelectedCycles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // ================= DATE CHANGE =================
  const handleDateChange = (
    id: number,
    field: "startDate" | "endDate",
    value: string
  ) => {
    setCycleDates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setSaving(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const organizationID = user.organizationID || 0;

      for (const cycleId of selectedCycles) {
        const dates = cycleDates[cycleId];

        if (!dates?.startDate || !dates?.endDate) {
          alert("Please select dates for all selected cycles");
          return;
        }

        const payload = {
          payrollCycleID: 0,
          organizationID: organizationID,
          payrollCycleTemplateID: cycleId,
          branchID: selectedBranch ? Number(selectedBranch) : 0,
          cycleName:
            payrollCycles.find((c) => c.id === cycleId)?.cycleName || "",
          startDate: new Date(dates.startDate).toISOString(),
          endDate: new Date(dates.endDate).toISOString(),
          paymentDate: new Date().toISOString(),
          status: 1,
        };

        await payrollService.PostPayrollCycleByAsync(payload);
      }

      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ================= UI =================
  return (
    <Card className="p-5 shadow-sm">
      <h4 className="mb-4">Organization Payroll Cycles</h4>

      {/* Branch */}
      <Form.Group className="mb-4">
        <Form.Label>Select Branch</Form.Label>

        {loading && <p>Loading branches...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && (
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

      {/* Cycles */}
      <Row>
        {!cyclesLoading &&
          payrollCycles.map((cycle) => {
            const isSelected = selectedCycles.includes(cycle.id);

            return (
              <Col md={6} lg={4} key={cycle.id} className="mb-4">
                <Card className={isSelected ? "border-primary shadow" : ""}>
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <Card.Title>{cycle.cycleName}</Card.Title>
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
                        <Form.Control
                          type="date"
                          value={cycleDates[cycle.id]?.startDate || ""}
                          onChange={(e) =>
                            handleDateChange(cycle.id, "startDate", e.target.value)
                          }
                          className="mb-2"
                        />
                        <Form.Control
                          type="date"
                          value={cycleDates[cycle.id]?.endDate || ""}
                          onChange={(e) =>
                            handleDateChange(cycle.id, "endDate", e.target.value)
                          }
                        />
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
      </Row>

      {/* Save */}
      <div className="text-end mt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : "Save"}
        </Button>
      </div>
    </Card>
  );
};

export default OrgPayrollCyclePage;