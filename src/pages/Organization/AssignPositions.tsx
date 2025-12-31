import React, { useState } from 'react';
import { Container, Card, Form, Table, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';

/* ================= STATIC DATA ================= */

const positions = [
  { PositionID: 1, PositionName: 'CEO', Description: 'Chief Executive Officer' },
  { PositionID: 2, PositionName: 'Manager', Description: 'Responsible for managing teams' },
  { PositionID: 3, PositionName: 'Developer', Description: 'Software Developer' },
  { PositionID: 4, PositionName: 'Designer', Description: 'Designs and creates UI/UX' },
  { PositionID: 5, PositionName: 'HR', Description: 'Human Resources' },
  { PositionID: 6, PositionName: 'Sales', Description: 'Sales and Marketing' },
  { PositionID: 7, PositionName: 'Support', Description: 'Customer Support' },
  { PositionID: 8, PositionName: 'Intern', Description: 'Internship role' },
];

const organizations = [
  { OrganizationID: 1, OrganizationName: 'Organization A' },
  { OrganizationID: 2, OrganizationName: 'Organization B' },
  { OrganizationID: 3, OrganizationName: 'Organization C' },
  { OrganizationID: 4, OrganizationName: 'Organization D' },
  { OrganizationID: 5, OrganizationName: 'Organization E' },
];

/* ================= TYPES ================= */

interface OrganizationPosition {
  OrganizationID: number;
  assignedPositions: number[];
}

interface SelectOption {
  value: number;
  label: string;
}

/* ================= COMPONENT ================= */

const AssignPositions: React.FC = () => {
  const [selectedOrgID, setSelectedOrgID] = useState<number | null>(null);
  const [organizationPositions, setOrganizationPositions] = useState<OrganizationPosition[]>(
    organizations.map(org => ({ OrganizationID: org.OrganizationID, assignedPositions: [] }))
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePositionToggle = (positionID: number) => {
    if (selectedOrgID === null) return;
    setOrganizationPositions(prev =>
      prev.map(org => {
        if (org.OrganizationID === selectedOrgID) {
          const updatedPositions = org.assignedPositions.includes(positionID)
            ? org.assignedPositions.filter(p => p !== positionID)
            : [...org.assignedPositions, positionID];
          return { ...org, assignedPositions: updatedPositions };
        }
        return org;
      })
    );
  };

  const handleSave = () => {
    console.log('Assigned Positions:', organizationPositions);
    setSuccessMessage('Positions assigned successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const selectedOrg = organizations.find(org => org.OrganizationID === selectedOrgID);
  const assignedPositions = selectedOrgID
    ? organizationPositions.find(r => r.OrganizationID === selectedOrgID)?.assignedPositions || []
    : [];

  const orgOptions: SelectOption[] = organizations.map(org => ({
    value: org.OrganizationID,
    label: org.OrganizationName,
  }));

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Manage Positions for Organization</h3>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Card className="p-3 mb-4">
        <Form.Group>
          <Form.Label>Select Organization</Form.Label>
          <Select
            options={orgOptions}
            onChange={option => setSelectedOrgID(option ? option.value : null)}
            placeholder="Search and select organization..."
            isClearable
          />
        </Form.Group>
      </Card>

      {selectedOrgID && (
        <Card className="p-3">
          <h5>Positions for {selectedOrg?.OrganizationName}</h5>
          <Table striped bordered hover responsive className="mt-3 align-middle">
            <thead className="table-primary">
              <tr>
                <th>Position Name</th>
                <th>Description</th>
                <th className="text-center">Assign</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(position => (
                <tr key={position.PositionID}>
                  <td>{position.PositionName}</td>
                  <td>{position.Description}</td>
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      id={`position-switch-${position.PositionID}`}
                      checked={assignedPositions.includes(position.PositionID)}
                      onChange={() => handlePositionToggle(position.PositionID)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-end mt-3">
            <Button variant="success" onClick={handleSave}>
              Save Positions
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default AssignPositions;
