import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Badge } from "react-bootstrap";
import { toast } from "react-toastify";

// ================= TYPES =================

interface SettingType {
  SettingTypeID: number;
  SettingKey: string;
  Description: string;
  DataType: string;
  DefaultValue: string;
}

// ================= STATIC DATA =================

const settingTypes: SettingType[] = [
  // Attendance Mode
  {
    SettingTypeID: 1,
    SettingKey: "ATT_CALC_MODE",
    Description: "Attendance Calculation Mode (1=FirstInLastOut, 2=FixedShift, 3=Duration)",
    DataType: "INT",
    DefaultValue: "3",
  },

  // Check-in/out
  {
    SettingTypeID: 2,
    SettingKey: "REQUIRE_CHECKIN",
    Description: "Check-in is mandatory",
    DataType: "BIT",
    DefaultValue: "1",
  },
  {
    SettingTypeID: 3,
    SettingKey: "REQUIRE_CHECKOUT",
    Description: "Check-out is mandatory",
    DataType: "BIT",
    DefaultValue: "1",
  },

  // Working Hours
  {
    SettingTypeID: 4,
    SettingKey: "STANDARD_DAILY_HOURS",
    Description: "Standard working hours per day",
    DataType: "DECIMAL",
    DefaultValue: "8",
  },
  {
    SettingTypeID: 5,
    SettingKey: "MIN_HOURS_HALF_DAY",
    Description: "Minimum hours required for half day",
    DataType: "DECIMAL",
    DefaultValue: "4",
  },

  // Late rules
  {
    SettingTypeID: 6,
    SettingKey: "LATE_GRACE_MINUTES",
    Description: "Grace time allowed before marking late",
    DataType: "INT",
    DefaultValue: "10",
  },
  {
    SettingTypeID: 7,
    SettingKey: "EARLY_EXIT_GRACE_MINUTES",
    Description: "Grace time allowed for early exit",
    DataType: "INT",
    DefaultValue: "10",
  },

  // Overtime
  {
    SettingTypeID: 8,
    SettingKey: "OVERTIME_ENABLED",
    Description: "Enable overtime calculation",
    DataType: "BIT",
    DefaultValue: "1",
  },
  {
    SettingTypeID: 9,
    SettingKey: "OVERTIME_MULTIPLIER",
    Description: "Overtime multiplier (e.g. 1.5x)",
    DataType: "DECIMAL",
    DefaultValue: "1.5",
  },

  // Break
  {
    SettingTypeID: 10,
    SettingKey: "BREAK_DURATION",
    Description: "Default break duration in minutes",
    DataType: "INT",
    DefaultValue: "60",
  },

  // Advanced
  {
    SettingTypeID: 11,
    SettingKey: "GEOFENCE_ENABLED",
    Description: "Enable location-based attendance",
    DataType: "BIT",
    DefaultValue: "0",
  },
];

// ================= GROUPING =================

const getGroup = (key: string) => {
  if (key.includes("ATT_CALC") || key.includes("CHECK")) return "Attendance Rules";
  if (key.includes("STANDARD") || key.includes("MIN_HOURS")) return "Working Hours";
  if (key.includes("LATE") || key.includes("EARLY")) return "Late / Early Rules";
  if (key.includes("OVERTIME")) return "Overtime Rules";
  if (key.includes("BREAK")) return "Break Rules";
  if (key.includes("GEO")) return "Advanced";
  return "General";
};

// ================= COMPONENT =================

const AttendanceSettings: React.FC = () => {
  const [values, setValues] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);

  // ================= HANDLE CHANGE =================

  const handleChange = (id: number, value: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // ================= SAVE (STATIC) =================

  const handleSave = () => {
    console.log("Saved Settings:", values);
    toast.success("Settings saved successfully (mock)");
  };

  // ================= FILTER =================

  const filtered = settingTypes.filter((s) =>
    s.SettingKey.toLowerCase().includes(search.toLowerCase())
  );

  // ================= GROUP =================

  const grouped: Record<string, SettingType[]> = {};

  filtered.forEach((s) => {
    const group = getGroup(s.SettingKey);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(s);
  });

  // ================= RENDER INPUT =================

  const renderInput = (setting: SettingType) => {
    const value = values[setting.SettingTypeID] ?? setting.DefaultValue;

    switch (setting.DataType) {
      case "BIT":
        return (
          <Form.Check
            type="switch"
            checked={value === "1"}
            onChange={(e) =>
              handleChange(setting.SettingTypeID, e.target.checked ? "1" : "0")
            }
          />
        );

      case "INT":
      case "DECIMAL":
        return (
          <Form.Control
            type="number"
            value={value}
            onChange={(e) => handleChange(setting.SettingTypeID, e.target.value)}
          />
        );

      default:
        return (
          <Form.Control
            type="text"
            value={value}
            onChange={(e) => handleChange(setting.SettingTypeID, e.target.value)}
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
            onChange={(e) => setShowModifiedOnly(e.target.checked)}
          />
        </Col>

        <Col className="text-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </Col>
      </Row>

      {/* SETTINGS GRID */}
      <Row>
        {Object.keys(grouped).map((group) => (
          <Col md={6} key={group} className="mb-4">
            <Card>
              <Card.Header>
                <strong>{group}</strong>
              </Card.Header>

              <Card.Body>
                {grouped[group].map((setting) => {
                  const val = values[setting.SettingTypeID];

                  if (showModifiedOnly && !val) return null;

                  return (
                    <div key={setting.SettingTypeID} className="mb-3">
                      <Form.Label>
                        {setting.SettingKey}{" "}
                        <Badge bg="secondary">{setting.DataType}</Badge>
                      </Form.Label>

                      {renderInput(setting)}

                      <div className="text-muted small">
                        {setting.Description}
                      </div>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AttendanceSettings;