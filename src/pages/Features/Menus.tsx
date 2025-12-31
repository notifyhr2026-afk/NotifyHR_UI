import React, { useEffect, useState } from 'react';
import {
  Accordion,
  Modal,
  Button,
  Form,
  Table,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  getMenus,
  createMenu,
  updateMenu,
  toggleMenuActiveStatus,
} from '../../services/menuService';
import { GetAllFeaturesAsync } from '../../services/featureService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ===================== TYPES ===================== */

export interface MenuItem {
  menuID: number;
  menuName: string;
  menuKey: string;
  menuIcon: string;
  routeUrl: string;
  isActive: boolean;
  menuOrder: number;
  parentMenuID: number | null;
  featureID: number | null;
  featureName: string | null;
}

interface Feature {
  FeatureID: number;
  FeatureName: string;
  Description: string;
  FeatureType: string;
  IsActive: boolean;
}

/* ===================== COMPONENT ===================== */

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<Omit<MenuItem, 'menuID'>>({
    parentMenuID: null,
    menuName: '',
    menuKey: '',
    menuIcon: '',
    menuOrder: 0,
    routeUrl: '',
    isActive: true,
    featureID: null,
    featureName: null,
  });

  /* ===================== LOAD DATA ===================== */

  useEffect(() => {
    fetchMenus();
    fetchFeatures();
  }, []);

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

  /* ===================== MODAL HANDLERS ===================== */

  const handleShowModal = (menu?: MenuItem) => {
    setValidated(false);

    if (menu) {
      setEditingMenu(menu);
      const { menuID, ...rest } = menu;
      setFormData(rest);
    } else {
      setEditingMenu(null);
      setFormData({
        parentMenuID: null,
        menuName: '',
        menuKey: '',
        menuIcon: '',
        menuOrder: 0,
        routeUrl: '',
        isActive: true,
        featureID: null,
        featureName: null,
      });
    }

    setShowModal(true);
  };

  /* ===================== SAVE ===================== */

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setValidated(true);

    if (!e.currentTarget.checkValidity()) return;

    const confirmMessage = editingMenu
      ? 'Are you sure you want to update this menu?'
      : 'Are you sure you want to add this menu?';

    if (!window.confirm(confirmMessage)) return;

    try {
      const payload = {
        ...formData,
        parentMenuID: formData.parentMenuID ?? null,
        featureID: formData.featureID ?? null,
      };

      if (editingMenu) {
        const updatedMenu: MenuItem = {
          menuID: editingMenu.menuID,
          ...payload,
        };

        const success = await updateMenu(updatedMenu);
        if (success) {
          setMenus(prev =>
            prev.map(m =>
              m.menuID === updatedMenu.menuID ? updatedMenu : m
            )
          );
          toast.success('Menu updated successfully');
        } else {
          toast.error('Failed to update menu');
        }
      } else {
        const newId = await createMenu(payload);
        setMenus(prev => [...prev, { menuID: newId as number, ...payload }]);
        toast.success('Menu added successfully');
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Error saving menu');
    }
  };

  /* ===================== TOGGLE ACTIVE ===================== */

  const toggleActive = async (menuID: number) => {
    const target = menus.find(m => m.menuID === menuID);
    if (!target) return;

    const newStatus = !target.isActive;
    if (!window.confirm(newStatus ? 'Activate menu?' : 'Deactivate menu?'))
      return;

    try {
      const success = await toggleMenuActiveStatus(menuID, newStatus);
      if (success) {
        setMenus(prev =>
          prev.map(m =>
            m.menuID === menuID ? { ...m, isActive: newStatus } : m
          )
        );
        toast.success('Menu status updated');
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Error updating menu status');
    }
  };

  /* ===================== GROUP MENUS BY FEATURE ===================== */

  const groupMenusByFeature = (): Record<string, MenuItem[]> => {
    return menus.reduce((acc, menu) => {
      const featureName = features.find(f => f.FeatureID === menu.featureID)?.FeatureName || 'No Feature';
      if (!acc[featureName]) acc[featureName] = [];
      acc[featureName].push(menu);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  };

  /* ===================== JSX ===================== */

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between mb-4">
        <h4>Menu Management</h4>
        <Button onClick={() => handleShowModal()}>
          <i className="bi bi-plus-circle me-2" />
          Add Menu
        </Button>
      </div>

      <Accordion defaultActiveKey="0">
        {Object.entries(groupMenusByFeature()).map(([featureName, featureMenus], idx) => (
          <Accordion.Item eventKey={idx.toString()} key={featureName}>
            <Accordion.Header>{featureName}</Accordion.Header>
            <Accordion.Body>
              <Table bordered hover responsive striped>
                <thead>
                  <tr>
                    <th>Menu Name</th>
                    <th>Key</th>
                    <th>Route</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {featureMenus
                    .sort((a, b) => a.menuOrder - b.menuOrder)
                    .map(menu => (
                      <tr key={menu.menuID}>
                        <td style={{ paddingLeft: `${menu.parentMenuID ? 20 : 0}px` }}>
                          {menu.menuIcon && <i className={`bi ${menu.menuIcon} me-2`} />}
                          {menu.menuName}
                        </td>
                        <td>{menu.menuKey}</td>
                        <td>{menu.routeUrl}</td>
                        <td>{menu.menuOrder}</td>
                        <td>
                          <span className={`badge ${menu.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {menu.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <OverlayTrigger overlay={<Tooltip>Edit Menu</Tooltip>}>
                            <Button size="sm" variant="info" className="me-2" onClick={() => handleShowModal(menu)}>
                              <i className="bi bi-pencil-square" />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={<Tooltip>{menu.isActive ? 'Deactivate' : 'Activate'}</Tooltip>}>
                            <Button size="sm" variant={menu.isActive ? 'warning' : 'success'} onClick={() => toggleActive(menu.menuID)}>
                              <i className={`bi ${menu.isActive ? 'bi-toggle-off' : 'bi-toggle-on'}`} />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* ===================== MODAL ===================== */}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingMenu ? 'Edit Menu' : 'Add Menu'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <div className="row">
              {/* LEFT */}
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Menu Name</Form.Label>
                  <Form.Control
                    required
                    value={formData.menuName}
                    onChange={e => setFormData({ ...formData, menuName: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Menu Key</Form.Label>
                  <Form.Control
                    required
                    value={formData.menuKey}
                    onChange={e => setFormData({ ...formData, menuKey: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Route URL</Form.Label>
                  <Form.Control
                    required
                    value={formData.routeUrl}
                    onChange={e => setFormData({ ...formData, routeUrl: e.target.value })}
                  />
                </Form.Group>
              </div>

              {/* RIGHT */}
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Order</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    required
                    value={formData.menuOrder}
                    onChange={e => setFormData({ ...formData, menuOrder: parseInt(e.target.value) || 0 })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Parent Menu</Form.Label>
                  <Form.Select
                    value={formData.parentMenuID ?? ''}
                    onChange={e => setFormData({ ...formData, parentMenuID: e.target.value === '' ? null : parseInt(e.target.value) })}
                  >
                    <option value="">-- None --</option>
                    {menus.filter(m => m.menuID !== editingMenu?.menuID).map(m => (
                      <option key={m.menuID} value={m.menuID}>{m.menuName}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Feature</Form.Label>
                  <Form.Select
                    required
                    value={formData.featureID ?? ''}
                    onChange={e => setFormData({ ...formData, featureID: e.target.value === '' ? null : parseInt(e.target.value) })}
                  >
                    <option value="">-- Select Feature --</option>
                    {features.map(f => <option key={f.FeatureID} value={f.FeatureID}>{f.FeatureName}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    label="Active"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <Form.Group className="mb-3">
                  <Form.Label>Menu Icon (Bootstrap Icon class)</Form.Label>
                  <Form.Control
                    value={formData.menuIcon}
                    onChange={e => setFormData({ ...formData, menuIcon: e.target.value })}
                  />
                  <Form.Text className="text-muted">e.g. bi-house, bi-gear</Form.Text>
                </Form.Group>
              </div>
            </div>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">{editingMenu ? 'Update' : 'Save'}</Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Menus;
