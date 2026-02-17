import React, { useState } from "react";
import { Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { PutActivateLoginsAsync } from "../../services/organizationService";

interface ApiResponse {
  value: number;
  MSG: string;
}

const LoginActivationSection: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  const [isLoginActivate, setIsLoginActivate] = useState<boolean>(false);
  const [loginRemarks, setLoginRemarks] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

const handleActivateLogin = async () => {
  if (!id) {
    alert("Organization ID not found in URL.");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      organizationID: Number(id),
      isLoginActivated: isLoginActivate,
      loginRemarks: loginRemarks.trim(),
      modifiedBy: "aDMIN",
    };

    const response = await PutActivateLoginsAsync(payload);
    console.log("API Response:", response);

    const result = Array.isArray(response) ? response[0] : response;

    if (result?.value === 1) {
      alert(result.MSG || "Success");
    } else {
      alert(result?.MSG || "Operation failed.");
    }
  } catch (error) {
    console.error("Error activating login:", error);
    alert("Something went wrong while updating login activation.");
  } finally {
    setLoading(false);
  }
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
              disabled={!loginRemarks.trim() || loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Processing...
                </>
              ) : (
                "Activate & Deactivate Logins"
              )}
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default LoginActivationSection;
