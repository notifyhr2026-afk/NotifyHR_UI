import React, { useState } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';

interface Permission {
  PermissionCode: string;
  PermissionName: string;
  ModuleName: string;
  Description: string;
}

const permissions: Permission[] = [
  { PermissionCode: 'EMP_CREATE', PermissionName: 'Create Employee', ModuleName: 'Employee', Description: 'Add new employee records' },
  { PermissionCode: 'EMP_EDIT', PermissionName: 'Edit Employee', ModuleName: 'Employee', Description: 'Edit employee records' },
  { PermissionCode: 'PAY_VIEW', PermissionName: 'View Payroll', ModuleName: 'Payroll', Description: 'View payroll info' },
  // add more...
];

const modules = Array.from(new Set(permissions.map((p) => p.ModuleName)));

const RolePermissionAssign: React.FC = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [savedPermissions, setSavedPermissions] = useState<string[]>([]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedPermissions(selected);
  };

  const handleSave = () => {
    setSavedPermissions((prev) => {
      // Append new selected permissions without duplicates
      const newPerms = selectedPermissions.filter((p) => !prev.includes(p));
      return [...prev, ...newPerms];
    });
    setSelectedPermissions([]);
  };

  const handleRemove = (permCode: string) => {
    setSavedPermissions((prev) => prev.filter((p) => p !== permCode));
  };

  const getPermissionName = (code: string) => permissions.find((p) => p.PermissionCode === code)?.PermissionName || code;

  return (
    <div>
      <Form.Group controlId="permissionSelect" className="mb-3">
        <Form.Label>Select Permissions (Grouped by Module)</Form.Label>
        <Form.Select multiple value={selectedPermissions} onChange={handleSelectChange}>
          {modules.map((mod) => (
            <optgroup label={mod} key={mod}>
              {permissions
                .filter((p) => p.ModuleName === mod)
                .map((p) => (
                  <option key={p.PermissionCode} value={p.PermissionCode}>
                    {p.PermissionName}
                  </option>
                ))}
            </optgroup>
          ))}
        </Form.Select>
      </Form.Group>

      <Button onClick={handleSave} disabled={selectedPermissions.length === 0}>
        Save Permissions
      </Button>

      <div className="mt-3">
        <h6>Saved Permissions:</h6>
        {savedPermissions.length === 0 && <p><em>No permissions assigned yet.</em></p>}
        {savedPermissions.map((perm) => (
          <Badge key={perm} bg="secondary" className="me-2 mb-2" style={{ cursor: 'pointer' }} onClick={() => handleRemove(perm)}>
            {getPermissionName(perm)} &times;
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default RolePermissionAssign;
