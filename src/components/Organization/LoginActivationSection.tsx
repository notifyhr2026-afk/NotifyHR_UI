import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { PutActivateLoginsAsync, getOrgDetailsAsync } from "../../services/organizationService";
import { fireAudit } from '../../utils/auditUtils';


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

  // Fetch organization details on component mount
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
        setOldIsLoginActivate(isLoginActivateValue); // Store old values for audit
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
    alert("Organization ID not found in URL or local storage.");
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
    console.log("API Response:", response);

    const result = Array.isArray(response) ? response[0] : response;

    if (result?.value === 1) {
      alert(result.MSG || "Success");
      
      // Audit logging
      const oldData = {
        IsLoginActivate: oldIsLoginActivate,
        LoginRemarks: oldLoginRemarks
      };
      const newData = {
        IsLoginActivate: isLoginActivate,
        LoginRemarks: loginRemarks.trim()
      };
      fireAudit("UPDATE", "LoginActivation", oldData, newData, Number(id), userFromStorage?.name || "Admin", "LoginActivationSection");
      
      // Update old values for future audits
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
              disabled={fetchLoading}
            />
          </Col>

          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Login remarks"
              value={loginRemarks}
              onChange={(e) => setLoginRemarks(e.target.value)}
              disabled={fetchLoading}
            />
          </Col>

          <Col md={3} className="text-end">
            <Button
              variant="success"
              onClick={handleActivateLogin}
              disabled={!loginRemarks.trim() || loading || fetchLoading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Processing...
                </>
              ) : fetchLoading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Loading...
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
