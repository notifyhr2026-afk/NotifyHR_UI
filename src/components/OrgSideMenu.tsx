import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { GetByUserIDAsync } from "../services/menuService";

import mainlogo from "../img/Logo-blue.png";
import logo from "../img/Favicon.png";
import Faviconwhite from "../img/Favicon-white.png";
import logowhite from "../img/Logo-white.png";
import NikuHRLogo from "../components/landing/NikuHRLogo";
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

const OrgSideMenu: React.FC<SideMenuProps> = ({ isOpen }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user?.userID;

  const isDark =
    document.body.classList.contains("dark-mode");

  const currentLogo = isDark
    ? isOpen
      ? logowhite
      : Faviconwhite
    : isOpen
    ? mainlogo
    : logo;

  const toggleSubMenu = (index: number) => {
    setOpenIndex((prev) =>
      prev === index ? null : index
    );
  };

  useEffect(() => {
    if (isOpen) setHoverIndex(null);
  }, [isOpen]);

  const buildFeatureMenu = (
    items: MenuItem[]
  ): MenuItem[] => {
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

        roots.push(
          featureMap.get(item.featureID)!
        );
      }

      featureMap
        .get(item.featureID)
        ?.subMenu?.push(item);
    });

    return roots;
  };

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userID) return;

      const data: MenuItem[] =
        await GetByUserIDAsync(userID);

      setMenu(buildFeatureMenu(data));
    };

    fetchMenu();
  }, [userID]);

  return (
    <nav
      className={`org-sidebar ${
        isOpen ? "expanded" : "collapsed"
      }`}
    >
      <div className="sidebar-logo">
  <Link to="/dashboard" className="logo-link">
    
    {isOpen ? (
      <NikuHRLogo
        variant={isDark ? "dark" : "default"}
        showWordmark={true}
      />
    ) : (
      <NikuHRLogo
        variant={isDark ? "dark" : "default"}
        showWordmark={false}
      />
    )}

  </Link>
</div>

      <div className="sidebar-menu">
        <ul className="menu-list">
          {menu.map((item, idx) => {
            const hasSub =
              item.subMenu &&
              item.subMenu.length > 0;

            const isActive =
              location.pathname ===
                item.routeUrl ||
              item.subMenu?.some(
                (s) =>
                  s.routeUrl ===
                  location.pathname
              );

            const Wrapper: any = hasSub
              ? "div"
              : Link;

            const wrapperProps = hasSub
              ? {}
              : { to: item.routeUrl };

            return (
              <li
                key={idx}
                className="menu-wrapper"
                onMouseEnter={() =>
                  !isOpen &&
                  hasSub &&
                  setHoverIndex(idx)
                }
                onMouseLeave={() =>
                  !isOpen &&
                  setHoverIndex(null)
                }
              >
                <OverlayTrigger
                  placement="right"
                  overlay={
                    !isOpen ? (
                      <Tooltip>
                        {item.menuName}
                      </Tooltip>
                    ) : (
                      <></>
                    )
                  }
                >
                  <Wrapper
                    {...wrapperProps}
                    className={`menu-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() =>
                      hasSub &&
                      toggleSubMenu(idx)
                    }
                  >
                    <i
                      className={`bi ${
                        item.featureIcon ||
                        item.menuIcon
                      } menu-icon`}
                    />

                    {isOpen && (
                      <span className="menu-label">
                        {item.menuName}
                      </span>
                    )}

                    {hasSub && isOpen && (
                      <i
                        className={`bi bi-chevron-${
                          openIndex === idx
                            ? "down"
                            : "right"
                        } submenu-arrow`}
                      />
                    )}
                  </Wrapper>
                </OverlayTrigger>

                {isOpen &&
                  hasSub &&
                  openIndex === idx && (
                    <ul className="submenu">
                      {item.subMenu?.map(
                        (sub, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              to={
                                sub.routeUrl ||
                                "#"
                              }
                              className={`submenu-link ${
                                location.pathname ===
                                sub.routeUrl
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <i
                                className={`bi ${sub.menuIcon}`}
                              />
                              <span>
                                {
                                  sub.menuName
                                }
                              </span>
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  )}

                {!isOpen &&
                  hasSub &&
                  hoverIndex === idx && (
                    <ul className="hover-menu">
                      {item.subMenu?.map(
                        (sub, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              to={
                                sub.routeUrl ||
                                "#"
                              }
                              className="hover-link"
                            >
                              <i
                                className={`bi ${sub.menuIcon}`}
                              />
                              <span>
                                {
                                  sub.menuName
                                }
                              </span>
                            </Link>
                          </li>
                        )
                      )}
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
