import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Spinner,
  Accordion,
  InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import attendanceSettingService from "../../services/attendanceSettingService";
import LoggedInUser from "../../types/LoggedInUser";
import { fireAudit } from "../../utils/auditUtils";

interface SettingType {
  SettingTypeID: number;
  SettingKey: string;
  Description: string;
  DataType: string;

  Value: string | null;
  DefaultValue: string | null;

  IsActive: boolean;
  SettingGroupID: number;
  GroupName: string;
  DisplayOrder: number;
  GroupKey: string;

  OrgAttendanceSettingID: number | null;
  IsOverridden: number;
}

const AttendanceSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingType[]>([]);
  const [values, setValues] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);

  const userString = localStorage.getItem("user");
const normalizeValue = (value: any) =>
  String(value ?? "").trim();
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID = user?.organizationID ?? 0;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const res =
        await attendanceSettingService.getAttendanceSettings(
          organizationID
        );

      const active = res.filter(
        (s: SettingType) => s.IsActive
      );

      setSettings(active);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    settingId: number,
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [settingId]: value,
    }));
  };

  const filteredSettings = settings.filter((s) => {
    const matchesSearch =
      s.SettingKey
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.Description
        ?.toLowerCase()
        .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (!showModifiedOnly) return true;

    const current =
      values[s.SettingTypeID] ?? s.Value ?? "";

    return current !== (s.Value ?? "");
  });

  const grouped = useMemo(() => {
    const groups: Record<string, SettingType[]> = {};

    filteredSettings.forEach((setting) => {
      const group =
        setting.GroupName || "General";

      if (!groups[group]) {
        groups[group] = [];
      }

      groups[group].push(setting);
    });

    Object.keys(groups).forEach((group) => {
      groups[group].sort(
        (a, b) => a.DisplayOrder - b.DisplayOrder
      );
    });

    return groups;
  }, [filteredSettings]);

  const totalSettings = settings.length;

  const overriddenCount = settings.filter(
    (s) => s.IsOverridden === 1
  ).length;

  const modifiedCount = settings.filter((s) => {
    const current =
      values[s.SettingTypeID] ?? s.Value ?? "";

    return current !== (s.Value ?? "");
  }).length;

  const handleSaveGroup = async (
    groupName: string
  ) => {
    try {
      setSavingGroup(groupName);

      const groupSettings = grouped[groupName];

      const payload = groupSettings
        .map((setting) => {
          const current =
            values[setting.SettingTypeID] ??
            setting.Value ??
            "";

          const isModified =
            current !== (setting.Value ?? "");

          if (!isModified) return null;

          return {
            OrgAttendanceSettingID:
              setting.OrgAttendanceSettingID ??
              0,
            SettingTypeID:
              setting.SettingTypeID,
            Value: current,
          };
        })
        .filter(Boolean);

      if (payload.length === 0) {
        toast.info("No changes to save");
        return;
      }

      const apiPayload = {
        organizationID,
        jsonData: JSON.stringify(payload),
        createdBy: "Admin",
      };

      const response =
        await attendanceSettingService.PostOrgAttendanceSettingsByAsync(
          apiPayload
        );

      if (response?.success !== false) {
        toast.success(
          `${groupName} settings saved successfully`
        );

        fireAudit(
          "UPDATE",
          "AttendanceSetting",
          null,
          payload,
          organizationID,
          "Admin",
          "AttendanceSettings"
        );

        loadSettings();
      } else {
        toast.error(
          response?.message ||
            "Failed to save settings"
        );
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingGroup(null);
    }
  };

  const renderInput = (
    setting: SettingType
  ) => {
    const value =
      values[setting.SettingTypeID] ??
      setting.Value ??
      "";

    switch (setting.DataType?.toUpperCase()) {
      case "BIT":
        return (
          <Form.Check
            type="switch"
            checked={value === "1"}
            onChange={(e) =>
              handleChange(
                setting.SettingTypeID,
                e.target.checked ? "1" : "0"
              )
            }
          />
        );

      case "INT":
      case "DECIMAL":
        return (
          <Form.Control
            type="number"
            value={value}
            onChange={(e) =>
              handleChange(
                setting.SettingTypeID,
                e.target.value
              )
            }
          />
        );

      case "TIME":
        return (
          <Form.Control
            type="time"
            value={value}
            onChange={(e) =>
              handleChange(
                setting.SettingTypeID,
                e.target.value
              )
            }
          />
        );

      default:
        return (
          <Form.Control
            type="text"
            value={value}
            onChange={(e) =>
              handleChange(
                setting.SettingTypeID,
                e.target.value
              )
            }
          />
        );
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
          />
          <div className="mt-3">
            Loading attendance settings...
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h3 className="mb-1">
                Attendance Configuration Center
              </h3>
              <p className="text-muted mb-0">
                Manage organization attendance
                policies and settings
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Summary */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="text-muted">
                Total Settings
              </div>
              <h2>{totalSettings}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="text-muted">
                Organization Overrides
              </div>
              <h2 className="text-success">
                {overriddenCount}
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="text-muted">
                Unsaved Changes
              </div>
              <h2 className="text-warning">
                {modifiedCount}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  placeholder="Search settings..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </InputGroup>
            </Col>

            <Col md={6}>
              <Form.Check
                type="switch"
                label="Show Modified Only"
                checked={showModifiedOnly}
                onChange={(e) =>
                  setShowModifiedOnly(
                    e.target.checked
                  )
                }
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Groups */}
      <Accordion alwaysOpen>
        {Object.keys(grouped).map(
          (group, index) => (
            <Accordion.Item
              eventKey={String(index)}
              key={group}
            >
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                  <strong>{group}</strong>

                  <Badge bg="secondary">
                    {
                      grouped[group].length
                    }{" "}
                    Settings
                  </Badge>
                </div>
              </Accordion.Header>

              <Accordion.Body>
                <Row className="g-3">
                  {grouped[group].map(
                    (setting) => {
                      const current =
                        values[
                          setting
                            .SettingTypeID
                        ] ??
                        setting.Value ??
                        "";

                      const isModified =
                        current !==
                        (setting.Value ??
                          "");

                      return (
                        <Col
                          md={6}
                          lg={4}
                          key={
                            setting.SettingTypeID
                          }
                        >
                          <Card
                            className="shadow-sm h-100 border-0"
                            style={{
                              borderLeft:
                                setting.IsOverridden ===
                                1
                                  ? "5px solid #198754"
                                  : "5px solid #dee2e6",
                            }}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1">
                                    {
                                      setting.SettingKey
                                    }
                                  </h6>
                                </div>

                                <div>
                                  <Badge bg="secondary">
                                    {
                                      setting.DataType
                                    }
                                  </Badge>
                                </div>
                              </div>

                              <div className="mb-2">
                                {setting.IsOverridden ===
                                  1 && (
                                  <Badge
                                    bg="success"
                                    className="me-1"
                                  >
                                    Override
                                  </Badge>
                                )}

                                {isModified && (
                                  <Badge
                                    bg="warning"
                                    text="dark"
                                  >
                                    Modified
                                  </Badge>
                                )}
                              </div>

                              <p className="small text-muted">
                                {
                                  setting.Description
                                }
                              </p>

                              <div className="mb-3">
                                {renderInput(
                                  setting
                                )}
                              </div>

                              <small className="text-muted">
                                Default Value:
                                <strong className="ms-1">
                                  {setting.DefaultValue ??
                                    "N/A"}
                                </strong>
                              </small>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    }
                  )}
                </Row>

                <div className="text-end mt-4">
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleSaveGroup(group)
                    }
                    disabled={
                      savingGroup === group
                    }
                  >
                    {savingGroup ===
                    group ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      `Save ${group}`
                    )}
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          )
        )}
      </Accordion>
    </Container>
  );
};

export default AttendanceSettings;
