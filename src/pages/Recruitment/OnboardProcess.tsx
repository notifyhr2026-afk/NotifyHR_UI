import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  ProgressBar,
  Badge,
} from "react-bootstrap";

// ===== Types =====
interface OnboardingStep {
  id: number;
  title: string;
  completed: boolean;
}

// ===== Component =====
const OnboardProcess: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ===== Sample Candidate Data =====
  const candidate = {
    CandidateID: id,
    Name: "John Doe",
    Email: "john.doe@email.com",
    Phone: "9876543210",
    Department: "Frontend Development",
    JoiningDate: "2026-06-10",
    Status: "Offer Accepted",
  };

  // ===== Onboarding Steps =====
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 1,
      title: "Offer Letter Accepted",
      completed: true,
    },
    {
      id: 2,
      title: "Documents Submitted",
      completed: false,
    },
    {
      id: 3,
      title: "Background Verification",
      completed: false,
    },
    {
      id: 4,
      title: "HR Discussion Completed",
      completed: false,
    },
    {
      id: 5,
      title: "Laptop Allocated",
      completed: false,
    },
    {
      id: 6,
      title: "Employee ID Created",
      completed: false,
    },
  ]);

  // ===== Form State =====
  const [remarks, setRemarks] = useState("");

  // ===== Progress =====
  const completedCount = steps.filter((s) => s.completed).length;

  const progressPercentage = Math.round(
    (completedCount / steps.length) * 100
  );

  // ===== Toggle Step =====
  const handleToggleStep = (stepId: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? { ...step, completed: !step.completed }
          : step
      )
    );
  };

  // ===== Save =====
  const handleSave = () => {
    console.log({
      candidateId: id,
      steps,
      remarks,
    });

    alert("Onboarding process saved successfully");
  };

  return (
    <div className="container mt-4">
      {/* ===== Header ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Candidate Onboarding Process</h3>
          <p className="text-muted mb-0">
            Manage onboarding activities and progress
          </p>
        </div>

        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* ===== Candidate Details ===== */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-4">Candidate Details</h5>

          <Row>
            <Col md={4} className="mb-3">
              <strong>Name</strong>
              <div>{candidate.Name}</div>
            </Col>

            <Col md={4} className="mb-3">
              <strong>Email</strong>
              <div>{candidate.Email}</div>
            </Col>

            <Col md={4} className="mb-3">
              <strong>Phone</strong>
              <div>{candidate.Phone}</div>
            </Col>

            <Col md={4} className="mb-3">
              <strong>Department</strong>
              <div>{candidate.Department}</div>
            </Col>

            <Col md={4} className="mb-3">
              <strong>Joining Date</strong>
              <div>{candidate.JoiningDate}</div>
            </Col>

            <Col md={4} className="mb-3">
              <strong>Status</strong>
              <div>
                <Badge bg="success">{candidate.Status}</Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Progress ===== */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Onboarding Progress</h5>

            <span className="fw-bold">{progressPercentage}%</span>
          </div>

          <ProgressBar now={progressPercentage} />

          <div className="mt-2 text-muted">
            {completedCount} of {steps.length} tasks completed
          </div>
        </Card.Body>
      </Card>

      {/* ===== Onboarding Checklist ===== */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-4">Checklist</h5>

          <Row>
            {steps.map((step) => (
              <Col md={6} key={step.id} className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={step.title}
                  checked={step.completed}
                  onChange={() => handleToggleStep(step.id)}
                />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Remarks ===== */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">HR Remarks</h5>

          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Enter remarks here..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Card.Body>
      </Card>

      {/* ===== Actions ===== */}
      <div className="d-flex justify-content-end gap-2 mb-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>

        <Button variant="primary" onClick={handleSave}>
          Save Process
        </Button>
      </div>
    </div>
  );
};

export default OnboardProcess;