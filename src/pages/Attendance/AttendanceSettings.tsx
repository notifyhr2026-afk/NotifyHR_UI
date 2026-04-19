import React, { useEffect, useState } from "react";
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
} from "react-bootstrap";
import { toast } from "react-toastify";
import attendanceSettingService from "../../services/attendanceSettingService";
import LoggedInUser from "../../types/LoggedInUser";

// ================= TYPES =================

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

// ================= COMPONENT =================

const AttendanceSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingType[]>([]);
  const [values, setValues] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);

  const userString = localStorage.getItem("user");
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID = user?.organizationID ?? 0;

  // ================= LOAD =================

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

      const active = res.filter((s: SettingType) => s.IsActive);
      setSettings(active);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE CHANGE =================

  const handleChange = (id: number, value: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // ================= FILTER =================

  const filtered = settings.filter((s) =>
    s.SettingKey.toLowerCase().includes(search.toLowerCase())
  );

  // ================= GROUP =================

  const grouped: Record<string, SettingType[]> = {};

  filtered.forEach((s) => {
    const group = s.GroupName || "General";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(s);
  });

  // ================= SORT =================

  Object.keys(grouped).forEach((group) => {
    grouped[group].sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  });

  // ================= SAVE API =================

  const handleSaveGroup = async (groupName: string) => {
    try {
      setSavingGroup(groupName);

      const groupSettings = grouped[groupName];

      const payload = groupSettings
        .map((s) => {
          const current =
            values[s.SettingTypeID] ?? s.Value ?? "";

          const isModified =
            current !== (s.Value ?? "");

          if (!isModified) return null;

          return {
            OrgAttendanceSettingID:
              s.OrgAttendanceSettingID ?? 0,

            SettingTypeID: s.SettingTypeID,

            Value: current,
          };
        })
        .filter(Boolean);

      if (payload.length === 0) {
        toast.info("No changes to save");
        return;
      }

      // ================= FINAL API PAYLOAD =================

      const apiPayload = {
        organizationID: organizationID,
        jsonData: JSON.stringify(payload),
        createdBy: "Admin",
      };

      console.log("Final API Payload:", apiPayload);

      const res =
        await attendanceSettingService.PostOrgAttendanceSettingsByAsync(
          apiPayload
        );

      if (res?.success !== false) {
        toast.success(`${groupName} saved successfully`);
        loadSettings(); // refresh after save
      } else {
        toast.error(res?.message || "Save failed");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSavingGroup(null);
    }
  };

  // ================= INPUT =================

  const renderInput = (setting: SettingType) => {
    const value =
      values[setting.SettingTypeID] ??
      setting.Value ??
      "";

    switch (setting.DataType) {
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
              handleChange(setting.SettingTypeID, e.target.value)
            }
          />
        );

      case "TIME":
        return (
          <Form.Control
            type="time"
            value={value}
            onChange={(e) =>
              handleChange(setting.SettingTypeID, e.target.value)
            }
          />
        );

      default:
        return (
          <Form.Control
            type="text"
            value={value}
            onChange={(e) =>
              handleChange(setting.SettingTypeID, e.target.value)
            }
          />
        );
    }
  };

  // ================= UI =================

  return (
    <Container fluid className="p-4">
      <h3>Attendance Configuration Center</h3>

      {/* TOP BAR */}
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <Form.Control
            placeholder="Search settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col md={4}>
          <Form.Check
            type="switch"
            label="Show Only Modified"
            checked={showModifiedOnly}
            onChange={(e) =>
              setShowModifiedOnly(e.target.checked)
            }
          />
        </Col>
      </Row>

      {/* LOADING */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Accordion defaultActiveKey="0">
          {Object.keys(grouped).map((group, index) => (
            <Accordion.Item eventKey={String(index)} key={group}>
              <Accordion.Header>
                <strong>{group}</strong>
              </Accordion.Header>

              <Accordion.Body>
                <Row className="g-3">
                  {grouped[group].map((setting) => {
                    const val =
                      values[setting.SettingTypeID];

                    const current =
                      val ?? setting.Value ?? "";

                    const isModified =
                      current !== (setting.Value ?? "");

                    if (showModifiedOnly && !isModified)
                      return null;

                    return (
                      <Col md={6} key={setting.SettingTypeID}>
                        <Card className="shadow-sm h-100">
                          <Card.Body>
                            <Form.Label>
                              <strong>
                                {setting.SettingKey}
                              </strong>{" "}
                              <Badge bg="secondary">
                                {setting.DataType}
                              </Badge>{" "}
                              {isModified && (
                                <Badge bg="warning" text="dark">
                                  Modified
                                </Badge>
                              )}
                              {setting.IsOverridden === 1 && (
                                <Badge bg="info">
                                  Override
                                </Badge>
                              )}
                            </Form.Label>

                            {renderInput(setting)}

                            <div className="text-muted small mt-1">
                              {setting.Description}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>

                {/* SAVE BUTTON */}
                <div className="text-end mt-3">
                  <Button
                    onClick={() =>
                      handleSaveGroup(group)
                    }
                    disabled={savingGroup === group}
                  >
                    {savingGroup === group
                      ? "Saving..."
                      : `Save ${group}`}
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
};

export default AttendanceSettings;