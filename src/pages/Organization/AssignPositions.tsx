import React, { useState, useMemo, useEffect } from 'react';
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
  Spinner,
} from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { getOrganizations } from '../../services/organizationService';

/* ================= STATIC POSITIONS ================= */

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

/* ================= TYPES ================= */

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
}

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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationPositions, setOrganizationPositions] = useState<OrganizationPosition[]>([]);
  const [selectedOrgID, setSelectedOrgID] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ORGANIZATIONS ================= */

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await getOrganizations();
      setOrganizations(response);

      // Initialize assignment structure
      setOrganizationPositions(
        response.map((org: Organization) => ({
          OrganizationID: org.OrganizationID,
          assignedPositions: [],
        }))
      );
    } catch (error) {
      toast.error('Failed to load organizations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DERIVED DATA ================= */

  const selectedOrg = organizations.find(o => o.OrganizationID === selectedOrgID);

  const assignedPositions =
    selectedOrgID !== null
      ? organizationPositions.find(o => o.OrganizationID === selectedOrgID)
          ?.assignedPositions || []
      : [];

  const orgOptions: SelectOption[] = organizations.map(org => ({
    value: org.OrganizationID,
    label: org.OrganizationName,
  }));

  /* ================= GROUP POSITIONS BY ROLE ================= */

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

    const roleIDs = groupedPositions[role].map(p => p.PositionID);

    setOrganizationPositions(prev =>
      prev.map(org =>
        org.OrganizationID === selectedOrgID
          ? {
              ...org,
              assignedPositions: Array.from(
                new Set([...org.assignedPositions, ...roleIDs])
              ),
            }
          : org
      )
    );
    setIsDirty(true);
  };

  const handleUnselectAllByRole = (role: string) => {
    if (selectedOrgID === null) return;

    const roleIDs = groupedPositions[role].map(p => p.PositionID);

    setOrganizationPositions(prev =>
      prev.map(org =>
        org.OrganizationID === selectedOrgID
          ? {
              ...org,
              assignedPositions: org.assignedPositions.filter(
                p => !roleIDs.includes(p)
              ),
            }
          : org
      )
    );
    setIsDirty(true);
  };

  const handleSave = () => {
    console.log('Assigned Positions Payload:', {
      OrganizationID: selectedOrgID,
      Positions: assignedPositions,
    });

    setSuccessMessage('Positions assigned successfully!');
    setIsDirty(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /* ================= UI ================= */

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Manage Positions for Organization</h3>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Card className="p-3 mb-4">
        <Form.Group>
          <Form.Label>Select Organization</Form.Label>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <Select
              options={orgOptions}
              onChange={option => setSelectedOrgID(option ? option.value : null)}
              placeholder="Search and select organization..."
              isClearable
            />
          )}
        </Form.Group>
      </Card>

      {!selectedOrgID && !loading && (
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
                    {role}
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
            <Button variant="success" onClick={handleSave} disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default AssignPositions;
