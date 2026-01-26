import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  getOrgDetailsAsync,
  getOrganizationTypes,
  updateOrganization,
} from "../../services/organizationService";
import { Organization } from "../../types/organization";
import { organizationTypes } from "../../types/organizationTypes";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface OrganizationForm {
  OrganizationName: string;
  Email: string;
  Phone: string;
  Website: string;
  Industry: string;
  OrganizationTypeID: string;
  CreatedBy: "Admin";
}

const OrganizationDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

  // URL ID has priority, fallback to localStorage
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
    CreatedBy: "Admin"
  });

  const [orgTypes, setOrgTypes] = useState<organizationTypes[]>([]);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ==========================
     Load Organization Details
  ========================== */
  useEffect(() => {
    if (organizationID) {
      fetchOrganizationDetails(organizationID);
    }
  }, [organizationID]);

  const fetchOrganizationDetails = async (orgId: number) => {
    try {
      setLoading(true);
      const data = await getOrgDetailsAsync(orgId);

      if (data?.length) {
        const org = data[0];
        setFormData({
          OrganizationName: org.OrganizationName || "",
          Email: org.Email || "",
          Phone: org.Phone || "",
          Website: org.Website || "",
          Industry: org.Industry || "",
          OrganizationTypeID: org.OrganizationTypeID?.toString() || "",
          CreatedBy: "Admin"
        });
        //toast.success("Organization details loaded successfully");
      } else {
        toast.warning("Organization details not found");
      }
    } catch (error) {
      console.error("Failed to load organization details", error);
      toast.error("Failed to load organization details");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     Load Organization Types
  ========================== */
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getOrganizationTypes();
        setOrgTypes(types);
      } catch (error) {
        console.error("Failed to load organization types", error);
        toast.error("Failed to load organization types");
      }
    };
    fetchTypes();
  }, []);

  /* ==========================
     Handlers
  ========================== */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      OrganizationID: organizationID!, // ✅ PASS ID
      OrganizationName: formData.OrganizationName,
      Email: formData.Email,
      Phone: formData.Phone,
      Website: formData.Website,
      Industry: formData.Industry,
      OrganizationTypeID: Number(formData.OrganizationTypeID),

      CreatedBy: formData.CreatedBy, // or "Admin"
      ModifiedBy: "Admin",
      CreatedAt: null,

      IsActive: true,
      IsDeleted: false,
    };

    try {
      setLoading(true);
      //toast.info("Saving organization...");
      await updateOrganization(payload);
      toast.success("Organization updated successfully");
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
      CreatedBy: "Admin"
    });
    setValidated(false);
    toast.info("Form cleared");
  };

  /* ==========================
     Render
  ========================== */
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Form
        className="mt-3"
        noValidate
        validated={validated}
        onSubmit={handleSave}
      >
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Organization Name</Form.Label>
              <Form.Control
                required
                type="text"
                name="OrganizationName"
                value={formData.OrganizationName}
                onChange={handleChange}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                Organization Name is required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                Valid email is required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="text"
                name="Website"
                value={formData.Website}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Industry</Form.Label>
              <Form.Select
                required
                name="Industry"
                value={formData.Industry}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Industry</option>
                <option value="IT">IT</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Industry is required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Organization Type</Form.Label>
              <Form.Select
                required
                name="OrganizationTypeID"
                value={formData.OrganizationTypeID}
                onChange={handleChange}
                disabled={loading}
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

        <Row className="mt-4">
          <Col className="text-end">
            <Button
              variant="primary"
              className="me-2"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default OrganizationDetails;
