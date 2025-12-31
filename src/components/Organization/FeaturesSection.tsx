import React, { useEffect, useState } from "react";
import { ListGroup, Form, InputGroup, FormControl, Accordion } from "react-bootstrap";

interface Feature {
  FeatureID: number;
  FeatureName: string;
  Description: string;
  GroupName: string;   // GROUPING FEATURE
}

interface OrgFeature {
  OrgFeatureID: number;
  OrganizationID: number;
  FeatureID: number;
  IsActive: boolean;
}

const FeaturesSection: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [orgFeaturesMap, setOrgFeaturesMap] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");

  // ------------------------------------------------------------------
  // SAMPLE DATA (You can replace with API calls later)
  // ------------------------------------------------------------------
  const sampleFeatures: Feature[] = [
    {
      FeatureID: 1,
      FeatureName: "Attendance Tracking",
      Description: "Manage and monitor daily attendance.",
      GroupName: "HR"
    },
    {
      FeatureID: 2,
      FeatureName: "Leave Management",
      Description: "Handle employee leaves and approvals.",
      GroupName: "HR"
    },
    {
      FeatureID: 3,
      FeatureName: "Payroll Processing",
      Description: "Generate and process monthly payroll.",
      GroupName: "HR"
    },
    {
      FeatureID: 4,
      FeatureName: "Invoice Generation",
      Description: "Automatically generate and manage invoices.",
      GroupName: "Billing"
    },
    {
      FeatureID: 5,
      FeatureName: "Payment Gateway Integration",
      Description: "Accept & process payments securely.",
      GroupName: "Billing"
    },
    {
      FeatureID: 6,
      FeatureName: "Two-Factor Authentication",
      Description: "Enhanced security for user login.",
      GroupName: "Security"
    },
    {
      FeatureID: 7,
      FeatureName: "Role Based Access Control",
      Description: "Assign roles & permissions to users.",
      GroupName: "Security"
    }
  ];

  const sampleOrgFeatures: OrgFeature[] = [
    { OrgFeatureID: 1, OrganizationID: 1, FeatureID: 1, IsActive: true },
    { OrgFeatureID: 2, OrganizationID: 1, FeatureID: 4, IsActive: true },
    { OrgFeatureID: 3, OrganizationID: 1, FeatureID: 6, IsActive: false }
  ];

  // ------------------------------------------------------------------
  // Load sample data on startup
  // ------------------------------------------------------------------
  useEffect(() => {
    setFeatures(sampleFeatures);

    const map: Record<number, boolean> = {};
    sampleOrgFeatures.forEach((item) => {
      map[item.FeatureID] = item.IsActive;
    });

    setOrgFeaturesMap(map);
  }, []);

  // ------------------------------------------------------------------
  // Toggle feature ON/OFF
  // ------------------------------------------------------------------
  const toggleFeature = (featureId: number, isActive: boolean) => {
    setOrgFeaturesMap((prev) => ({
      ...prev,
      [featureId]: isActive,
    }));

    console.log(
      `UPDATED → FeatureID ${featureId} : IsActive = ${isActive}`
    );
  };

  // ------------------------------------------------------------------
  // GROUP FEATURES
  // ------------------------------------------------------------------
  const groupedFeatures = features.reduce((groups: any, feature) => {
    if (!groups[feature.GroupName]) groups[feature.GroupName] = [];
    groups[feature.GroupName].push(feature);
    return groups;
  }, {});

  return (
    <div className="container mt-4">
      {/* SEARCH BAR */}
      <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
        <FormControl
          placeholder="Search features..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* GROUPED FEATURES */}
      <Accordion defaultActiveKey="0">
        {Object.keys(groupedFeatures).map((groupName, idx) => {
          const groupList = groupedFeatures[groupName].filter((f: Feature) =>
            (f.FeatureName + f.Description)
              .toLowerCase()
              .includes(search.toLowerCase())
          );

          if (groupList.length === 0) return null;

          return (
            <Accordion.Item eventKey={idx.toString()} key={idx}>
              <Accordion.Header>
                <strong>{groupName}</strong>
              </Accordion.Header>

              <Accordion.Body>
                <ListGroup>
                  {groupList.map((feature: Feature) => (
                    <ListGroup.Item
                      key={feature.FeatureID}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{feature.FeatureName}</strong>
                        <div className="text-muted small">{feature.Description}</div>
                      </div>

                      {/* SWITCH */}
                      <Form.Check
                        type="switch"
                        checked={orgFeaturesMap[feature.FeatureID] || false}
                        onChange={(e) =>
                          toggleFeature(
                            feature.FeatureID,
                            e.target.checked
                          )
                        }
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};

export default FeaturesSection;
