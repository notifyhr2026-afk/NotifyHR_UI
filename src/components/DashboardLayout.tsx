import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import OrgSideMenu from "./OrgSideMenu";
import { useAuth } from "../auth/AuthContext";


import "../css/DashboardLayout.css"

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.body.classList.toggle("light-mode", !isDarkMode);

    localStorage.setItem(
      "theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const userRoles = JSON.parse(
    localStorage.getItem("userRoles") || "[]"
  );

  const hasEmployeeRole =
    userRoles.some(
      (r: any) =>
        r === "Employee" || r?.roleName === "Employee"
    );

  return (
    <div className="dashboard-layout">
      <OrgSideMenu isOpen={sidebarOpen} />

      <div
        className={`dashboard-main ${
          sidebarOpen ? "sidebar-open" : "sidebar-close"
        }`}
      >
        {/* TOPBAR */}

        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="menu-btn"
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
            >
              <i className="bi bi-list"></i>
            </button>

            <h5 className="org-name">
              {userData.organizationName ||
                "Organization"}
            </h5>
          </div>

          <div className="topbar-right">
            <span className="user-name">
              {userData.fullName}
            </span>

            <Dropdown align="end">
              <Dropdown.Toggle
                className="avatar-toggle"
                variant="light"
              >
                <div className="avatar-circle">
                  {getInitials(userData.fullName)}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-dropdown">
                <div className="dropdown-user">
                  <div className="avatar-large">
                    {getInitials(userData.fullName)}
                  </div>

                  <div>
                    <div className="fw-bold">
                      {userData.fullName}
                    </div>

                    <small>
                      {userData.email}
                    </small>
                  </div>
                </div>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={() =>
                    navigate("/ChangePassword")
                  }
                >
                  <i className="bi bi-lock me-2"></i>
                  Change Password
                </Dropdown.Item>

                {hasEmployeeRole && (
                  <Dropdown.Item
                    onClick={() =>
                      navigate(
                        "/career-personal"
                      )
                    }
                  >
                    <i className="bi bi-person-badge me-2"></i>
                    Career & Personal
                  </Dropdown.Item>
                )}

                <Dropdown.Divider />

                {/* <div className="theme-toggle">
                  <span>Theme</span>

                  <div
                    className="switch"
                    onClick={() =>
                      setIsDarkMode(
                        !isDarkMode
                      )
                    }
                  >
                    <div
                      className={`switch-thumb ${
                        isDarkMode
                          ? "dark"
                          : ""
                      }`}
                    />
                  </div>
                </div> 
                <Dropdown.Divider />
                */}

                

                <Dropdown.Item
                  className="text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* CONTENT */}

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;