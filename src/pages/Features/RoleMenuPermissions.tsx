import React, { useEffect, useState } from 'react';
import {
  Accordion,
  Form,
  Button,
  Table,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';

import { getMenus } from '../../services/menuService';
import { GetAllFeaturesAsync } from '../../services/featureService';
import { GetRolesAsync, GetRoleMenusAsync, SaveFeaturePermissionsAsync } from '../../services/roleService';
import { MenuItem } from '../../types/menuTypes';

/* ===================== TYPES ===================== */

interface Feature {
  FeatureID: number;
  FeatureName: string;
  Description: string;
  FeatureType: string;
  IsActive: boolean;
}

interface Role {
  RoleID: number;
  RoleCode: string | null;
  RoleName: string;
  Description: string;
  IsActive: boolean;
  CreatedBy: string;
}

interface RoleMenuPermission {
  menuID: number;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface RoleOption {
  value: number;
  label: string;
}

/* ===================== COMPONENT ===================== */

const RoleMenuPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [permissions, setPermissions] = useState<RoleMenuPermission[]>([]);
  const [savedRoleMenus, setSavedRoleMenus] = useState<any[]>([]);
  const [selectedRoleID, setSelectedRoleID] = useState<number | null>(null);

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    fetchRoles();
    fetchMenus();
    fetchFeatures();
  }, []);

  const fetchRoles = async () => {
    try {
      const resp = await GetRolesAsync();
      setRoles(resp.filter((r: Role) => r.IsActive));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load roles');
    }
  };

  const fetchMenus = async () => {
    try {
      const resp = await getMenus();
      setMenus(resp);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menus');
    }
  };

  const fetchFeatures = async () => {
    try {
      const resp = await GetAllFeaturesAsync();
      setFeatures(resp.filter((f: Feature) => f.IsActive));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load features');
    }
  };

  /* ===================== ROLE CHANGE ===================== */
  // Inside component
const handleRoleChange = async (roleID: number | null) => {
  setSelectedRoleID(roleID);

  if (!roleID) {
    setPermissions([]);
    setSavedRoleMenus([]);
    return;
  }

  try {
    // 1. Wait for menus to be loaded
    if (menus.length === 0) {
      await fetchMenus();
    }

    // 2. Fetch saved permissions for this role
    const savedRoleMenusData = await GetRoleMenusAsync(roleID);
    setSavedRoleMenus(savedRoleMenusData);

    // 3. Merge saved permissions with menus
    const mappedPermissions: RoleMenuPermission[] = menus.map(menu => {
      const saved = savedRoleMenusData.find((r: any) => r.MenuID === menu.menuID);
      return {
        menuID: menu.menuID,
        canView: saved ? saved.CanView : false,
        canAdd: saved ? saved.CanAdd : false,
        canEdit: saved ? saved.CanEdit : false,
        canDelete: saved ? saved.CanDelete : false,
      };
    });

    setPermissions(mappedPermissions);
  } catch (err) {
    console.error(err);
    toast.error('Failed to load role permissions');
  }
};


  /* ===================== FETCH SAVED ROLE MENUS ===================== */
  useEffect(() => {
    const fetchSavedRoleMenus = async () => {
      if (!selectedRoleID) {
        setSavedRoleMenus([]);
        return;
      }

      try {
        const res = await GetRoleMenusAsync(selectedRoleID);
        setSavedRoleMenus(res);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load role permissions');
      }
    };

    fetchSavedRoleMenus();
  }, [selectedRoleID]);

  /* ===================== MAP PERMISSIONS ===================== */
