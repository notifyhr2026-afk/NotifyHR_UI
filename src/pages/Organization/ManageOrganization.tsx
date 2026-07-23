import React, { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { useLocation } from "react-router-dom";

import OrganizationDetails from "../../components/Organization/OrganizationDetails";
import UsersSection from "../../components/Organization/UsersSection";
import LoginActivationSection from "../../components/Organization/LoginActivationSection";
import ApiKeyActivationSection from "../../components/Organization/ApiKeyActivationSection";
import "../../css/OrganizationSettings.css";

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
    <div className="org-settings-page">
      <div className="org-settings-card">
        <div className="org-settings-card-header">
          <div>
            <div className="org-settings-breadcrumb">
              <span>Settings</span>
              <span className="separator">›</span>
              <span>Organization</span>
            </div>
            <h1 className="org-settings-page-title">Organization Settings</h1>
            <p className="org-settings-page-subtitle">
              Basic company information, admin users, login access, and API
              settings for your organization.
            </p>
          </div>
        </div>

        <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k || "details")}> 
          <Nav className="org-settings-tabs">
            {TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  eventKey={tab.key}
                  className={`org-settings-tab ${activeKey === tab.key ? "active" : ""}`}
                >
                  <i className={tab.icon} style={{ fontSize: 20 }} />
                  {tab.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <Tab.Content className="org-settings-tab-panel">
            {TABS.map((tab) => (
              <Tab.Pane eventKey={tab.key} key={tab.key}>
                <div className="org-settings-section">
                  {tab.component}
                </div>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default ManageOrganization;
