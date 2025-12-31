import React, { useState, useEffect } from 'react';
import { Container, Card, Table } from 'react-bootstrap';

// Mock data for positions and organization positions
const positions = [
  { PositionID: 1, PositionName: 'CEO', Description: 'Chief Executive Officer' },
  { PositionID: 2, PositionName: 'CTO', Description: 'Chief Technology Officer' },
  { PositionID: 3, PositionName: 'Project Manager', Description: 'Manages project timelines and teams' },
  { PositionID: 4, PositionName: 'Software Engineer', Description: 'Develops and builds software applications' },
];

const organizationPositions = [
  { OrganizationID: 1, assignedPositions: [1, 2] },
  { OrganizationID: 2, assignedPositions: [3, 4] },
  { OrganizationID: 9, assignedPositions: [1, 3, 4] },
];

const AssignedPositions: React.FC = () => {
  const [assignedPositions, setAssignedPositions] = useState<number[]>([]);
  const [organizationID, setOrganizationID] = useState<number | undefined>(undefined);

  // Fetch organizationID from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orgID: number | undefined = user?.organizationID;
    setOrganizationID(orgID);
  }, []);

  useEffect(() => {
    if (organizationID !== undefined) {
      const orgPositions = organizationPositions.find((org) => org.OrganizationID === organizationID);
      if (orgPositions) {
        setAssignedPositions(orgPositions.assignedPositions);
      }
    }
  }, [organizationID]);

  // Display loading state until organizationID is fetched
  if (organizationID === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Assigned Positions for Organization {organizationID}</h3>

      <Card className="p-3 mb-4">
        <h5>Assigned Positions</h5>
        <Table striped bordered hover responsive className="mt-3 align-middle">
          <thead className="table-primary">
            <tr>
              <th>Position Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {positions
              .filter((position) => assignedPositions.includes(position.PositionID))
              .map((position) => (
                <tr key={position.PositionID}>
                  <td>{position.PositionName}</td>
                  <td>{position.Description}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default AssignedPositions;
