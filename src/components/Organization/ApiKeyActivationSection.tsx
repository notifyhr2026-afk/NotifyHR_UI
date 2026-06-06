import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
// import {
//   PutApiKeyActivationAsync,
//   getOrgDetailsAsync,
// } from "../../services/organizationService";
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
  const [remarks, setRemarks] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);

  // Old values for audit
  const [oldIsApiKeyActivated, setOldIsApiKeyActivated] =
    useState<boolean>(false);

  const [oldApiKey, setOldApiKey] = useState<string>("");
  const [oldRemarks, setOldRemarks] = useState<string>("");

  useEffect(() => {
    if (organizationID) {
      fetchOrganizationDetails(organizationID);
    }
  }, [organizationID]);

  const fetchOrganizationDetails = async (orgId: number) => {
    try {
      setFetchLoading(true);

    //   const data = await getOrgDetailsAsync(orgId);

    //   if (data?.length) {
    //     const org = data[0];

    //     const isActive = org.IsApiKeyActivated || false;
    //     const apiKeyValue = org.ApiKey || "";
    //     const remarksValue = org.ApiKeyRemarks || "";

        // setIsApiKeyActivated(isActive);
        // setApiKey(apiKeyValue);
        // setRemarks(remarksValue);

        // setOldIsApiKeyActivated(isActive);
        // setOldApiKey(apiKeyValue);
        // setOldRemarks(remarksValue);
      //}
    } catch (error) {
      console.error("Error fetching organization details:", error);
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
        organizationID,
        isApiKeyActivated: isApiKeyActivated,
        apiKey: apiKey.trim(),
        remarks: remarks.trim(),
        modifiedBy: userFromStorage?.name || "Admin",
      };

      //const response = await PutApiKeyActivationAsync(payload);

    //   console.log("API Response:", response);

    //   const result = Array.isArray(response)
    //     ? response[0]
    //     : response;

    //   if (result?.value === 1) {
    //     alert(result.MSG || "API Key updated successfully.");

        // Audit Logging
        const oldData = {
          IsApiKeyActivated: oldIsApiKeyActivated,
          ApiKey: oldApiKey,
          Remarks: oldRemarks,
        };

        const newData = {
          IsApiKeyActivated: isApiKeyActivated,
          ApiKey: apiKey.trim(),
          Remarks: remarks.trim(),
        };

        fireAudit(
          "UPDATE",
          "ApiKeyActivation",
          oldData,
          newData,
          Number(id),
          userFromStorage?.name || "Admin",
          "ApiKeyActivationSection"
        );

    //     setOldIsApiKeyActivated(isApiKeyActivated);
    //     setOldApiKey(apiKey.trim());
    //     setOldRemarks(remarks.trim());
    //   } else {
    //     alert(result?.MSG || "Operation failed.");
    //  }
    } catch (error) {
      console.error("Error updating API key:", error);
      alert("Something went wrong while updating API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <h6 className="mb-3">API Key Activation</h6>

        <Row className="g-3 align-items-center">
          <Col md={3}>
            <Form.Check
              type="checkbox"
              label="Activate API Key"
              checked={isApiKeyActivated}
              onChange={(e) =>
                setIsApiKeyActivated(e.target.checked)
              }
              disabled={fetchLoading}
            />
          </Col>

          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={fetchLoading}
            />
          </Col>

          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={fetchLoading}
            />
          </Col>

          <Col md={2}>
            <Button
              variant="primary"
              onClick={handleSaveApiKey}
              disabled={
                !apiKey.trim() ||
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