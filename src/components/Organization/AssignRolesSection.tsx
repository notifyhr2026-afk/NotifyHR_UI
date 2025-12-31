import React, { useEffect, useState } from "react";
import { ListGroup, Form, InputGroup, FormControl } from "react-bootstrap";

interface Role {
  RoleID: number;
  RoleName: string;
  Description: string;
  IsActive: boolean;
}

interface OrgRole {
  OrgRoleID: number;
  OrganizationID: number;
  RoleID: number;
  IsActive: boolean;
}

const AssignRolesSection: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [orgRolesMap, setOrgRolesMap] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");

  // ---------------------------------------------------------------
  // SAMPLE DATA (replace later with API)
  // ---------------------------------------------------------------
  const sampleRoles: Role[] = [
    {
      RoleID: 1,
      RoleName: "Admin",
      Description: "Full access to all modules.",
      IsActive: true,
    },
    {
      RoleID: 2,
      RoleName: "Manager",
      Description: "Can approve leaves, view reports and manage team.",
      IsActive: true,
    },
    {
      RoleID: 3,
      RoleName: "Employee",
      Description: "Basic access for daily operations.",
      IsActive: true,
    },
    {
      RoleID: 4,
      RoleName: "HR Executive",
      Description: "Manages employees, attendance and payroll.",
      IsActive: true,
    },
  ];

  const sampleOrgRoles: OrgRole[] = [
    { OrgRoleID: 1, OrganizationID: 1, RoleID: 1, IsActive: true },
    { OrgRoleID: 2, OrganizationID: 1, RoleID: 3, IsActive: true },
  ];

  // ---------------------------------------------------------------
  // Load initial data
  // ---------------------------------------------------------------
  useEffect(() => {
    setRoles(sampleRoles);

    const map: Record<number, boolean> = {};
    sampleOrgRoles.forEach((r) => {
      map[r.RoleID] = r.IsActive;
    });

    setOrgRolesMap(map);
  }, []);

  // ---------------------------------------------------------------
  // Toggle role ON/OFF
  // ---------------------------------------------------------------
  const toggleRole = (roleId: number, isActive: boolean) => {
    setOrgRolesMap((prev) => ({
      ...prev,
      [roleId]: isActive,
    }));

    console.log(`UPDATED → RoleID ${roleId}: IsActive = ${isActive}`);
  };

  // SEARCH FILTER
  const filteredRoles = roles.filter(
    (r) =>
      r.RoleName.toLowerCase().includes(search.toLowerCase()) ||
      r.Description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      {/* SEARCH BAR */}
      <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
        <FormControl
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* ROLE LIST */}
      <ListGroup>
        {filteredRoles.map((role) => (
          <ListGroup.Item
            key={role.RoleID}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{role.RoleName}</strong>
              <div className="text-muted small">{role.Description}</div>
            </div>

            {/* Toggle Switch */}
            <Form.Check
              type="switch"
              checked={orgRolesMap[role.RoleID] || false}
              onChange={(e) =>
                toggleRole(role.RoleID, e.target.checked)
              }
            />
          </ListGroup.Item>
        ))}

        {filteredRoles.length === 0 && (
          <div className="text-center text-muted py-4">
            No roles found
          </div>
        )}
      </ListGroup>
    </div>
  );
};

export default AssignRolesSection;
