import React, { useEffect, useState } from "react";
import { Container, Table, Form, Badge, Spinner, Alert } from "react-bootstrap";
import {
  GetAllFeaturesAsync,
  GetFeaturesByOrgAsync,
  IsDisplayOrgFeatureAsync,
} from "../../services/featureService";

interface Feature {
  FeatureID: number;
  FeatureName: string;
  Description: string;
  FeatureType: string;
}

interface OrgFeature {
  featureID: number;
  isActive: boolean;
  isDisplay: boolean;
}

const OrganizationFeatures: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;

  const [features, setFeatures] = useState<Feature[]>([]);
  const [orgFeatures, setOrgFeatures] = useState<OrgFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (organizationID) {
      loadFeatures(organizationID);
    }
  }, [organizationID]);

const loadFeatures = async (orgID: number) => {
  setLoading(true);

  try {
    const allFeatures: Feature[] = await GetAllFeaturesAsync();
    const assignedFeatures = await GetFeaturesByOrgAsync(orgID);

    const activeAssigned: OrgFeature[] = assignedFeatures
      .map((f: any) => ({
        featureID: Number(f.featureID ?? f.FeatureID),
        isActive: Boolean(f.isActive ?? f.IsActive),
        isDisplay: Boolean(f.isDisplay ?? f.IsDisplay),
      }))
      .filter((f: OrgFeature) => f.isActive === true);

    const filteredFeatures: Feature[] = allFeatures.filter(
      (feature: Feature) =>
        activeAssigned.some(
          (af: OrgFeature) => af.featureID === feature.FeatureID
        )
    );

    setOrgFeatures(activeAssigned);
    setFeatures(filteredFeatures);
  } catch (error) {
    console.error("Failed to load features", error);
  }

  setLoading(false);
};


  const isFeatureDisplay = (featureID: number): boolean => {
    return orgFeatures.some(
      (f) =>
        Number(f.featureID) === Number(featureID) &&
        f.isDisplay === true
    );
  };

  const handleToggleDisplay = async (feature: Feature) => {
    if (!organizationID) return;

    const current = isFeatureDisplay(feature.FeatureID);
    const actionText = current
      ? "hide this feature from employees"
      : "show this feature to employees";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText}?`
    );
    if (!confirmed) return;

    setUpdating(feature.FeatureID);

    try {
      await IsDisplayOrgFeatureAsync({
        organizationID,
        featureID: feature.FeatureID,
        isDisplay: !current,
      });

      await loadFeatures(organizationID);

      setSuccessMessage("Feature display updated successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      console.error("Update failed", err);
    }

    setUpdating(null);
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Feature Visibility Settings</h3>

      {successMessage && (
        <Alert variant="success">{successMessage}</Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Feature</th>
              <th>Description</th>
              <th>Status</th>
              <th className="text-center">Display to Employee</th>
            </tr>
          </thead>

          <tbody>
            {features.map((feature) => {
              const isDisplayed = isFeatureDisplay(feature.FeatureID);

              return (
                <tr key={feature.FeatureID}>
                  <td className="fw-semibold">
                    {feature.FeatureName}
                  </td>

                  <td className="text-muted small">
                    {feature.Description}
                  </td>

                  <td>
                    <Badge bg={isDisplayed ? "success" : "secondary"}>
                      {isDisplayed ? "Visible" : "Hidden"}
                    </Badge>
                  </td>

                  <td className="text-center">
                    {updating === feature.FeatureID ? (
                      <Spinner size="sm" />
                    ) : (
                      <Form.Check
                        type="switch"
                        checked={isDisplayed}
                        onChange={() => handleToggleDisplay(feature)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrganizationFeatures;
