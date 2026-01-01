import React, { useEffect, useState } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import holidayService from "../../services/holidayService";

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await holidayService.getOrgDetailsAsync(1);

      // API returns { Table: [...] }
      const mappedData: SettingType[] = response.Table.map((item: any) => ({
        holidaySettingTypeID: item.HolidaySettingTypeID,
        settingKey: item.SettingKey,
        description: item.Description,
        dataType: item.DataType,
        defaultValue: item.DefaultValue,
        isActive: item.IsActive
      }));

      setSettings(mappedData);
    } catch (error) {
      console.error("Failed to load holiday settings", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (index: number, field: keyof SettingType, value: any) => {
    const copy = [...settings];
    copy[index] = { ...copy[index], [field]: value };
    setSettings(copy);
  };

  const saveSingle = (setting: SettingType) => {
    console.log("Saving single setting:", setting);
    alert(`Saved setting: ${setting.settingKey}`);

    // TODO: Call update API here
    // holidayService.updateHolidaySetting(setting)
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="p-4 mt-5 shadow">
      <h3 className="mb-4">Holiday Setting Types</h3>

      {settings.map((s, index) => (
        <Card key={s.holidaySettingTypeID} className="p-3 mb-3 border">
          <Row className="mb-2">
            <Col md={6}>
              <strong>ID:</strong> {s.holidaySettingTypeID}
            </Col>
            <Col md={6}>
              <strong>Key:</strong> {s.settingKey}
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <strong>Description:</strong> {s.description}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Data Type:</strong> {s.dataType}
            </Col>
          </Row>

          <Row className="align-items-end">
            <Col md={5}>
              <Form.Group>
                <Form.Label>Default Value</Form.Label>
                <Form.Control
                  value={s.defaultValue}
                  onChange={(e) =>
                    updateField(index, "defaultValue", e.target.value)
                  }
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={s.isActive}
                onChange={(e) =>
                  updateField(index, "isActive", e.target.checked)
                }
                className="mt-4"
              />
            </Col>

            <Col md={3} className="text-end">
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => saveSingle(s)}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Card>
      ))}
    </Card>
  );
};

export default HolidaySettings;
