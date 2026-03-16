import React, { useEffect, useState } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import holidayService from "../../services/holidayService";

interface SettingType {
  orgHolidaySettingID:  number;
  holidaySettingTypeID: number;
  settingKey: string;
  description: string;
  dataType: string;
  SettingValue: string;
  isActive: boolean;
  IsOrgValueExists:boolean;
}

const HolidaySettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number  = user?.organizationID;
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await holidayService.getOrgHolidaySettingAsync(organizationID);

      // API returns { Table: [...] }
      const mappedData: SettingType[] = response.Table.map((item: any) => ({
        orgHolidaySettingID: item.OrgHolidaySettingID,
        holidaySettingTypeID: item.HolidaySettingTypeID,
        settingKey: item.SettingKey,
        description: item.Description,
        dataType: item.DataType,
        SettingValue: item.SettingValue,
        isActive: item.IsActive,
        IsOrgValueExists: item.IsOrgValueExists === 1
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

const saveSingle = async (setting: SettingType, index: number) => {
  try {
    setSavingIndex(index);

    const payload = {
      OrgHolidaySettingID: setting.orgHolidaySettingID,
      OrganizationID: organizationID,
      HolidaySettingTypeID: setting.holidaySettingTypeID,
      Year: new Date().getFullYear(),
      Value: setting.SettingValue,
      CreatedBy: user?.userName || "system",
      IsActive:setting.isActive
    };

    await holidayService.saveOrgHolidaySettingAsync(payload);

    loadSettings();
  } catch (error) {
    console.error("Save failed", error);
  } finally {
    setSavingIndex(null);
  }
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
  <Card
    key={s.holidaySettingTypeID}
    className="p-3 mb-3 border"
    style={{
      backgroundColor: s.IsOrgValueExists ? '#d4edda' : 'white', // green if org value exists
    }}
  >
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
          <Form.Label>Value</Form.Label>
          <Form.Control
            value={s.SettingValue}
            onChange={(e) =>
              updateField(index, "SettingValue", e.target.value)
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
  disabled={savingIndex === index}
  onClick={() => saveSingle(s,index)}
>
  {savingIndex === index ? <Spinner size="sm" /> : "Save"}
</Button>
      </Col>
    </Row>
  </Card>
))}
    </Card>
  );
};

export default HolidaySettings;
