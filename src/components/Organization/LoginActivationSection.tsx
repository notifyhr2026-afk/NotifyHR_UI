import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  PutActivateLoginsAsync,
  getOrgDetailsAsync,
} from "../../services/organizationService";
import { fireAudit } from "../../utils/auditUtils";

const LoginActivationSection: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = id ? Number(id) : userFromStorage?.organizationID || 0;

  const [isLoginActivate, setIsLoginActivate] = useState<boolean>(false);
  const [loginRemarks, setLoginRemarks] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [oldIsLoginActivate, setOldIsLoginActivate] = useState<boolean>(false);
  const [oldLoginRemarks, setOldLoginRemarks] = useState<string>("");

  useEffect(() => {
    if (organizationID) {
      fetchOrganizationDetails(organizationID);
    }
  }, [organizationID]);

  const fetchOrganizationDetails = async (orgId: number) => {
    try {
      setFetchLoading(true);
      const data = await getOrgDetailsAsync(orgId);
      if (data?.length) {
        const org = data[0];
        const isLoginActivateValue = org.IsLoginActivate || false;
        const loginRemarksValue = org.LoginRemarks || "";

        setIsLoginActivate(isLoginActivateValue);
        setLoginRemarks(loginRemarksValue);
        setOldIsLoginActivate(isLoginActivateValue);
        setOldLoginRemarks(loginRemarksValue);
      }
    } catch (error) {
      console.error("Error fetching organization details:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleActivateLogin = async () => {
    if (!organizationID) {
      alert("Organization ID not found.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        organizationID,
        isLoginActivated: isLoginActivate,
        loginRemarks: loginRemarks.trim(),
        modifiedBy: "Admin",
      };

      const response = await PutActivateLoginsAsync(payload);
      const result = Array.isArray(response) ? response[0] : response;

      if (result?.value === 1) {
        alert(result.MSG || "Success");

        fireAudit(
          "UPDATE",
          "LoginActivation",
          {
            IsLoginActivate: oldIsLoginActivate,
            LoginRemarks: oldLoginRemarks,
          },
          {
            IsLoginActivate: isLoginActivate,
            LoginRemarks: loginRemarks.trim(),
          },
          Number(id),
          userFromStorage?.name || "Admin",
          "LoginActivationSection"
        );

        setOldIsLoginActivate(isLoginActivate);
        setOldLoginRemarks(loginRemarks.trim());
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

  if (fetchLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          color: "var(--text-color)",
          opacity: 0.5,
        }}
      >
        <Spinner animation="border" className="me-3" />
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(13, 110, 253, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            color: "var(--brand-primary, #0d6efd)",
          }}
        >
          <i className="bi bi-shield-lock" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Login Activation
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: 1 }}>
            Enable or disable login access for your organization
          </div>
        </div>
      </div>

      {/* Status alert */}
      {isLoginActivate && (
        <Alert
          variant="success"
          style={{
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: "0.82rem",
            marginBottom: 20,
          }}
        >
          <i className="bi bi-check-circle-fill me-2" />
          Login is currently <strong>active</strong> for this organization.
        </Alert>
      )}

      <Row className="g-3 align-items-end">
        <Col md={3}>
          <Form.Group>
            <Form.Label
              style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 6 }}
            >
              Status
            </Form.Label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                background: "var(--card-bg)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isLoginActivate ? "#22c55e" : "#ef4444",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                {isLoginActivate ? "Active" : "Inactive"}
              </span>
              <Form.Check
                type="switch"
                checked={isLoginActivate}
                onChange={(e) => setIsLoginActivate(e.target.checked)}
                style={{ marginLeft: "auto" }}
              />
            </div>
          </Form.Group>
        </Col>

        <Col md={5}>
          <Form.Group>
            <Form.Label
              style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 6 }}
            >
              Remarks
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Login activated for Q1 batch"
              value={loginRemarks}
              onChange={(e) => setLoginRemarks(e.target.value)}
              style={{
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: "0.9rem",
              }}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Button
            variant={isLoginActivate ? "outline-danger" : "success"}
            onClick={handleActivateLogin}
            disabled={!loginRemarks.trim() || loading}
            style={{
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: "0.85rem",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" />
                Processing...
              </>
            ) : isLoginActivate ? (
              <>
                <i className="bi bi-lock" />
                Deactivate Logins
              </>
            ) : (
              <>
                <i className="bi bi-unlock" />
                Activate Logins
              </>
            )}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default LoginActivationSection;
