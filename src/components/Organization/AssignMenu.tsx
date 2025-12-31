import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import AssignMenuTable from "./AssignMenuTable";

const AssignMenu: React.FC = () => {
  const menus = [
    { id: 1, name: "Dashboard" },
    { id: 2, name: "Users" },
    { id: 3, name: "Employees" },
    { id: 4, name: "Roles" },
    { id: 5, name: "Settings" },
    { id: 6, name: "Reports" }
  ];

  const [assignedMenus, setAssignedMenus] = useState<any[]>([]);

  const onPermissionChange = (menuId: number, field: string) => {
    setAssignedMenus((prev) => {
      const newList = [...prev];
      const idx = newList.findIndex((m) => m.menuId === menuId);

      if (idx !== -1) {
        newList[idx][field] = !newList[idx][field];
      } else {
        newList.push({
          menuId,
          menuName: menus.find((m) => m.id === menuId)?.name,
          CanView: field === "CanView",
          CanAdd: field === "CanAdd",
          CanEdit: field === "CanEdit",
          CanDelete: field === "CanDelete"
        });
      }

      return newList;
    });
  };

  const handleSave = () => {
    console.log("Saved Menu Permissions:", assignedMenus);
    alert("Assign Menu Saved Successfully (Static Demo)");
  };

  return (
    <>
      <AssignMenuTable
        menus={menus}
        assignedMenus={assignedMenus}
        onPermissionChange={onPermissionChange}
      />

      <div className="text-end mt-3">
        <Button variant="primary" onClick={handleSave}>
          Save Assign Menu
        </Button>
      </div>
    </>
  );
};

export default AssignMenu;
