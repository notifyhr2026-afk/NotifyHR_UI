import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';

interface RoleOption {
  value: string;
  label: string;
}

const roleOptions: RoleOption[] = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Guest', label: 'Guest' },
];

const EmployeeRoles: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]);

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
        />

        <Form.Text className="text-muted">
          Select one or more roles assigned to this employee.
        </Form.Text>
      </Form.Group>
    </Form>
  );
};

export default EmployeeRoles;
