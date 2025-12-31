import React from "react";
import { Table, Form } from "react-bootstrap";

export type PermissionKey = "CanView" | "CanAdd" | "CanEdit" | "CanDelete";

interface MenuItem {
  id: number;
  name: string;
}

interface AssignedMenu {
  menuId: number;
  menuName: string;
  CanView: boolean;
  CanAdd: boolean;
  CanEdit: boolean;
  CanDelete: boolean;
}

interface Props {
  menus: MenuItem[];
  assignedMenus: AssignedMenu[];
  onPermissionChange: (menuId: number, field: PermissionKey) => void;
}

const AssignMenuTable: React.FC<Props> = ({
  menus,
  assignedMenus,
  onPermissionChange,
}) => {
  const permissions: PermissionKey[] = [
    "CanView",
    "CanAdd",
    "CanEdit",
    "CanDelete",
  ];

  return (
    <Table bordered hover responsive size="sm">
      <thead>
        <tr>
          <th>Menu Name</th>
          <th className="text-center">View</th>
          <th className="text-center">Add</th>
          <th className="text-center">Edit</th>
          <th className="text-center">Delete</th>
        </tr>
      </thead>

      <tbody>
        {menus.map((menu) => {
          const assigned = assignedMenus.find((m) => m.menuId === menu.id);

          return (
            <tr key={menu.id}>
              <td>{menu.name}</td>

              {permissions.map((perm) => (
                <td key={perm} className="text-center">
                  <Form.Check
                    type="checkbox"
                    checked={assigned ? assigned[perm] : false}
                    onChange={() => onPermissionChange(menu.id, perm)}
                  />
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default AssignMenuTable;
