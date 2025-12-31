import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface MenuItem {
  label: string;
  link?: string;
  icon?: string;
  subMenu?: MenuItem[];
}

interface SideMenuProps {
  isOpen: boolean;
}

const colors = {
  sidebarBg: '#f5faff',
  headerBg: '#e0f2ff',
  menuActiveBg: '#c6e6ff',
  submenuBg: '#e8f4ff',
  submenuHoverBg: '#d4edff',
  activeText: '#003366',
  defaultText: '#004085',
};

const menuItems: MenuItem[] = [
  {
    label: 'System Admin',
    icon: 'bi-sourceforge',
    subMenu: [
      { label: 'Organization', link: '/Organizations', icon: 'bi bi-beaker' }
    ],
  },
  {
    label: 'Organization Level',
    icon: 'bi-building',
    subMenu: [     
      { label: 'Organization', link: '/Organization', icon: 'bi bi-star' },
      { label: 'Branches', link: '/Branches', icon: 'bi bi-git' },
      { label: 'Divisions', link: '/Divisions', icon: 'bi bi-bezier2' },      
      { label: 'Departments', link: '/Departments', icon: 'bi bi-collection' },
      { label: 'AssignRoles', link: '/AssignRoles', icon: 'bi bi-key-fill' },
      { label: 'Positions', link: '/Positions', icon: 'bi bi-person-rolodex' },
      { label: 'Holidays', link: '/Holidays', icon: 'bi bi-airplane' },
      { label: 'Leave Policies', link: '/LeavePolicies', icon: 'bi bi-calendar' },
    ],
  },
  {
    label: 'Manage Master Data',
    icon: 'bi-kanban',
    subMenu: [
      { label: 'Menus', link: '/menus', icon: 'bi-list-check' },
      { label: 'Permissions', link: '/permissions', icon: 'bi-shield-lock' },
    ],
  },
  {
    label: 'Employee Management',
    icon: 'bi-people',
    subMenu: [
      { label: 'Users', link: '/Users', icon: 'bi bi-person-gear' },
      { label: 'Employee List', link: '/EmployeeList', icon: 'bi-person-arms-up' },
      { label: 'My Leaves', link: '/ApplyLeave', icon: 'bi-person-add' },
      { label: 'Employee Clock', link: '/EmployeeClock', icon: 'bi-clock' },
      
    ],
  },  
  {
    label: 'Asset Management',
    icon: 'bi-cart-plus',
    subMenu: [
      { label: 'Vendors', link: '/VendorDetails', icon: 'bi-card-list' },
      { label: 'Asset List', link: '/AssetList', icon: 'bi-snow' },
      { label: 'Asset Tracking', link: '/AssetTracking', icon: 'bi-thunderbolt' },
      { label: 'Asset Assignment', link: '/AssetAssignment', icon: 'bi-ticket' },
    ],
  },
  {
    label: 'Payroll',
    icon: 'bi-paypal',
    subMenu: [
      { label: 'Profile Settings', link: '/profile-settings', icon: 'bi-currency-rupee' }
    ],
  },
  { label: 'Reports', link: '/reports', icon: 'bi-bar-chart-line' },
  {
    label: 'Settings',
    icon: 'bi-gear',
    subMenu: [
      { label: 'Profile Settings', link: '/profile-settings', icon: 'bi-person-circle' },
      { label: 'System Settings', link: '/system-settings', icon: 'bi-tools' },
    ],
  },
];

