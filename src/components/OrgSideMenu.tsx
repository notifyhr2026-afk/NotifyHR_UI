import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { GetByUserIDAsync } from "../services/menuService";

import NikuHRLogo from "./landing/NikuHRLogo";
import "../css/OrgSideMenu.css";

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

const SECTION_LABELS: Record<string, string> = {
  Dashboard: "Main",
  Employee: "People",
  Attendance: "Attendance",
  Leave: "Leave",
  Payroll: "Payroll",
  Shift: "Schedule",
  Helpdesk: "Support",
  Asset: "Resources",
  Recruitment: "Hiring",
  Performance: "Performance",
  Timesheet: "Time Tracking",
  Report: "Reports",
  Organization: "Admin",
  Feature: "System",
};

const getMenuSection = (name: string): string => {
  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return label;
  }
  return "";
};

const OrgSideMenu: React.FC<SideMenuProps> = ({ isOpen }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user?.userID;

  const isDark =
    typeof document !== "undefined" &&
    document.body.classList.contains("dark-mode");

  // Auto-close submenu when sidebar collapses
  useEffect(() => {
    if (isOpen) {
      setHoverIndex(null);
    } else {
      setOpenIndex(null);
    }
  }, [isOpen]);

  // Keep hover submenu in viewport
  useEffect(() => {
    if (!isOpen && hoverIndex !== null && sidebarRef.current) {
      const wrapperEls = sidebarRef.current.querySelectorAll(".menu-wrapper");
      const target = wrapperEls[hoverIndex] as HTMLElement | undefined;
      if (target) {
        const hoverMenus = target.querySelectorAll(".hover-menu");
        hoverMenus.forEach((hm) => {
          const hmRect = hm.getBoundingClientRect();
          const overflowBottom = hmRect.bottom - window.innerHeight;
          if (overflowBottom > 0) {
            (hm as HTMLElement).style.top = `${-overflowBottom - 10}px`;
          }
        });
      }
    }
  }, [hoverIndex, isOpen]);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const toggleSubMenu = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // Build feature-grouped menu
  const buildFeatureMenu = (items: MenuItem[]): MenuItem[] => {
    const featureMap = new Map<number, MenuItem>();
    const roots: MenuItem[] = [];

    items.forEach((item) => {
      if (item.featureID == null) return;

      if (!featureMap.has(item.featureID)) {
        featureMap.set(item.featureID, {
          menuID: -item.featureID,
          menuName: item.featureName || "Feature",
          menuKey: `feature-${item.featureID}`,
          menuIcon: item.menuIcon,
          menuOrder: 0,
          routeUrl: null,
          isActive: true,
          featureID: item.featureID,
          featureIcon: item.featureIcon,
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
      try {
        const data: MenuItem[] = await GetByUserIDAsync(userID);
        setMenu(buildFeatureMenu(data));
      } catch {
        // silently fail — menu will just be empty
      }
    };
    fetchMenu();
  }, [userID]);

  const renderSubMenuItems = (subItems: MenuItem[]) =>
    subItems.map((sub, subIdx) => (
      <li key={subIdx}>
        <Link
          to={sub.routeUrl || "#"}
          className={`submenu-link ${
            location.pathname === sub.routeUrl ? "active" : ""
          }`}
        >
          <i className={`bi ${sub.menuIcon}`} />
          <span>{sub.menuName}</span>
        </Link>
      </li>
    ));

  return (
    <nav
      ref={sidebarRef}
      className={`org-sidebar ${isOpen ? "expanded" : "collapsed"}`}
    >
      {/* LOGO */}
      <div className="sidebar-logo">
        <Link to="/dashboard" className="logo-link">
          <NikuHRLogo
            variant={isDark ? "dark" : "default"}
            showWordmark={isOpen}
          />
        </Link>
      </div>

      {/* MENU */}
      <div className="sidebar-menu">
        {menu.length === 0 ? (
          <div className="sidebar-empty">
            <i className="bi bi-menu-app" />
            {isOpen && <span>No menu items</span>}
          </div>
        ) : (
          <ul className="menu-list">
            {menu.map((item, idx) => {
              const hasSub = item.subMenu && item.subMenu.length > 0;

              const isActive =
                location.pathname === item.routeUrl ||
                item.subMenu?.some(
                  (s) => s.routeUrl === location.pathname
                );

              const Wrapper: any = hasSub ? "div" : Link;
              const wrapperProps = hasSub ? {} : { to: item.routeUrl };

              // Show section label when section changes
              const section = getMenuSection(item.menuName);
              const prevSection =
                idx > 0 ? getMenuSection(menu[idx - 1].menuName) : "";
              const showSectionLabel =
                section &&
                section !== prevSection &&
                isOpen;

              return (
                <React.Fragment key={idx}>
                  {/* {showSectionLabel && (
                    <li className="menu-section-label">{section}</li>
                  )} */}

                  <li
                    className="menu-wrapper"
                    onMouseEnter={() => {
                      if (!isOpen && hasSub) {
                        clearHoverTimer();
                        setHoverIndex(idx);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isOpen) {
                        // Delay dismiss so user can move to the flyout
                        clearHoverTimer();
                        hoverTimerRef.current = setTimeout(() => {
                          setHoverIndex(null);
                        }, 250);
                      }
                    }}
                  >
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        !isOpen && !hasSub ? (
                          <Tooltip>{item.menuName}</Tooltip>
                        ) : (
                          <></>
                        )
                      }
                    >
                      <Wrapper
                        {...wrapperProps}
                        className={`menu-item ${isActive ? "active" : ""}`}
                        onClick={() => hasSub && toggleSubMenu(idx)}
                      >
                        <i
                          className={`bi ${
                            item.featureIcon || item.menuIcon
                          } menu-icon`}
                        />

                        {isOpen && (
                          <span className="menu-label">{item.menuName}</span>
                        )}

                        {hasSub && isOpen && (
                          <i
                            className={`bi bi-chevron-right submenu-arrow ${
                              openIndex === idx ? "open" : ""
                            }`}
                          />
                        )}
                      </Wrapper>
                    </OverlayTrigger>

                    {/* Expanded submenu */}
                    {isOpen && hasSub && openIndex === idx && (
                      <ul className="submenu">
                        {renderSubMenuItems(item.subMenu!)}
                      </ul>
                    )}

                    {/* Hover flyout submenu (collapsed) — stays open while hovering on it */}
                    {!isOpen && hasSub && hoverIndex === idx && (
                      <ul
                        className="hover-menu"
                        onMouseEnter={clearHoverTimer}
                        onMouseLeave={() => setHoverIndex(null)}
                      >
                        {item.subMenu?.map((sub, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              to={sub.routeUrl || "#"}
                              className={`hover-link ${
                                location.pathname === sub.routeUrl
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => setHoverIndex(null)}
                            >
                              <i className={`bi ${sub.menuIcon}`} />
                              <span className="hover-label">{sub.menuName}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </div>

      {/* SIDEBAR FOOTER — collapse hint */}
      {isOpen && (
        <div className="sidebar-footer" title="Collapse sidebar">
          <i className="bi bi-chevron-left sidebar-footer-icon" />
          <span className="sidebar-footer-label">Collapse</span>
        </div>
      )}
    </nav>
  );
};

export default OrgSideMenu;
