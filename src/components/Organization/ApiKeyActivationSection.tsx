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
  GetApiKeyInfoAsync,
  SaveApiKeyInfo,
} from "../../services/organizationService";
import { fireAudit } from "../../utils/auditUtils";

const ApiKeyActivationSection: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = id ? Number(id) : userFromStorage?.organizationID || 0;

  const [isApiKeyActivated, setIsApiKeyActivated] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);

  const [oldIsApiKeyActivated, setOldIsApiKeyActivated] = useState<boolean>(false);
  const [oldApiKey, setOldApiKey] = useState<string>("");
  const [oldDomain, setOldDomain] = useState<string>("");
  const [oldRemarks, setOldRemarks] = useState<string>("");

  useEffect(() => {
    if (organizationID) {
      fetchApiKeyDetails(organizationID);
    } else {
      setFetchLoading(false);
    }
  }, [organizationID]);

  const fetchApiKeyDetails = async (orgId: number) => {
    try {
      setFetchLoading(true);
      const data = await GetApiKeyInfoAsync(orgId);
      if (data && data.length > 0) {
        const apiInfo = data[0];
        const apiKeyValue = apiInfo.APIKey || "";
        const domainValue = apiInfo.Domain || "";
        const isActive = apiInfo.IsActive || false;

        setApiKey(apiKeyValue);
        setDomain(domainValue);
        setIsApiKeyActivated(isActive);

        setOldApiKey(apiKeyValue);
        setOldDomain(domainValue);
        setOldIsApiKeyActivated(isActive);

        setRemarks("");
        setOldRemarks("");
      }
    } catch (error) {
      console.error("Error fetching API key details:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!organizationID) {
      alert("Organization ID not found.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        OrganizationId: organizationID,
        APIKey: apiKey.trim(),
        Domain: domain.trim(),
        CreatedBy: userFromStorage?.name || "Admin",
      };

      const response = await SaveApiKeyInfo(payload);

      if (
        response?.value === 1 ||
        response?.Value === 1 ||
        response?.success ||
        response
      ) {
        alert(
          response?.MSG ||
            response?.message ||
            "API Key information saved successfully."
        );

        fireAudit(
          "UPDATE",
          "ApiKeyActivation",
          {
            IsApiKeyActivated: oldIsApiKeyActivated,
            ApiKey: oldApiKey,
            Domain: oldDomain,
            Remarks: oldRemarks,
          },
          {
            IsApiKeyActivated: isApiKeyActivated,
            ApiKey: apiKey.trim(),
            Domain: domain.trim(),
            Remarks: remarks.trim(),
          },
          organizationID,
          userFromStorage?.name || "Admin",
          "ApiKeyActivationSection"
        );

        setOldApiKey(apiKey.trim());
        setOldDomain(domain.trim());
        setOldRemarks(remarks.trim());
        setOldIsApiKeyActivated(isApiKeyActivated);
      } else {
        alert(response?.MSG || response?.message || "Operation failed.");
      }
    } catch (error) {
      console.error("Error updating API key:", error);
      alert("Something went wrong while saving API Key information.");
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
    <div className="org-settings-section">
      <div className="org-settings-section-header">
        <div className="org-settings-section-title">API Key Configuration</div>
        <div className="org-settings-section-description">
          Manage API access and domain whitelisting for organization integrations.
        </div>
      </div>

      {isApiKeyActivated && (
        <Alert
          variant="success"
          style={{ borderRadius: 14, padding: "14px 18px", fontSize: "0.9rem", marginBottom: 24 }}
        >
          <i className="bi bi-check-circle-fill me-2" />
          API Key is <strong>active</strong> — requests from whitelisted domains will be accepted.
        </Alert>
      )}

      <Row className="g-4">
        <Col md={2}>
          <Form.Group className="org-settings-field">
            <Form.Label className="org-settings-field-label">Active</Form.Label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                background: "#ffffff",
              }}
            >
              <Form.Check
                type="switch"
                checked={isApiKeyActivated}
                onChange={(e) => setIsApiKeyActivated(e.target.checked)}
              />
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111827" }}>
                {isApiKeyActivated ? "On" : "Off"}
              </span>
            </div>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="org-settings-field">
            <Form.Label className="org-settings-field-label">API Key</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="org-settings-input"
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label
              style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 6 }}
            >
              Whitelisted Domain
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. https://app.example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={{
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: "0.9rem",
              }}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label
              style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 6 }}
            >
              Remarks
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Optional remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: "0.9rem",
              }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Actions */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="primary"
          onClick={handleSaveApiKey}
          disabled={loading}
          style={{
            borderRadius: 8,
            padding: "10px 32px",
            fontWeight: 600,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" />
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-floppy" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyActivationSection;