const SideMenu: React.FC<SideMenuProps> = ({ isOpen }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const location = useLocation();

  const toggleSubMenu = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    if (isOpen) setHoverIndex(null);
  }, [isOpen]);

  return (
    <nav
      style={{
        width: isOpen ? 250 : 60,
        transition: 'width 0.3s ease',
        height: '100vh',
        position: 'fixed',
        backgroundColor: colors.sidebarBg,
        borderRight: '1px solid #e0e0e0',
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo / Header */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'start' : 'center',
          padding: '0 1rem',
          backgroundColor: colors.headerBg,
          borderBottom: '1px solid #d0e0e0',
          flexShrink: 0,
        }}
      >
        {isOpen ? (
          <Link to="/dashboard">
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.activeText }}>Welcome</span>
          </Link>
        ) : (
          <Link to="/dashboard">
            <i className={`bi bi-house-door`} style={{ fontSize: '1.5rem', color: colors.activeText }} />
          </Link>
        )}
      </div>

      {/* Scrollable Menu */}
      <div
        className="scrollable-menu"
        style={{
          overflowY: 'auto',
          height: 'calc(100vh - 56px)',
          paddingTop: '0.5rem',
          flexGrow: 1,
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.link || (item.subMenu?.some(sub => sub.link === location.pathname));
            return (
              <li
                key={idx}
                style={{ position: 'relative' }}
                onMouseEnter={() => !isOpen && item.subMenu && setHoverIndex(idx)}
                onMouseLeave={() => !isOpen && setHoverIndex(null)}
              >
                <OverlayTrigger
                  placement="right"
                  overlay={!isOpen ? <Tooltip id={`tooltip-${idx}`}>{item.label}</Tooltip> : <></>}
                >
                  <div
                    onClick={() => item.subMenu ? toggleSubMenu(idx) : null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: isOpen ? '0.75rem 1rem' : '0.75rem 0',
                      cursor: 'pointer',
                      backgroundColor: isActive ? colors.menuActiveBg : 'transparent',
                      color: isActive ? colors.activeText : colors.defaultText,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <i className={`bi ${item.icon || 'bi-circle'} me-2`} style={{ fontSize: '1.5rem', width: isOpen ? 'auto' : '100%', textAlign: 'center' }} />
                    {isOpen && <span style={{ fontSize: '1rem' }}>{item.label}</span>}
                    {item.subMenu && isOpen && (
                      <i className={`bi bi-chevron-${openIndex === idx ? 'down' : 'right'} ms-auto`} />
                    )}
                  </div>
                </OverlayTrigger>

                {/* Submenu - Expanded */}
                {isOpen && item.subMenu && openIndex === idx && (
                  <ul style={{ paddingLeft: '1.5rem', listStyleType: 'none', margin: 0 }}>
                    {item.subMenu.map((sub, sidx) => {
                      const subActive = location.pathname === sub.link;
                      return (
                        <li key={sidx} style={{ display: 'flex', alignItems: 'center' }}>
                          <Link
                            to={sub.link || '#'}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.5rem 1rem',
                              color: subActive ? colors.activeText : colors.defaultText,
                              backgroundColor: subActive ? colors.menuActiveBg : colors.submenuBg,
                              textDecoration: 'none',
                              borderRadius: '4px',
                              width: '100%',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!subActive) e.currentTarget.style.backgroundColor = colors.submenuHoverBg;
                            }}
                            onMouseLeave={(e) => {
                              if (!subActive) e.currentTarget.style.backgroundColor = colors.submenuBg;
                            }}
                          >
                            <i className={`bi ${sub.icon || 'bi-circle'} me-2`} style={{ fontSize: '1rem' }} />
                            {sub.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Submenu - Collapsed Hover */}
                {!isOpen && item.subMenu && hoverIndex === idx && (
                  <ul
                    style={{
                      position: 'fixed',
                      top: 56 + idx * 48,
                      left: 60,
                      backgroundColor: 'white',
                      border: '1px solid #d0d0d0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      borderRadius: '4px',
                      padding: '0.5rem 0',
                      minWidth: '200px',
                      zIndex: 2000,
                      maxHeight: '70vh',
                      overflowY: 'auto',
                    }}
                  >
                    {item.subMenu.map((sub, sidx) => {
                      const subActive = location.pathname === sub.link;
                      return (
                        <li key={sidx}>
                          <Link
                            to={sub.link || '#'}
                            style={{
                              display: 'flex', // flex for icon + label
                              alignItems: 'center',
                              padding: '0.5rem 1rem',
                              color: subActive ? colors.activeText : colors.defaultText,
                              backgroundColor: subActive ? colors.menuActiveBg : 'transparent',
                              textDecoration: 'none',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!subActive) e.currentTarget.style.backgroundColor = colors.submenuHoverBg;
                            }}
                            onMouseLeave={(e) => {
                              if (!subActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <i className={`bi ${sub.icon || 'bi-circle'} me-2`} style={{ fontSize: '1rem' }} />
                            {sub.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default SideMenu;
