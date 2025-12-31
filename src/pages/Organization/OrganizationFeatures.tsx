import React, { useEffect, useState } from "react";
import { Form, Spinner, Alert, Container } from "react-bootstrap";
import Select from "react-select"; // ✅ New import for searchable dropdown
import {
  GetAllFeaturesAsync,
  GetFeaturesByOrgAsync,
  UpdateOrgFeatureAsync,
} from "../../services/featureService";
import { getOrganizations } from "../../services/organizationService";

interface Feature {
  FeatureID: number;
  FeatureName: string;
  Description: string;
  FeatureType: string;
}

interface OrgFeature {
  featureID: number;
  isActive: boolean;
}

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
}

const OrganizationFeatures: React.FC = () => {
  const [organizations, setOrganizations] = useState<
    { value: number; label: string }[]
  >([]);
  const [selectedOrg, setSelectedOrg] = useState<{ value: number; label: string } | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [orgFeatures, setOrgFeatures] = useState<OrgFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Load organizations
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const apiData = await getOrganizations();
        const normalized = apiData.map((org: Organization) => ({
          value: org.OrganizationID,
          label: org.OrganizationName,
        }));
        setOrganizations(normalized);
      } catch (error) {
        console.error("Failed to load organizations", error);
      }
    };
    loadOrgs();
  }, []);

  // Load features by organization
  const loadFeatures = async (organizationID: number) => {
    if (!organizationID) return;
    setLoading(true);

    const allFeatures = await GetAllFeaturesAsync();
    const assignedFeatures = await GetFeaturesByOrgAsync(organizationID);

    const normalizedAssigned = assignedFeatures.map((f: any) => ({
      featureID: Number(f.featureID ?? f.FeatureID),
      isActive: Boolean(f.isActive ?? f.IsActive),
    }));

    setFeatures(allFeatures);
    setOrgFeatures(normalizedAssigned);
    setLoading(false);
  };

  const handleToggle = async (featureID: number, isActive: boolean) => {
    if (!selectedOrg) return;
    setUpdating(featureID);

    await UpdateOrgFeatureAsync({
      organizationID: selectedOrg.value,
      featureID,
      isActive,
    });

    await loadFeatures(selectedOrg.value);

    setSuccessMessage("Feature updated successfully!");
    setTimeout(() => setSuccessMessage(""), 2000);
    setUpdating(null);
  };

  const isFeatureActive = (featureID: number): boolean => {
    return orgFeatures.some(
      (f) => Number(f.featureID) === Number(featureID) && f.isActive === true
    );
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Assign Features</h2>

      {/* Searchable Organization Selector */}
      <div className="mb-4">
        <Select
          options={organizations}
          value={selectedOrg}
          onChange={(org) => {
            setSelectedOrg(org);
            if (org) loadFeatures(org.value);
          }}
          placeholder="-- Select Organization --"
          isClearable
        />
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && selectedOrg && (
        <>
          {successMessage && (
            <Alert variant="success" className="py-2">
              {successMessage}
            </Alert>
          )}

          <div className="row">
            {features.map((feature) => {
              const active = isFeatureActive(feature.FeatureID);

              return (
                <div key={feature.FeatureID} className="col-lg-4 col-md-6 mb-4">
                  <div
                    className="shadow-sm rounded-4 p-3 h-100"
                    style={{
                      backgroundColor: active ? "#eef7ff" : "#ffffff",
                      border: active
                        ? "2px solid #0d6efd"
                        : "1px solid #dddddd",
                      transition: "0.3s",
                    }}
                  >
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "45px",
                          height: "45px",
                          fontSize: "1.2rem",
                        }}
                      >
                        <i className="bi bi-puzzle-fill"></i>
                      </div>

                      <div>
                        <h5 className="mb-0 fw-semibold">
                          {feature.FeatureName}
                        </h5>
                        <small className="text-muted">
                          {feature.FeatureType}
                        </small>
                      </div>

                      {active && (
                        <span className="badge bg-success ms-auto">Active</span>
                      )}
                    </div>

                    <p className="text-muted small mb-3">{feature.Description}</p>

                    {/* Toggle Section */}
                    <div
                      className="d-flex justify-content-between align-items-center p-2 rounded"
                      style={{
                        backgroundColor: active ? "#d1e7dd" : "#f8f9fa",
                        border: "1px solid #ccc",
                      }}
                    >
                      <span className="fw-semibold">
                        {active ? "Feature Enabled" : "Enable Feature"}
                      </span>

                      <Form.Check
                        type="switch"
                        id={`switch-${feature.FeatureID}`}
                        checked={active}
                        disabled={updating === feature.FeatureID}
                        onChange={(e) =>
                          handleToggle(feature.FeatureID, e.target.checked)
                        }
                      />

                      {updating === feature.FeatureID && (
                        <Spinner size="sm" animation="border" className="ms-2" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Container>
  );
};

export default OrganizationFeatures;
