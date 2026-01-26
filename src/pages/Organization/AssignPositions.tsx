import React, { useState, useMemo } from 'react';
import {
  Container,
  Card,
  Form,
  Table,
  Button,
  Alert,
  Accordion,
  Badge,
  Row,
  Col,
} from 'react-bootstrap';
import Select from 'react-select';

/* ================= STATIC DATA ================= */

const positions = [
  { PositionID: 1, PositionName: 'CEO', Description: 'Chief Executive Officer', Role: 'Leadership' },
  { PositionID: 2, PositionName: 'Manager', Description: 'Responsible for managing teams', Role: 'Management' },
  { PositionID: 3, PositionName: 'Developer', Description: 'Software Developer', Role: 'Technical' },
  { PositionID: 4, PositionName: 'Designer', Description: 'Designs and creates UI/UX', Role: 'Technical' },
  { PositionID: 5, PositionName: 'HR', Description: 'Human Resources', Role: 'Administration' },
  { PositionID: 6, PositionName: 'Sales', Description: 'Sales and Marketing', Role: 'Business' },
  { PositionID: 7, PositionName: 'Support', Description: 'Customer Support', Role: 'Operations' },
  { PositionID: 8, PositionName: 'Intern', Description: 'Internship role', Role: 'General' },
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
    organizations.map(org => ({
      OrganizationID: org.OrganizationID,
      assignedPositions: [],
    }))
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  /* ================= DATA ================= */

  const selectedOrg = organizations.find(o => o.OrganizationID === selectedOrgID);

  const assignedPositions =
    selectedOrgID !== null
      ? organizationPositions.find(o => o.OrganizationID === selectedOrgID)?.assignedPositions || []
      : [];

  const orgOptions: SelectOption[] = organizations.map(org => ({
    value: org.OrganizationID,
    label: org.OrganizationName,
  }));

  /* ================= GROUP BY ROLE ================= */

  const groupedPositions = useMemo(() => {
    return positions.reduce<Record<string, typeof positions>>((acc, pos) => {
      acc[pos.Role] = acc[pos.Role] || [];
      acc[pos.Role].push(pos);
      return acc;
    }, {});
  }, []);

  /* ================= HANDLERS ================= */

  const handlePositionToggle = (positionID: number) => {
    if (selectedOrgID === null) return;

    setOrganizationPositions(prev =>
      prev.map(org =>
        org.OrganizationID === selectedOrgID
          ? {
              ...org,
              assignedPositions: org.assignedPositions.includes(positionID)
                ? org.assignedPositions.filter(p => p !== positionID)
                : [...org.assignedPositions, positionID],
            }
          : org
      )
    );
    setIsDirty(true);
  };

  const handleSelectAllByRole = (role: string) => {
    if (selectedOrgID === null) return;

    const rolePositionIDs = groupedPositions[role].map(p => p.PositionID);

    setOrganizationPositions(prev =>
      prev.map(org =>
        org.OrganizationID === selectedOrgID
          ? {
              ...org,
              assignedPositions: Array.from(
                new Set([...org.assignedPositions, ...rolePositionIDs])
              ),
            }
          : org
      )
    );
    setIsDirty(true);
  };

  const handleUnselectAllByRole = (role: string) => {
    if (selectedOrgID === null) return;

    const rolePositionIDs = groupedPositions[role].map(p => p.PositionID);

    setOrganizationPositions(prev =>
      prev.map(org =>
        org.OrganizationID === selectedOrgID
          ? {
              ...org,
              assignedPositions: org.assignedPositions.filter(
                p => !rolePositionIDs.includes(p)
              ),
            }
          : org
      )
    );
    setIsDirty(true);
  };

  const handleSave = () => {
    console.log('Assigned Positions:', organizationPositions);
    setSuccessMessage('Positions assigned successfully!');
    setIsDirty(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /* ================= RENDER ================= */

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

      {!selectedOrgID && (
        <Alert variant="info">Please select an organization to manage positions.</Alert>
      )}

      {selectedOrgID && (
        <Card className="p-3">
          <h5 className="mb-3">
            Positions for <strong>{selectedOrg?.OrganizationName}</strong>
          </h5>

          <Accordion alwaysOpen>
            {Object.entries(groupedPositions).map(([role, rolePositions], index) => {
              const assignedCount = rolePositions.filter(p =>
                assignedPositions.includes(p.PositionID)
              ).length;

              return (
                <Accordion.Item eventKey={index.toString()} key={role}>
                  <Accordion.Header>
                    <span className="fw-semibold">{role}</span>
                    <Badge bg="secondary" className="ms-2">
                      {assignedCount} / {rolePositions.length}
                    </Badge>
                  </Accordion.Header>

                  <Accordion.Body>
                    <Row className="mb-2">
                      <Col className="text-end">
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() => handleSelectAllByRole(role)}
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleUnselectAllByRole(role)}
                        >
                          Unselect All
                        </Button>
                      </Col>
                    </Row>

                    <Table striped bordered hover responsive className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Position Name</th>
                          <th>Description</th>
                          <th className="text-center">Assign</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rolePositions.map(position => (
                          <tr key={position.PositionID}>
                            <td>{position.PositionName}</td>
                            <td>{position.Description}</td>
                            <td className="text-center">
                              <Form.Check
                                type="switch"
                                checked={assignedPositions.includes(position.PositionID)}
                                onChange={() =>
                                  handlePositionToggle(position.PositionID)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>

          <div className="text-end mt-3">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default AssignPositions;
