import React, { useState, useEffect } from 'react';
import { Form, Table } from 'react-bootstrap';
import Select from 'react-select';
import { GetAssignedRolesAsync,AssignOrganizationRolesAsync } from '../../services/roleService';
import { useParams } from 'react-router-dom';
import { fireAudit } from '../../utils/auditUtils';

interface RoleOption {
  value: string;
  label: string;
}

  const EmployeeRoles: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [oldRoles, setOldRoles] = useState<string[]>([]);
  const { employeeID } = useParams<{ employeeID: string }>();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID = user.organizationID;   
  const userIDNum = Number(employeeID!);
  useEffect(() => {
    const fetchRoles = async () => {
      try {          
        if (!organizationID) {
          console.error('Organization ID not found');
          setLoading(false);
          return;
        }
        const data = await GetAssignedRolesAsync(organizationID,userIDNum);
        setAllRoles(data);
        const mappedOptions: RoleOption[] = data.map((role: any) => ({
          value: role.RoleID.toString(),
          label: role.RoleName,
        }));

        setRoleOptions(mappedOptions);

        // Set initially selected roles where IsAssigned is 1
        const assignedRoles = data
          .filter((role: any) => role.IsAssigned === 1)
          .map((role: any) => role.RoleID.toString());
        setRoles(assignedRoles);
        setOldRoles(assignedRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleAssignRoles = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userID = user.userID;
      const payload = {
        createdBy: "Admin",
        roles: roles.join(','),
        userID: userIDNum
      };
      await AssignOrganizationRolesAsync(payload);
      alert('Roles assigned successfully!');
      fireAudit("UPDATE", "EmployeeRoleAssignment", { employeeID: userIDNum, roles: oldRoles.join(',') }, { employeeID: userIDNum, roles: roles.join(',') }, organizationID, user?.name || "Admin", "EmployeeRoles");
    } catch (error) {
      console.error('Error assigning roles:', error);
      alert('Failed to assign roles.');
    }
  };

  if (loading) {
    return <div>Loading roles...</div>;
  }

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Assigned Roles</Form.Label>

        <Select
          isMulti
          options={roleOptions}
          value={roleOptions.filter((opt) => roles.includes(opt.value))}
          onChange={(selectedOptions) =>
            setRoles(selectedOptions.map((opt) => opt.value))
          }
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          placeholder="Select roles..."
          className="org-select"
          classNamePrefix="org-select"
        />

        <Form.Text className="text-muted">
          Select one or more roles assigned to this employee.
        </Form.Text>
      </Form.Group>

      {roles.length > 0 && (
        <Table className="table table-hover table-dark-custom">
          <thead>
            <tr>
              <th>Role</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {allRoles
              .filter((role) => roles.includes(role.RoleID.toString()))
              .map((role) => (
                <tr key={role.RoleID}>
                  <td>{role.RoleName}</td>
                  <td>{role.Description}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}

      <button type="button" className="btn btn-primary" onClick={handleAssignRoles}>
        Assign Roles
      </button>
    </Form>
  );
};

export default EmployeeRoles;
