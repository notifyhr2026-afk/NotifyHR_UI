import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Table, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { GetRolesAsync } from '../../services/roleService';
import { getOrganizations } from '../../services/organizationService';

/* ================= TYPES ================= */

interface Role {
  RoleID: number;
  RoleName: string;
  Description: string;
  IsActive: boolean;
}

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
}

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
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationRoles, setOrganizationRoles] = useState<OrganizationRole[]>([]);
  const [selectedOrgID, setSelectedOrgID] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    fetchRoles();
    fetchOrganizations();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await GetRolesAsync();
      setRoles(response.filter((r: Role) => r.IsActive));
    } catch (error) {
      toast.error('Failed to load roles');
      console.error(error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await getOrganizations();
      setOrganizations(response);

      // initialize role assignment structure
      setOrganizationRoles(
        response.map((org: Organization) => ({
          OrganizationID: org.OrganizationID,
          assignedRoles: [],
        }))
      );
    } catch (error) {
      toast.error('Failed to load organizations');
      console.error(error);
    }
  };

  /* ================= ROLE ASSIGN ================= */

  const handleRoleToggle = (roleID: number) => {
    if (selectedOrgID === null) return;

    setOrganizationRoles(prev =>
      prev.map(org =>
        org.OrganizationID === selectedOrgID
          ? {
              ...org,
              assignedRoles: org.assignedRoles.includes(roleID)
                ? org.assignedRoles.filter(r => r !== roleID)
                : [...org.assignedRoles, roleID],
            }
          : org
      )
    );
  };

  const handleSave = () => {
    console.log('Assigned Roles Payload:', {
      OrganizationID: selectedOrgID,
      Roles:
        organizationRoles.find(o => o.OrganizationID === selectedOrgID)
          ?.assignedRoles || [],
    });

    setSuccessMessage('Roles assigned successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /* ================= DERIVED DATA ================= */

  const selectedOrg = organizations.find(
    org => org.OrganizationID === selectedOrgID
  );

  const assignedRoles =
    selectedOrgID !== null
      ? organizationRoles.find(o => o.OrganizationID === selectedOrgID)
          ?.assignedRoles || []
      : [];

  const orgOptions: SelectOption[] = organizations.map(org => ({
    value: org.OrganizationID,
    label: org.OrganizationName,
  }));

  /* ================= UI ================= */

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Assign Roles to Organization</h3>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Card className="p-3 mb-4">
        <Form.Group>
          <Form.Label>Select Organization</Form.Label>
          <Select
            options={orgOptions}
            onChange={option =>
              setSelectedOrgID(option ? option.value : null)
            }
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
              {roles.length ? (
                roles.map(role => (
                  <tr key={role.RoleID}>
                    <td>{role.RoleName}</td>
                    <td>{role.Description || '-'}</td>
                    <td className="text-center">
                      <Form.Check
                        type="switch"
                        id={`role-switch-${role.RoleID}`}
                        checked={assignedRoles.includes(role.RoleID)}
                        onChange={() => handleRoleToggle(role.RoleID)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center">
                    No roles available
                  </td>
                </tr>
              )}
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
