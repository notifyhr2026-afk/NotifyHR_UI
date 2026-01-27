import React, { useState } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";

const LoginActivationSection: React.FC = () => {
  const [isLoginActivate, setIsLoginActivate] = useState<boolean>(false);
  const [loginRemarks, setLoginRemarks] = useState<string>("");

  const handleActivateLogin = () => {
    console.log("Activate Login Payload:", {
      isLoginActivate,
      loginRemarks,
    });

    // API integration later
    alert("Login activation updated successfully!");
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <h6 className="mb-3">Login Activation</h6>

        <Row className="align-items-center">
          <Col md={3}>
            <Form.Check
              type="checkbox"
              label="Is Login Activated"
              checked={isLoginActivate}
              onChange={(e) => setIsLoginActivate(e.target.checked)}
            />
          </Col>

          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Login remarks"
              value={loginRemarks}
              onChange={(e) => setLoginRemarks(e.target.value)}
            />
          </Col>

          <Col md={3} className="text-end">
            <Button
              variant="success"
              onClick={handleActivateLogin}
              disabled={!loginRemarks.trim()}
            >
               Activate & Deactivate Logins
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default LoginActivationSection;
