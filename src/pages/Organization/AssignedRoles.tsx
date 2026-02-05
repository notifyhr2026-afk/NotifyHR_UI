import React, { useEffect, useState } from "react";
import { Container, Card, Table } from "react-bootstrap";
import { getOrgRolesAsync } from "../../services/organizationService";

interface OrgRole {
  OrgRoleID: number;
  RoleID: number;
  RoleName: string;
  Description: string;
}

const AssignedRoles: React.FC = () => {
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Get organizationID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;

  useEffect(() => {
    if (organizationID) {
      fetchOrganizationRoles(organizationID);
    } else {
      setLoading(false);
    }
  }, [organizationID]);

  const fetchOrganizationRoles = async (orgID: number) => {
    try {
      setLoading(true);
      const response = await getOrgRolesAsync(orgID);

      // Handle JSON string or object response
      const data = typeof response === "string" ? JSON.parse(response) : response;

      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch organization roles", error);
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
      <h3 className="mb-4">Assigned Roles</h3>

      <Card className="p-3">
        <Table striped bordered hover responsive className="mt-3 align-middle">
          <thead className="table-primary">
            <tr>
              <th>Role Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.OrgRoleID}>
                  <td>{role.RoleName}</td>
                  <td>{role.Description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center">
                  No roles assigned
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default AssignedRoles;
