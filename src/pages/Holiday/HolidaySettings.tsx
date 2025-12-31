import React, { useEffect, useState } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";

interface SettingType {
  holidaySettingTypeID: number;
  settingKey: string;
  description: string;
  dataType: string;
  defaultValue: string;
  isActive: boolean;
}

const HolidaySettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingType[]>([]);

  // Mock Load (Replace with API)
  useEffect(() => {
    setSettings([
      { holidaySettingTypeID: 1, settingKey: "TotalHolidays", description: "Total number of holidays in a year", dataType: "Integer", defaultValue: "12", isActive: true },
      { holidaySettingTypeID: 2, settingKey: "OptionalHolidays", description: "Number of optional holidays", dataType: "Integer", defaultValue: "2", isActive: true },
      { holidaySettingTypeID: 3, settingKey: "NormalHolidays", description: "Number of normal holidays", dataType: "Integer", defaultValue: "10", isActive: true },
      { holidaySettingTypeID: 4, settingKey: "HolidayCarryForward", description: "Carry forward unused holidays", dataType: "Boolean", defaultValue: "False", isActive: true },
      { holidaySettingTypeID: 5, settingKey: "MaxHolidayAccrual", description: "Maximum number of holidays a user can accumulate", dataType: "Integer", defaultValue: "15", isActive: true },
      { holidaySettingTypeID: 6, settingKey: "SpecialHolidays", description: "Number of special (extra) holidays", dataType: "Integer", defaultValue: "1", isActive: true },
      { holidaySettingTypeID: 7, settingKey: "HolidayEligibility", description: "Eligibility for holiday entitlement", dataType: "Boolean", defaultValue: "True", isActive: true }
    ]);
  }, []);

  const updateField = (index: number, field: string, value: any) => {
    const copy = [...settings];
    (copy[index] as any)[field] = value;
    setSettings(copy);
  };

  const saveAll = () => {
    console.log("Saving settings:", settings);
    alert("Settings saved!");
    // Call API here
  };

  return (    
    <Card className="p-4 mt-5 shadow">
      <h3 className="mb-4">Holiday Setting Types</h3>

      {settings.map((s, index) => (
        <Card key={s.holidaySettingTypeID} className="p-3 mb-3 border">
          <Row className="mb-2">
            <Col md={6}>
              <strong>HolidaySettingTypeID:</strong> {s.holidaySettingTypeID}
            </Col>
            <Col md={6}>
              <strong>SettingKey:</strong> {s.settingKey}
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={12}>
              <strong>Description:</strong> {s.description}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>DataType:</strong> {s.dataType}
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Default Value</Form.Label>
                <Form.Control
                  value={s.defaultValue}
                  onChange={(e) => updateField(index, "defaultValue", e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4} className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={s.isActive}
                onChange={(e) => updateField(index, "isActive", e.target.checked)}
                className="mt-4"
              />
            </Col>
          </Row>
        </Card>
      ))}

      <div className="text-end">
        <Button size="lg" onClick={saveAll}>
          Save All Settings
        </Button>
      </div>
    </Card>
  );
};

export default HolidaySettings;