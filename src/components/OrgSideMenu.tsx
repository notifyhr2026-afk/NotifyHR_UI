import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GetByUserIDAsync } from '../services/menuService';
import mainlogo from '../img/MainLogo.jpg';
import logo from '../img/Logo.jpg';

interface MenuItem {
  menuID: number;
  parentMenuID?: number | null;
  menuName: string;
  menuKey: string;
  menuIcon: string;
  menuOrder: number;
  routeUrl: string | null;
  isActive: boolean;
  featureID: number | null;
  featureName?: string | null;
  label?: string;
  icon?: string;
  link?: string | null;
  subMenu?: MenuItem[];
  featureIcon?: string | null; // ✅ optional
}

interface SideMenuProps {
  isOpen: boolean;
}

const colors = {
  sidebarBg: '#ffffff',
  headerBg: '#f0f4f8',
  menuActiveBg: '#e0f2ff',
  submenuBg: '#f8f9fa',
  submenuHoverBg: '#d0e9ff',
  activeText: '#0d6efd',
  defaultText: '#495057',
  hoverText: '#0a58ca',
};

type MenuHoverEvent = React.MouseEvent<HTMLDivElement | HTMLAnchorElement>;

const OrgSideMenu: React.FC<SideMenuProps> = ({ isOpen }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userID = user?.userID;

  const toggleSubMenu = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    if (isOpen) setHoverIndex(null);
  }, [isOpen]);

  // Build Menu Tree based on FeatureID
  const buildFeatureMenu = (items: MenuItem[]): MenuItem[] => {
    const featureMap = new Map<number, MenuItem>();
    const roots: MenuItem[] = [];

    items.forEach(item => {
      if (item.featureID == null) return;

      if (!featureMap.has(item.featureID)) {
        // Create root feature menu item
        featureMap.set(item.featureID, {
          menuID: -item.featureID,
          menuName: item.featureName || 'Feature',
          menuKey: 'feature-' + item.featureID,
          menuIcon: item.menuIcon,
          menuOrder: 0,
          routeUrl: null,
          isActive: true,
          featureID: item.featureID,
          featureIcon: item.featureIcon ?? null, // only for display
          subMenu: [],
        });
        roots.push(featureMap.get(item.featureID)!);
      }
      featureMap.get(item.featureID)?.subMenu?.push(item);
    });

    return roots;
  };

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userID) return;
      const data: MenuItem[] = await GetByUserIDAsync(userID);
      const grouped = buildFeatureMenu(data);
      setMenu(grouped);
    };
    fetchMenu();
  }, [userID]);

  return (
    <nav
      style={{
        width: isOpen ? 250 : 60,
        transition: 'width 0.3s ease',
        height: '100vh',
        position: 'fixed',
        backgroundColor: colors.sidebarBg,
        borderRight: '1px solid #dee2e6',
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Logo / Header */}
      <div
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          padding: '0 1rem',
          backgroundColor: colors.headerBg,
          borderBottom: '1px solid #dee2e6',
          flexShrink: 0,
        }}
      >
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          {isOpen ? (
            <img src={mainlogo} alt="Main Logo" style={{ height: '50px', transition: 'all 0.3s' }} />
          ) : (
            <img src={logo} alt="Logo" style={{ height: '40px', transition: 'all 0.3s' }} />
          )}
        </Link>
      </div>

      {/* Scrollable Menu */}
      <div
        style={{
          overflowY: 'auto',
          height: 'calc(100vh - 60px)',
          paddingTop: '0.5rem',
          flexGrow: 1,
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menu.map((item, idx) => {
            const hasSub = Array.isArray(item.subMenu) && item.subMenu.length > 0;
            const isActive =
              location.pathname === item.routeUrl ||
              (hasSub && item.subMenu!.some(sub => sub.routeUrl === location.pathname));

            const Wrapper: any = hasSub ? 'div' : Link;
            const wrapperProps = hasSub ? {} : { to: item.routeUrl };

            const handleMainClick = (e: MenuHoverEvent) => {
              if (hasSub) {
                e.preventDefault();
                e.stopPropagation();
                toggleSubMenu(idx);
              }
            };

            return (
              <li
                key={idx}
                onMouseEnter={() => !isOpen && hasSub && setHoverIndex(idx)}
                onMouseLeave={() => !isOpen && setHoverIndex(null)}
                style={{ position: 'relative' }}
              >
                <OverlayTrigger
                  placement="right"
                  overlay={!isOpen ? <Tooltip id={`tip-${idx}`}>{item.menuName}</Tooltip> : <></>}
                >
                  <Wrapper
                    {...wrapperProps}
                    onClick={handleMainClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: isOpen ? '0.75rem 1rem' : '0.75rem 0',
                      cursor: 'pointer',
                      backgroundColor: isActive ? colors.menuActiveBg : 'transparent',
                      color: isActive ? colors.activeText : colors.defaultText,
                      textDecoration: 'none',
                      borderRadius: '8px',
                      margin: '4px 6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e: MenuHoverEvent) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.color = colors.hoverText;
                    }}
                    onMouseLeave={(e: MenuHoverEvent) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = isActive ? colors.activeText : colors.defaultText;
                    }}
                  >
                    {/* ✅ Use featureIcon if available */}
                    <i
                      className={`bi ${item.featureIcon || item.menuIcon || 'bi-circle-fill'} me-2`}
                      style={{
                        fontSize: '1.4rem',
                        width: isOpen ? 'auto' : '100%',
                        textAlign: 'center',
                        minWidth: '24px',
                      }}
                    />
                    {isOpen && <span style={{ fontWeight: 500 }}>{item.menuName}</span>}
                    {hasSub && isOpen && (
                      <i
                        className={`bi bi-chevron-${openIndex === idx ? 'down' : 'right'} ms-auto`}
                        style={{ fontSize: '1rem', transition: 'transform 0.2s' }}
                        onClick={(e: MenuHoverEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubMenu(idx);
                        }}
                      />
                    )}
                  </Wrapper>
                </OverlayTrigger>

                {/* Expanded Submenu */}
                {isOpen && hasSub && (openIndex === idx || hoverIndex === idx) && (
                  <ul style={{ paddingLeft: '1.5rem', listStyle: 'none', margin: 0 }}>
                    {item.subMenu!.map((sub, sidx) => {
                      const subActive = location.pathname === sub.routeUrl;
                      return (
                        <li key={sidx}>
                          <Link
                            to={sub.routeUrl || '#'}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.5rem 1rem',
                              color: subActive ? colors.activeText : colors.defaultText,
                              backgroundColor: subActive ? colors.menuActiveBg : colors.submenuBg,
                              textDecoration: 'none',
                              borderRadius: '6px',
                              margin: '3px 0',
                              transition: 'all 0.2s',
                            }}
                          >
                            <i className={`bi ${sub.menuIcon || 'bi-circle'} me-2`} style={{ fontSize: '1rem' }} />
                            {sub.menuName}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Hover Submenu when Sidebar is Collapsed */}
                {!isOpen && hasSub && hoverIndex === idx && (
                  <ul
                    style={{
                      position: 'fixed',
                      top: 60 + idx * 48,
                      left: 60,
                      backgroundColor: '#ffffff',
                      border: '1px solid #dee2e6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      borderRadius: '8px',
                      padding: '0.5rem 0',
                      minWidth: '220px',
                      zIndex: 2000,
                      listStyle: 'none',
                      margin: 0,
                    }}
                  >
                    {item.subMenu!.map((sub, sidx) => {
                      const subActive = location.pathname === sub.routeUrl;
                      return (
                        <li key={sidx}>
                          <Link
                            to={sub.routeUrl || '#'}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.5rem 1rem',
                              color: subActive ? colors.activeText : colors.defaultText,
                              backgroundColor: subActive ? colors.menuActiveBg : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              borderRadius: '6px',
                              margin: '3px 4px',
                            }}
                            onMouseEnter={(e: MenuHoverEvent) => {
                              if (!subActive) e.currentTarget.style.backgroundColor = colors.submenuHoverBg;
                              e.currentTarget.style.color = colors.hoverText;
                            }}
                            onMouseLeave={(e: MenuHoverEvent) => {
                              if (!subActive) e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = subActive ? colors.activeText : colors.defaultText;
                            }}
                          >
                            <i className={`bi ${sub.menuIcon || 'bi-circle'} me-2`} style={{ fontSize: '1rem' }} />
                            {sub.menuName}
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

export default OrgSideMenu;
