import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Row,
  Col,
  Button,
  Spinner,
  Badge,
  Alert,
} from "react-bootstrap";
import holidayService from "../../services/holidayService";
import { fireAudit } from "../../utils/auditUtils";

interface SettingType {
  orgHolidaySettingID: number;
  holidaySettingTypeID: number;
  settingKey: string;
  description: string;
  dataType: string;
  SettingValue: string;
  isActive: boolean;
  IsOrgValueExists: boolean;
}

const HolidaySettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number = user?.organizationID;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await holidayService.getOrgHolidaySettingAsync(
        organizationID
      );

      const mappedData: SettingType[] = response.Table.map((item: any) => ({
        orgHolidaySettingID: Number(item.OrgHolidaySettingID || 0),
        holidaySettingTypeID: item.HolidaySettingTypeID,
        settingKey: item.SettingKey,
        description: item.Description,
        dataType: item.DataType,
        SettingValue: item.SettingValue ?? "",
        isActive: item.IsActive,
        IsOrgValueExists: Number(item.IsOrgValueExists) === 1,
      }));

      setSettings(mappedData);
    } catch (error) {
      console.error("Failed to load holiday settings", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    index: number,
    field: keyof SettingType,
    value: any
  ) => {
    const copy = [...settings];
    copy[index] = { ...copy[index], [field]: value };
    setSettings(copy);
  };

  const saveSingle = async (
    setting: SettingType,
    index: number
  ) => {
    try {
      setSavingIndex(index);

      const payload = {
        OrgHolidaySettingID: setting.orgHolidaySettingID,
        OrganizationID: organizationID,
        HolidaySettingTypeID: setting.holidaySettingTypeID,
        Year: new Date().getFullYear(),
        Value: setting.SettingValue,
        CreatedBy: user?.userName || "system",
        IsActive: setting.isActive,
      };

      await holidayService.saveOrgHolidaySettingAsync(payload);

      fireAudit(
        "UPDATE",
        "HolidaySetting",
        setting,
        payload,
        organizationID,
        user?.userName || "system",
        "HolidaySettings"
      );

      await loadSettings();
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setSavingIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2">Loading holiday settings...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Holiday Settings</h4>
        </Card.Header>

        <Card.Body>
          <Alert variant="info">
            Configure organization-specific holiday settings. Settings with a
            green background are already configured for your organization.
          </Alert>

          {settings.map((s, index) => {
            const isConfigured =
              s.orgHolidaySettingID > 0 || s.IsOrgValueExists;

            return (
              <Card
                key={s.holidaySettingTypeID}
                className="mb-4 shadow-sm border-0"
              >
                <Card.Body
                  style={{
                    backgroundColor: isConfigured
                      ? "#e8f5e9"
                      : "#fff8e1",
                    borderLeft: isConfigured
                      ? "6px solid #28a745"
                      : "6px solid #ffc107",
                    borderRadius: "8px",
                  }}
                >
                  <Row className="mb-3 align-items-center">
                    <Col md={8}>
                      <h5 className="mb-1">{s.settingKey}</h5>
                      <small className="text-muted">
                        {s.description}
                      </small>
                    </Col>

                    <Col md={4} className="text-md-end mt-2 mt-md-0">
                      <Badge
                        bg={isConfigured ? "success" : "warning"}
                        text={isConfigured ? "white" : "dark"}
                      >
                        {isConfigured
                          ? "Configured"
                          : "Default Value"}
                      </Badge>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={4}>
                      <strong>Setting ID</strong>
                      <div>{s.holidaySettingTypeID}</div>
                    </Col>

                    <Col md={4}>
                      <strong>Data Type</strong>
                      <div>{s.dataType}</div>
                    </Col>

                    <Col md={4}>
                      <strong>Org Setting ID</strong>
                      <div>{s.orgHolidaySettingID}</div>
                    </Col>
                  </Row>

                  <Row className="align-items-end">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>Value</Form.Label>

                        {s.dataType.toLowerCase() === "boolean" ? (
                          <Form.Select
                            value={s.SettingValue}
                            onChange={(e) =>
                              updateField(
                                index,
                                "SettingValue",
                                e.target.value
                              )
                            }
                          >
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </Form.Select>
                        ) : (
                          <Form.Control
                            value={s.SettingValue}
                            onChange={(e) =>
                              updateField(
                                index,
                                "SettingValue",
                                e.target.value
                              )
                            }
                          />
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Check
                        type="switch"
                        id={`active-${index}`}
                        label="Active"
                        checked={s.isActive}
                        onChange={(e) =>
                          updateField(
                            index,
                            "isActive",
                            e.target.checked
                          )
                        }
                      />
                    </Col>

                    <Col md={4} className="text-md-end mt-3 mt-md-0">
                      <Button
                        variant="primary"
                        disabled={savingIndex === index}
                        onClick={() => saveSingle(s, index)}
                      >
                        {savingIndex === index ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
        </Card.Body>
      </Card>
    </div>
  );
};

export default HolidaySettings;