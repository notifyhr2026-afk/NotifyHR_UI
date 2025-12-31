import React, { useState, useEffect } from 'react';
import { Container, Card, Table } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Mock data for roles and organizations
const roles = [
  { RoleID: 1, RoleName: 'Admin', Description: 'Full access to all modules' },
  { RoleID: 2, RoleName: 'Manager', Description: 'Manage teams and projects' },
  { RoleID: 3, RoleName: 'Developer', Description: 'Develop and maintain code' },
  { RoleID: 4, RoleName: 'Tester', Description: 'Test applications and report bugs' },
];

const organizationRoles = [
  { OrganizationID: 1, assignedRoles: [1, 2] },
  { OrganizationID: 2, assignedRoles: [3, 4] },
  { OrganizationID: 9, assignedRoles: [1, 3, 4] },
];

const AssignedRoles: React.FC = () => {
  const [assignedRoles, setAssignedRoles] = useState<number[]>([]);
  const [organizationID, setOrganizationID] = useState<number | undefined>(undefined);

  // Fetch organizationID from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orgID: number | undefined = user?.organizationID;
    setOrganizationID(orgID);
  }, []);

  useEffect(() => {
    if (organizationID !== undefined) {
      const orgRoles = organizationRoles.find((org) => org.OrganizationID === organizationID);
      if (orgRoles) {
        setAssignedRoles(orgRoles.assignedRoles);
      }
    }
  }, [organizationID]);

  // Display loading state until organizationID is fetched
  if (organizationID === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Assigned Roles for Organization {organizationID}</h3>

      <Card className="p-3 mb-4">
        <h5>Assigned Roles</h5>
        <Table striped bordered hover responsive className="mt-3 align-middle">
          <thead className="table-primary">
            <tr>
              <th>Role Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {roles
              .filter((role) => assignedRoles.includes(role.RoleID))
              .map((role) => (
                <tr key={role.RoleID}>
                  <td>{role.RoleName}</td>
                  <td>{role.Description}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default AssignedRoles;