// Map permissions only when role is selected AND menus & savedRoleMenus are ready
useEffect(() => {
  if (!selectedRoleID || menus.length === 0 || savedRoleMenus.length === 0) {
    // If role is selected but no savedRoleMenus, still initialize to false
    if (selectedRoleID && menus.length > 0) {
      const initialPermissions: RoleMenuPermission[] = menus.map(menu => ({
        menuID: menu.menuID,
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
      }));
      setPermissions(initialPermissions);
    } else {
      setPermissions([]);
    }
    return;
  }

  // Map saved permissions
  const mappedPermissions: RoleMenuPermission[] = menus.map(menu => {
    const saved = savedRoleMenus.find(r => r.MenuID === menu.menuID);
    return {
      menuID: menu.menuID,
      canView: saved ? saved.CanView : false,
      canAdd: saved ? saved.CanAdd : false,
      canEdit: saved ? saved.CanEdit : false,
      canDelete: saved ? saved.CanDelete : false,
    };
  });

  setPermissions(mappedPermissions);

}, [selectedRoleID, menus, savedRoleMenus]);


  /* ===================== TOGGLE PERMISSION ===================== */
  const togglePermission = (
    menuID: number,
    field: keyof RoleMenuPermission
  ) => {
    setPermissions(prev =>
      prev.map(p =>
        p.menuID === menuID ? { ...p, [field]: !p[field] } : p
      )
    );
  };

  /* ===================== SAVE FEATURE ===================== */
const saveFeaturePermissions = async (featureID: number) => {
  if (!selectedRoleID) return;

  // Ensure featureMenuIds is number[]
  const featureMenuIds: number[] = menus
    .filter(m => m.featureID === featureID)
    .map(m => m.menuID);

  // Filter permissions safely
  const payload: RoleMenuPermission[] = permissions.filter(p =>
    featureMenuIds.includes(p.menuID)
  );

  if (payload.length === 0) {
    toast.info('No permissions to save for this feature.');
    return;
  }

  try {
    await SaveFeaturePermissionsAsync({
      roleID: selectedRoleID,
      featureID,
      roleMenus: payload,
    });
    toast.success('Feature permissions saved successfully.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to save feature permissions.');
  }
};


  /* ===================== GROUP MENUS BY FEATURE ===================== */
  const featureGroups = features.map(feature => ({
    featureID: feature.FeatureID,
    featureName: feature.FeatureName,
    menus: menus.filter(m => m.featureID === feature.FeatureID),
  }));

  /* ===================== ROLE OPTIONS ===================== */
  const roleOptions: RoleOption[] = roles.map(role => ({
    value: role.RoleID,
    label: role.RoleName,
  }));

  /* ===================== JSX ===================== */
  return (
    <div className="container mt-5">
      <h4 className="mb-4">Role Menu Permissions</h4>

      {/* SEARCHABLE ROLE SELECT */}
      <Form.Group className="mb-4">
        <Form.Label>Select Role</Form.Label>
        <Select
          options={roleOptions}
          placeholder="Search role..."
          isClearable
          onChange={(option) =>
            handleRoleChange(option ? option.value : null)
          }
        />
      </Form.Group>

      {/* FEATURE ACCORDION */}
      {selectedRoleID && (
        <Accordion alwaysOpen>
          {featureGroups.map((feature, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={feature.featureID}
            >
              <Accordion.Header>
                <strong>{feature.featureName}</strong>
              </Accordion.Header>

              <Accordion.Body>
                {feature.menus.length === 0 ? (
                  <div className="text-muted">
                    No menus mapped to this feature
                  </div>
                ) : (
                  <Table bordered hover responsive>
                    <thead className="table-light">
                      <tr>
                        <th>Menu</th>
                        <th className="text-center">View</th>
                        <th className="text-center">Add</th>
                        <th className="text-center">Edit</th>
                        <th className="text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feature.menus.map(menu => {
                        const permission = permissions.find(
                          p => p.menuID === menu.menuID
                        );

                        if (!permission) return null;

                        return (
                          <tr key={menu.menuID}>
                            <td>{menu.menuName}</td>

                            {(
                              [
                                'canView',
                                'canAdd',
                                'canEdit',
                                'canDelete',
                              ] as const
                            ).map(field => (
                              <td
                                key={field}
                                className="text-center"
                              >
                                <Form.Check
                                  type="switch"
                                  checked={permission[field]}
                                  onChange={() =>
                                    togglePermission(menu.menuID, field)
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}

                <div className="text-end">
                  <Button
                    variant="primary"
                    onClick={() =>
                      saveFeaturePermissions(feature.featureID)
                    }
                  >
                    Save {feature.featureName}
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default RoleMenuPermissions;
