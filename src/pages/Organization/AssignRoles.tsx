import React, { useState } from 'react';
import { Container, Card, Form, Table, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';

/* ================= STATIC DATA ================= */

const roles = [
  { RoleID: 1, RoleName: 'Admin', Description: 'Full access to all modules' },
  { RoleID: 2, RoleName: 'Manager', Description: 'Manage teams and projects' },
  { RoleID: 3, RoleName: 'Employee', Description: 'Access assigned tasks only' },
  { RoleID: 4, RoleName: 'Viewer', Description: 'Read-only access' },
  { RoleID: 5, RoleName: 'Auditor', Description: 'Audit and reporting access' },
  { RoleID: 6, RoleName: 'HR', Description: 'Manage HR related tasks' },
  { RoleID: 7, RoleName: 'Finance', Description: 'Manage finance modules' },
  { RoleID: 8, RoleName: 'Support', Description: 'Customer support access' },
];

const organizations = [
  { OrganizationID: 1, OrganizationName: 'Organization A' },
  { OrganizationID: 2, OrganizationName: 'Organization B' },
  { OrganizationID: 3, OrganizationName: 'Organization C' },
  { OrganizationID: 4, OrganizationName: 'Organization D' },
  { OrganizationID: 5, OrganizationName: 'Organization E' },
];

/* ================= TYPES ================= */

interface OrganizationRole {
  OrganizationID: number;
  assignedRoles: number[];
}

interface SelectOption {
  value: number;
  label: string;
}

/* ================= COMPONENT ================= */

const AssignRoles: React.FC = () => {
  const [selectedOrgID, setSelectedOrgID] = useState<number | null>(null);
  const [organizationRoles, setOrganizationRoles] = useState<OrganizationRole[]>(
    organizations.map(org => ({ OrganizationID: org.OrganizationID, assignedRoles: [] }))
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRoleToggle = (roleID: number) => {
    if (selectedOrgID === null) return;
    setOrganizationRoles(prev =>
      prev.map(org => {
        if (org.OrganizationID === selectedOrgID) {
          const updatedRoles = org.assignedRoles.includes(roleID)
            ? org.assignedRoles.filter(r => r !== roleID)
            : [...org.assignedRoles, roleID];
          return { ...org, assignedRoles: updatedRoles };
        }
        return org;
      })
    );
  };

  const handleSave = () => {
    console.log('Assigned Roles:', organizationRoles);
    setSuccessMessage('Roles assigned successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const selectedOrg = organizations.find(org => org.OrganizationID === selectedOrgID);
  const assignedRoles = selectedOrgID
    ? organizationRoles.find(r => r.OrganizationID === selectedOrgID)?.assignedRoles || []
    : [];

  const orgOptions: SelectOption[] = organizations.map(org => ({
    value: org.OrganizationID,
    label: org.OrganizationName,
  }));

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Assign Roles to Organization</h3>

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
          <h5>Roles for {selectedOrg?.OrganizationName}</h5>
          <Table striped bordered hover responsive className="mt-3 align-middle">
            <thead className="table-primary">
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th className="text-center">Assign</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.RoleID}>
                  <td>{role.RoleName}</td>
                  <td>{role.Description}</td>
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      id={`role-switch-${role.RoleID}`}
                      checked={assignedRoles.includes(role.RoleID)}
                      onChange={() => handleRoleToggle(role.RoleID)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-end mt-3">
            <Button variant="success" onClick={handleSave}>
              Save Roles
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default AssignRoles;
