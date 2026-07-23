import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  getOrgDetailsAsync,
  getOrganizationTypes,
  updateOrganization,
} from "../../services/organizationService";
import { Organization } from "../../types/organization";
import { organizationTypes } from "../../types/organizationTypes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fireAudit } from "../../utils/auditUtils";

interface OrganizationForm {
  OrganizationName: string;
  Email: string;
  Phone: string;
  Website: string;
  Industry: string;
  OrganizationTypeID: string;
  CreatedBy: string;
}

const OrganizationDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = id
    ? Number(id)
    : userFromStorage?.organizationID;

  const [formData, setFormData] = useState<OrganizationForm>({
    OrganizationName: "",
    Email: "",
    Phone: "",
    Website: "",
    Industry: "",
    OrganizationTypeID: "",
    CreatedBy: "Admin",
  });

  const [orgTypes, setOrgTypes] = useState<organizationTypes[]>([]);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [oldOrgData, setOldOrgData] = useState<OrganizationForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizationID) {
      fetchOrganizationDetails(organizationID);
    } else {
      setFetchLoading(false);
    }
  }, [organizationID]);

  useEffect(() => {
    getOrganizationTypes()
      .then(setOrgTypes)
      .catch((err) => {
        console.error("Failed to load org types", err);
        toast.error("Failed to load organization types");
      });
  }, []);

  const fetchOrganizationDetails = async (orgId: number) => {
    try {
      setFetchLoading(true);
      setError(null);
      const data = await getOrgDetailsAsync(orgId);
      if (data?.length) {
        const org = data[0];
        const fetchedData = {
          OrganizationName: org.OrganizationName || "",
          Email: org.Email || "",
          Phone: org.Phone || "",
          Website: org.Website || "",
          Industry: org.Industry || "",
          OrganizationTypeID: org.OrganizationTypeID?.toString() || "",
          CreatedBy: "Admin",
        };
        setFormData(fetchedData);
        setOldOrgData(fetchedData);
      } else {
        setError("Organization details not found");
      }
    } catch (error) {
      console.error("Failed to load organization details", error);
      setError("Failed to load organization details");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget;
    setValidated(true);

    if (!form.checkValidity()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    const payload: Organization = {
      OrganizationID: organizationID!,
      OrganizationName: formData.OrganizationName,
      Email: formData.Email,
      Phone: formData.Phone,
      Website: formData.Website,
      Industry: formData.Industry,
      OrganizationTypeID: Number(formData.OrganizationTypeID),
      CreatedBy: formData.CreatedBy,
      ModifiedBy: "Admin",
      CreatedAt: null,
      IsActive: true,
      IsDeleted: false,
    };

    try {
      setLoading(true);
      await updateOrganization(payload);
      toast.success("Organization updated successfully");
      fireAudit(
        "UPDATE",
        "Organization",
        oldOrgData,
        formData,
        organizationID!,
        userFromStorage?.name || "Admin",
        "OrganizationDetails"
      );
    } catch (error) {
      console.error("Failed to update organization", error);
      toast.error("Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      OrganizationName: "",
      Email: "",
      Phone: "",
      Website: "",
      Industry: "",
      OrganizationTypeID: "",
      CreatedBy: "Admin",
    });
    setValidated(false);
    toast.info("Form cleared");
  };

  // Loading state
  if (fetchLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          color: "var(--text-color)",
          opacity: 0.5,
        }}
      >
        <Spinner animation="border" className="me-3" />
        Loading organization details...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="warning" style={{ margin: 0 }}>
        <i className="bi bi-exclamation-triangle me-2" />
        {error}
      </Alert>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Form noValidate validated={validated} onSubmit={handleSave} className="org-settings-page">
        <div className="org-settings-section">
          <div className="org-settings-section-header">
            <div className="org-settings-section-title">Company Information</div>
            <div className="org-settings-section-description">
              Update your organization name, contact information, and entity details.
            </div>
          </div>

          <Row className="g-4">
            <Col md={6}>
              <Form.Group className="org-settings-field">
                <Form.Label className="org-settings-field-label">
                  Organization Name <span style={{ color: "#dc3545" }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="OrganizationName"
                  value={formData.OrganizationName}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g. Acme Corp"
                  className="org-settings-input"
                />
                <Form.Control.Feedback type="invalid">
                  Organization Name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="org-settings-field">
                <Form.Label className="org-settings-field-label">
                  Email <span style={{ color: "#dc3545" }}>*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="org@example.com"
                  className="org-settings-input"
                />
                <Form.Control.Feedback type="invalid">
                  Valid email is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="org-settings-field">
                <Form.Label className="org-settings-field-label">Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="+1 234 567 890"
                  className="org-settings-input"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="org-settings-field">
                <Form.Label className="org-settings-field-label">Website</Form.Label>
                <Form.Control
                  type="text"
                  name="Website"
                  value={formData.Website}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="https://acme.com"
                  className="org-settings-input"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="org-settings-field">
                <Form.Label className="org-settings-field-label">
                  Entity Type <span style={{ color: "#dc3545" }}>*</span>
                </Form.Label>
                <Form.Select
                  required
                  name="Industry"
                  value={formData.Industry}
                  onChange={handleChange}
                  disabled={loading}
                  className="org-settings-input"
                >
                  <option value="">Select Entity Type</option>
                  <option value="Pvt Ltd">
                    Private Limited Company (Pvt Ltd)
                  </option>
                  <option value="Public Ltd">Public Limited Company</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="OPC">One Person Company (OPC)</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership Firm</option>
                  <option value="Government">Government / Public Sector Undertaking</option>
                  <option value="NGO">Non-Profit Organization / Section 8 Company</option>
                  <option value="Trust">Trust / Society</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Entity type is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="org-settings-field">
                <Form.Label className="org-settings-field-label">
                  Organization Type <span style={{ color: "#dc3545" }}>*</span>
                </Form.Label>
                <Form.Select
                  required
                  name="OrganizationTypeID"
                  value={formData.OrganizationTypeID}
                  onChange={handleChange}
                  disabled={loading}
                  className="org-settings-input"
                >
                  <option value="">Select Type</option>
                  {orgTypes.map((type) => (
                    <option
                      key={type.OrganizationTypeID}
                      value={type.OrganizationTypeID}
                    >
                      {type.OrganizationTypeName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Organization Type is required
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </div>

        <div className="org-settings-actions">
          <Button
            variant="outline-secondary"
            onClick={handleClear}
            disabled={loading}
            className="org-settings-btn org-settings-btn-secondary"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="org-settings-btn org-settings-btn-primary"
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default OrganizationDetails;
