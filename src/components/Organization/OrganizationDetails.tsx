import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getOrgDetailsAsync,getOrganizationTypes } from "../../services/organizationService";
import { OrganizationTypes } from '../../types/OrganizationTypes';

interface OrganizationForm {
  OrganizationName: string;
  Email: string;
  Phone: string;
  Website: string;
  Industry: string;
  OrganizationTypeID: string;
}

interface OrganizationType {
  OrganizationTypeID: number;
  OrganizationTypeName: string;
}

const OrganizationDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

  // URL id has priority, fallback to localStorage
  const organizationID: number | undefined =
    id ? Number(id) : userFromStorage?.organizationID;

  const [formData, setFormData] = useState<OrganizationForm>({
    OrganizationName: "",
    Email: "",
    Phone: "",
    Website: "",
    Industry: "",
    OrganizationTypeID: "",
  });

  const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([]);

  // Load organization details
  useEffect(() => {
    if (organizationID) {
      loadOrganizationDetails(organizationID);
    }
  }, [organizationID]);

  const loadOrganizationDetails = async (orgId: number) => {
    try {
      const response = await getOrgDetailsAsync(orgId);

      if (response && response.length > 0) {
        const org = response[0];
        setFormData({
          OrganizationName: org.OrganizationName,
          Email: org.Email,
          Phone: org.Phone,
          Website: org.Website,
          Industry: org.Industry,
          OrganizationTypeID: org.OrganizationTypeID.toString(),
        });
      }
    } catch (error) {
      console.error("Failed to load organization details", error);
    }
  };

  // Load organization types
  useEffect(() => {
    const fetchOrganizationTypes = async () => {
      try {
        const types = await getOrganizationTypes();
        setOrganizationTypes(types);
      } catch (error) {
        console.error("Failed to load organization types", error);
      }
    };
    fetchOrganizationTypes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saving Organization...", formData);
    // You can call your save API here
  };

  const handleClear = () => {
    setFormData({
      OrganizationName: "",
      Email: "",
      Phone: "",
      Website: "",
      Industry: "",
      OrganizationTypeID: "",
    });
  };

  return (
    <Form className="mt-3">
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Organization Name</Form.Label>
            <Form.Control
              type="text"
              name="OrganizationName"
              value={formData.OrganizationName}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
            />
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
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Industry</Form.Label>
            <Form.Select
              name="Industry"
              value={formData.Industry}
              onChange={handleChange}
            >
              <option value="">Select Industry</option>
              <option value="IT">IT</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Organization Type</Form.Label>
            <Form.Select
              name="OrganizationTypeID"
              value={formData.OrganizationTypeID}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              {organizationTypes.map((type) => (
                <option key={type.OrganizationTypeID} value={type.OrganizationTypeID}>
                  {type.OrganizationTypeName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="text-end">
          <Button variant="primary" className="me-2" onClick={handleSave}>
            Save
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default OrganizationDetails;
