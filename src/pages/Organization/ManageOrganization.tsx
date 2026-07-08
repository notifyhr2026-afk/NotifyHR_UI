import React, { useState } from "react";
import { Container, Nav, Tab } from "react-bootstrap";
import { useLocation } from "react-router-dom";

import OrganizationDetails from "../../components/Organization/OrganizationDetails";
import UsersSection from "../../components/Organization/UsersSection";
import LoginActivationSection from "../../components/Organization/LoginActivationSection";
import ApiKeyActivationSection from "../../components/Organization/ApiKeyActivationSection";

const TABS = [
  {
    key: "details",
    title: "Organization Details",
    icon: "bi bi-building-gear",
    component: <OrganizationDetails />,
  },
  {
    key: "users",
    title: "Admin Users",
    icon: "bi bi-people",
    component: <UsersSection />,
  },
  {
    key: "login",
    title: "Login Activation",
    icon: "bi bi-shield-lock",
    component: <LoginActivationSection />,
  },
  {
    key: "apikey",
    title: "API Key",
    icon: "bi bi-key",
    component: <ApiKeyActivationSection />,
  },
];

const ManageOrganization: React.FC = () => {
  const location = useLocation();
  const state = location.state as { tab?: string } | null;
  const [activeKey, setActiveKey] = useState(state?.tab || "details");

  return (
    <div className="page-container">
      {/* Page Header */}
      {/* <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <i className="bi bi-buildings" style={{ color: "var(--brand-primary, #0d6efd)" }} />
            Manage Organization
          </h4>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "0.8rem",
              opacity: 0.55,
            }}
          >
            Configure your organization settings, users, and integrations
          </p>
        </div>
      </div> */}

      {/* Tab Navigation */}
      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k || "details")}>
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: 12,
            border: "1px solid var(--border-color)",
            overflow: "hidden",
          }}
        >
          {/* Tabs Header */}
          <Nav
            variant="tabs"
            style={{
              padding: "8px 8px 0",
              borderBottom: "1px solid var(--border-color)",
              background: "var(--bg-color)",
              gap: 2,
            }}
          >
            {TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  eventKey={tab.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    border: "1px solid transparent",
                    borderBottom: "none",
                    borderRadius: "8px 8px 0 0",
                    color: "var(--text-color)",
                    opacity: activeKey === tab.key ? 1 : 0.6,
                    transition: "all 0.15s",
                  }}
                >
                  <i className={tab.icon} />
                  {tab.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Tab Content */}
          <Tab.Content style={{ padding: 24 }}>
            {TABS.map((tab) => (
              <Tab.Pane eventKey={tab.key} key={tab.key}>
                {tab.component}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </div>
      </Tab.Container>
    </div>
  );
};

export default ManageOrganization;
