import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Table,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";

import {
  GetRolesByorganizationIDAsync,
  AssignRolesByAsync,
} from "../../services/roleService";

import { getOrganizations } from "../../services/organizationService";

/* ================= TYPES ================= */

interface Role {
  RoleID: number;
  RoleName: string;
  Description: string;
  IsActive: boolean;
  IsAssigned?: number;
}

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
}

interface SelectOption {
  value: number;
  label: string;
}

/* ================= COMPONENT ================= */

const AssignRoles: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<SelectOption | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* ================= LOAD ORGANIZATIONS ================= */

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await getOrganizations();
      setOrganizations(response);
    } catch (error) {
      toast.error("Failed to load organizations");
      console.error(error);
    }
  };

  /* ================= LOAD ROLES ================= */

  const fetchRolesByOrganization = async (organizationID: number) => {
    try {
      setLoading(true);
     debugger;
      const response = await GetRolesByorganizationIDAsync(organizationID);

      const activeRoles = response.filter((r: Role) => r.IsActive);

      setRoles(activeRoles);

      const assigned = activeRoles
        .filter((r: Role) => r.IsAssigned === 1)
        .map((r: Role) => r.RoleID);

      setAssignedRoles(assigned);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ORGANIZATION CHANGE ================= */

  const handleOrgChange = (option: SelectOption | null) => {
    setSelectedOrg(option);

    if (option) {
      fetchRolesByOrganization(option.value);
    } else {
      setRoles([]);
      setAssignedRoles([]);
    }
  };

  /* ================= ROLE TOGGLE ================= */

  const handleRoleToggle = (roleID: number) => {
    setAssignedRoles((prev) =>
      prev.includes(roleID)
        ? prev.filter((r) => r !== roleID)
        : [...prev, roleID]
    );
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!selectedOrg) {
      toast.warning("Please select an organization");
      return;
    }

    if (assignedRoles.length === 0) {
      toast.warning("Please select at least one role");
      return;
    }

    const rolesArray = assignedRoles.map((roleID) => ({      
      RoleID: roleID
    }));

    const payload = {
      createdBy: "Admin",
      roles: assignedRoles.join(","), // ✅ "1,2,3"
      organizationID: selectedOrg.value,
    };

    try {
      setSaving(true);

      await AssignRolesByAsync(payload);

      toast.success("Roles assigned successfully!");
      setSuccessMessage("Roles assigned successfully!");

      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (error) {
      toast.error("Failed to assign roles");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  /* ================= OPTIONS ================= */

  const orgOptions: SelectOption[] = organizations.map((org) => ({
    value: org.OrganizationID,
    label: org.OrganizationName,
  }));

  const selectedOrgName = selectedOrg?.label || "";

  /* ================= UI ================= */

  return (
    <Container>
      <h3 className="mb-4">Assign Roles to Organization</h3>

      {successMessage && (
        <Alert variant="success">{successMessage}</Alert>
      )}

      {/* ORGANIZATION SELECT */}
      <Card className="p-3 mb-4">
        <Form.Label>Select Organization</Form.Label>

        <Select
          className="org-select"
          classNamePrefix="org-select"
          options={orgOptions}
          value={selectedOrg}
          onChange={handleOrgChange}
          placeholder="Search and select organization..."
          isClearable
          menuPortalTarget={document.body} // ✅ fixes overlap
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      </Card>

      {/* ROLES TABLE */}
      {selectedOrg && (
        <Card className="p-3">
          <h5 className="mb-3">Roles for {selectedOrgName}</h5>

          {/* FIXED HEIGHT WRAPPER */}
          <div style={{ minHeight: "320px", transition: "all 0.3s ease" }}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table className="table table-hover table-dark-custom">
                  <thead className="table-primary">
                    <tr>
                      <th>Role Name</th>
                      <th>Description</th>
                      <th className="text-center">Assign</th>
                    </tr>
                  </thead>

                  <tbody>
                    {roles.length ? (
                      roles.map((role) => (
                        <tr key={role.RoleID}>
                          <td>{role.RoleName}</td>
                          <td>{role.Description || "-"}</td>

                          <td className="text-center">
                            <Form.Check
                              type="switch"
                              id={`role-${role.RoleID}`}
                              checked={assignedRoles.includes(role.RoleID)}
                              onChange={() =>
                                handleRoleToggle(role.RoleID)
                              }
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
              </div>
            )}
          </div>

          {/* SAVE BUTTON */}
          <div className="text-end mt-3">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <Spinner size="sm" animation="border" /> Saving...
                </>
              ) : (
                "Save Roles"
              )}
            </Button>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default AssignRoles;