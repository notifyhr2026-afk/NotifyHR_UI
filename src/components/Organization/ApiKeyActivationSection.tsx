import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Row,
  Col,
  Card,
  Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  GetApiKeyInfoAsync,
  SaveApiKeyInfo,
} from "../../services/organizationService";
import { fireAudit } from "../../utils/auditUtils";

const ApiKeyActivationSection: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  const userFromStorage = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const organizationID =
    id ? Number(id) : userFromStorage?.organizationID || 0;

  const [isApiKeyActivated, setIsApiKeyActivated] =
    useState<boolean>(false);

  const [apiKey, setApiKey] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] =
    useState<boolean>(true);

  // Old values for audit
  const [oldIsApiKeyActivated, setOldIsApiKeyActivated] =
    useState<boolean>(false);

  const [oldApiKey, setOldApiKey] = useState<string>("");
  const [oldDomain, setOldDomain] = useState<string>("");
  const [oldRemarks, setOldRemarks] = useState<string>("");

  useEffect(() => {
    if (organizationID) {
      fetchOrganizationDetails(organizationID);
    }
  }, [organizationID]);

  const fetchOrganizationDetails = async (
    orgId: number
  ) => {
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

        // remarks are local only (not in DB/SP)
        setRemarks("");
        setOldRemarks("");
      }
    } catch (error) {
      console.error(
        "Error fetching API key details:",
        error
      );
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
        CreatedBy:
          userFromStorage?.name || "Admin",
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

        const oldData = {
          IsApiKeyActivated: oldIsApiKeyActivated,
          ApiKey: oldApiKey,
          Domain: oldDomain,
          Remarks: oldRemarks,
        };

        const newData = {
          IsApiKeyActivated: isApiKeyActivated,
          ApiKey: apiKey.trim(),
          Domain: domain.trim(),
          Remarks: remarks.trim(),
        };

        fireAudit(
          "UPDATE",
          "ApiKeyActivation",
          oldData,
          newData,
          organizationID,
          userFromStorage?.name || "Admin",
          "ApiKeyActivationSection"
        );

        setOldApiKey(apiKey.trim());
        setOldDomain(domain.trim());
        setOldRemarks(remarks.trim());
        setOldIsApiKeyActivated(
          isApiKeyActivated
        );
      } else {
        alert(
          response?.MSG ||
            response?.message ||
            "Operation failed."
        );
      }
    } catch (error) {
      console.error(
        "Error updating API key:",
        error
      );
      alert(
        "Something went wrong while saving API Key information."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <h6 className="mb-3">
          API Key Activation
        </h6>

        <Row className="g-3 align-items-center">
          <Col md={2}>
            <Form.Check
              type="checkbox"
              label="Activate API Key"
              checked={isApiKeyActivated}
              onChange={(e) =>
                setIsApiKeyActivated(
                  e.target.checked
                )
              }
              disabled={fetchLoading}
            />
          </Col>

          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) =>
                setApiKey(e.target.value)
              }
              disabled={fetchLoading}
            />
          </Col>

          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Enter Domain"
              value={domain}
              onChange={(e) =>
                setDomain(e.target.value)
              }
              disabled={fetchLoading}
            />
          </Col>

          <Col md={2}>
            <Form.Control
              type="text"
              placeholder="Remarks"
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              disabled={fetchLoading}
            />
          </Col>

          <Col md={2}>
            <Button
              variant="primary"
              onClick={handleSaveApiKey}
              disabled={
                !apiKey.trim() ||
                !domain.trim() ||
                !remarks.trim() ||
                loading ||
                fetchLoading
              }
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : fetchLoading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Loading...
                </>
              ) : (
                "Save API Key"
              )}
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ApiKeyActivationSection;