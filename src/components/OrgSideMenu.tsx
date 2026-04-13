import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GetByUserIDAsync } from '../services/menuService';
import mainlogo from "../img/Logo-blue.png";
import logo from "../img/Favicon.png";
import Faviconwhite from "../img/Favicon-white.png";
import logowhite from "../img/Logo-white.png";

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
  featureIcon?: string | null;
  subMenu?: MenuItem[];
}

interface SideMenuProps {
  isOpen: boolean;
}

type MenuHoverEvent = React.MouseEvent<HTMLDivElement | HTMLAnchorElement>;

const OrgSideMenu: React.FC<SideMenuProps> = ({ isOpen }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userID = user?.userID;

  // 🌙 detect theme
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark-mode'));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleSubMenu = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    if (isOpen) setHoverIndex(null);
  }, [isOpen]);

  const buildFeatureMenu = (items: MenuItem[]): MenuItem[] => {
    const featureMap = new Map<number, MenuItem>();
    const roots: MenuItem[] = [];

    items.forEach(item => {
      if (item.featureID == null) return;

      if (!featureMap.has(item.featureID)) {
        featureMap.set(item.featureID, {
          menuID: -item.featureID,
          menuName: item.featureName || 'Feature',
          menuKey: 'feature-' + item.featureID,
          menuIcon: item.menuIcon,
          menuOrder: 0,
          routeUrl: null,
          isActive: true,
          featureID: item.featureID,
          featureIcon: item.featureIcon ?? null,
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

  // ✅ FIX: logo switching logic
  const currentLogo = isDark
  ? isOpen
    ? logowhite
    : Faviconwhite
  : isOpen
  ? mainlogo
  : logo;

  return (
    <nav
      style={{
        width: isOpen ? 250 : 60,
        transition: 'width 0.3s ease',
        height: '100vh',
        position: 'fixed',
        backgroundColor: isDark ? '#1f1f2f' : '#f0f4f8',
        color: isDark ? '#e4e6eb' : '#212529',
        borderRight: isDark ? '1px solid #333' : '1px solid rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: '57px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          padding: '0 1rem',
          backgroundColor: isDark ? '#1f1f2f' : '#f0f4f8',
          borderBottom: isDark ? '1px solid #333' : '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <img
            src={currentLogo}
            alt="Logo"
            style={{
              height: isOpen ? '50px' : '40px',
              transition: 'opacity 0.3s ease',
            }}
          />
        </Link>
      </div>

      {/* Menu */}
      <div style={{ overflowY: 'auto', height: '100%', paddingTop: '0.5rem' }}>
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
                  overlay={!isOpen ? <Tooltip>{item.menuName}</Tooltip> : <></>}
                >
                  <Wrapper
                    {...wrapperProps}
                    onClick={handleMainClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: isOpen ? '0.75rem 1rem' : '0.75rem 0',
                      cursor: 'pointer',
                      color: isDark ? '#e4e6eb' : '#212529',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      margin: '4px 6px',
                      transition: 'all 0.2s',
                      backgroundColor: isActive
                        ? isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(13,110,253,0.15)'
                        : 'transparent',
                    }}
                  >
                    <i
                      className={`bi ${item.featureIcon || item.menuIcon || 'bi-circle'} me-2`}
                      style={{
                        fontSize: '1.4rem',
                        minWidth: '24px',
                        textAlign: 'center',
                      }}
                    />
                    {isOpen && <span>{item.menuName}</span>}

                    {hasSub && isOpen && (
                      <i
                        className={`bi bi-chevron-${openIndex === idx ? 'down' : 'right'} ms-auto`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSubMenu(idx);
                        }}
                      />
                    )}
                  </Wrapper>
                </OverlayTrigger>

                {/* Expanded submenu */}
                {isOpen && hasSub && (openIndex === idx || hoverIndex === idx) && (
                  <ul style={{ paddingLeft: '1.5rem', listStyle: 'none' }}>
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
                              color: isDark ? '#e4e6eb' : '#212529',
                              backgroundColor: subActive
                                ? isDark
                                  ? 'rgba(255,255,255,0.08)'
                                  : 'rgba(13,110,253,0.15)'
                                : 'transparent',
                              textDecoration: 'none',
                              borderRadius: '6px',
                            }}
                          >
                            <i className={`bi ${sub.menuIcon || 'bi-circle'} me-2`} />
                            {sub.menuName}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Collapsed hover menu (RESTORED ✅) */}
                {!isOpen && hasSub && hoverIndex === idx && (
                  <ul
                    style={{
                      position: 'fixed',
                      top: 60 + idx * 48,
                      left: 60,
                      backgroundColor: isDark ? '#2a2a3d' : '#ffffff',
                      border: isDark ? '1px solid #333' : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      minWidth: '220px',
                      zIndex: 2000,
                    }}
                  >
                    {item.subMenu!.map((sub, sidx) => {
                      return (
                        <li key={sidx}>
                          <Link
                            to={sub.routeUrl || '#'}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.5rem 1rem',
                              color: isDark ? '#e4e6eb' : '#212529',
                              textDecoration: 'none',
                              borderRadius: '6px',
                            }}
                          >
                            <i className={`bi ${sub.menuIcon || 'bi-circle'} me-2`} />
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