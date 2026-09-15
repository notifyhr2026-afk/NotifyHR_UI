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
  isDarkMode: boolean;
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
  Organization: "HR",
  Feature: "System",
};

const getMenuSection = (name: string): string => {
  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return label;
  }
  return "";
};

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

const OrgSideMenu: React.FC<SideMenuProps> = ({ isOpen, isDarkMode }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user?.userID;

  useEffect(() => {
    if (isOpen) {
      setHoverIndex(null);
    } else {
      setOpenIndex(null);
    }
  }, [isOpen]);

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

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userID) return;
      try {
        const data: MenuItem[] = await GetByUserIDAsync(userID);
        setMenu(buildFeatureMenu(data));
      } catch {
        // Menu stays empty on failure
      }
    };
    fetchMenu();
  }, [userID]);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const toggleSubMenu = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const renderSubMenuItems = (subItems: MenuItem[]) =>
    subItems.map((sub) => (
      <li key={sub.menuID}>
        <Link
          to={sub.routeUrl || "#"}
          className={`submenu-link ${
            location.pathname === sub.routeUrl ? "active" : ""
          }`}
        >
          <i className={`bi ${sub.menuIcon}`} aria-hidden="true" />
          <span>{sub.menuName}</span>
        </Link>
      </li>
    ));

  return (
    <nav
      ref={sidebarRef}
      className={`org-sidebar ${isOpen ? "expanded" : "collapsed"}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-logo">
        <Link to="/dashboard" className="logo-link" aria-label="Go to dashboard">
          <NikuHRLogo
            variant={isDarkMode ? "dark" : "default"}
            showWordmark={isOpen}
          />
        </Link>
      </div>

      <div className="sidebar-menu scrollable-menu">
        {menu.length === 0 ? (
          <div className="sidebar-empty">
            <i className="bi bi-menu-app" aria-hidden="true" />
            {isOpen && <span>No menu items</span>}
          </div>
        ) : (
          <ul className="menu-list">
            {menu.map((item, idx) => {
              const hasSub = item.subMenu && item.subMenu.length > 0;

              const isActive =
                location.pathname === item.routeUrl ||
                item.subMenu?.some((s) => s.routeUrl === location.pathname);

              const section = getMenuSection(item.menuName);
              const prevSection =
                idx > 0 ? getMenuSection(menu[idx - 1].menuName) : "";
              const showSectionLabel =
                section && section !== prevSection && isOpen;

              const menuIcon = item.featureIcon || item.menuIcon;

              return (
                <React.Fragment key={item.menuID}>
                  {showSectionLabel && (
                    <li className="menu-section-label">{section}</li>
                  )}

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
                        clearHoverTimer();
                        hoverTimerRef.current = setTimeout(() => {
                          setHoverIndex(null);
                        }, 250);
                      }
                    }}
                  >
                    {hasSub ? (
                      <button
                        type="button"
                        className={`menu-item ${isActive ? "active" : ""}`}
                        onClick={() => toggleSubMenu(idx)}
                        aria-expanded={openIndex === idx}
                      >
                        <span className="menu-icon-wrap" aria-hidden="true">
                          <i className={`bi ${menuIcon} menu-icon`} />
                        </span>
                        {isOpen && (
                          <span className="menu-label">{item.menuName}</span>
                        )}
                        {isOpen && (
                          <i
                            className={`bi bi-chevron-down submenu-arrow ${
                              openIndex === idx ? "open" : ""
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      <OverlayTrigger
                        placement="right"
                        overlay={
                          !isOpen ? (
                            <Tooltip>{item.menuName}</Tooltip>
                          ) : (
                            <></>
                          )
                        }
                      >
                        <Link
                          to={item.routeUrl || "#"}
                          className={`menu-item ${isActive ? "active" : ""}`}
                        >
                          <span className="menu-icon-wrap" aria-hidden="true">
                            <i className={`bi ${menuIcon} menu-icon`} />
                          </span>
                          {isOpen && (
                            <span className="menu-label">{item.menuName}</span>
                          )}
                        </Link>
                      </OverlayTrigger>
                    )}

                    {isOpen && hasSub && openIndex === idx && (
                      <ul className="submenu">{renderSubMenuItems(item.subMenu!)}</ul>
                    )}

                    {!isOpen && hasSub && hoverIndex === idx && (
                      <ul
                        className="hover-menu"
                        onMouseEnter={clearHoverTimer}
                        onMouseLeave={() => setHoverIndex(null)}
                      >
                        <li className="hover-menu-title">{item.menuName}</li>
                        {item.subMenu?.map((sub) => (
                          <li key={sub.menuID}>
                            <Link
                              to={sub.routeUrl || "#"}
                              className={`hover-link ${
                                location.pathname === sub.routeUrl ? "active" : ""
                              }`}
                              onClick={() => setHoverIndex(null)}
                            >
                              <i className={`bi ${sub.menuIcon}`} aria-hidden="true" />
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
    </nav>
  );
};

export default OrgSideMenu;
