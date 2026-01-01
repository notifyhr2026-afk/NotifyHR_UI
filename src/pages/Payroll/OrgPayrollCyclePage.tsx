import React, { useState } from "react";
import { Card, Row, Col, Form, Badge, Button } from "react-bootstrap";

interface PayrollCycle {
  id: number;
  cycleName: string;
  status: "Active" | "Inactive";
}

const OrgPayrollCyclePage: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCycles, setSelectedCycles] = useState<number[]>([]);

  const branches = [
    { id: 1, name: "Head Office" },
    { id: 2, name: "Bangalore Branch" },
    { id: 3, name: "Mumbai Branch" },
  ];

  const payrollCycles: PayrollCycle[] = [
    { id: 1, cycleName: "Monthly", status: "Active" },
    { id: 2, cycleName: "Bi-Weekly", status: "Active" },
    { id: 3, cycleName: "Weekly", status: "Inactive" },
    { id: 4, cycleName: "Semi-Monthly", status: "Active" },
  ];

  const toggleCycle = (id: number) => {
    setSelectedCycles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <Card className="p-4 shadow-sm">
      <h4 className="mb-4">Organization Payroll Cycles</h4>

      {/* Branch Selection */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Select Branch</Form.Label>
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
      </Form.Group>

      {/* Payroll Cycle Cards */}
      <Row>
        {payrollCycles.map((cycle) => {
          const isSelected = selectedCycles.includes(cycle.id);

          return (
            <Col md={6} lg={4} key={cycle.id} className="mb-4">
             <Card
  className={`h-100 ${
    isSelected ? "border-primary shadow" : ""
  }`}
>
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
