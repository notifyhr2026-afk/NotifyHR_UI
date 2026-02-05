import React, { useEffect, useState } from "react";
import { Container, Card, Table } from "react-bootstrap";
import { GetOrgPositionsAsync } from "../../services/organizationService";

interface OrgPosition {
  OrgPositionID: number;
  PositionTitle: string;
  Description: string;
  RoleName: string;
}

const AssignedPositions: React.FC = () => {
  const [positions, setPositions] = useState<OrgPosition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Get organizationID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;
  debugger;
  useEffect(() => {
    if (organizationID) {
      fetchOrganizationPositions(organizationID);
    } else {
      setLoading(false);
    }
  }, [organizationID]);

  const fetchOrganizationPositions = async (orgID: number) => {
    try {
      setLoading(true);
      const response = await GetOrgPositionsAsync(orgID);

      // Handle JSON string or object response
      const data = typeof response === "string" ? JSON.parse(response) : response;

      setPositions(data);
    } catch (error) {
      console.error("Failed to fetch organization positions", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!organizationID) {
    return <div>Organization not found.</div>;
  }

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Assigned Positions</h3>

      <Card className="p-3">
        <Table striped bordered hover responsive className="mt-3 align-middle">
          <thead className="table-primary">
            <tr>
              <th>Position Title</th>
              <th>Description</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {positions.length > 0 ? (
              positions.map((pos) => (
                <tr key={pos.OrgPositionID}>
                  <td>{pos.PositionTitle}</td>
                  <td>{pos.Description}</td>
                  <td>{pos.RoleName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center">
                  No positions assigned
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default AssignedPositions;
