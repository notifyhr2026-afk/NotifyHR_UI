import React from "react";
import { Container, Accordion } from "react-bootstrap";

// Import all section components
import OrganizationDetails from "../../components/Organization/OrganizationDetails";
import UsersSection from "../../components/Organization/UsersSection";
import FeaturesSection from "../../components/Organization/FeaturesSection";
import AssignRolesSection from "../../components/Organization/AssignRolesSection";
import ManageRolePermissionsSection from "../../components/Organization/ManageRolePermissionsSection";
import SubscriptionInfoSection from "../../components/Organization/SubscriptionInfoSection";
import InvoiceInfoSection from "../../components/Organization/InvoiceInfoSection";
import PaymentInfoSection from "../../components/Organization/PaymentInfoSection";
import AssignMenu from "../../components/Organization/AssignMenu";

const ManageOrganization: React.FC = () => {
  
  // Reusable config for all sections
  const sections = [
    { key: "0", title: "Organization Details", component: <OrganizationDetails /> },
    { key: "1", title: "Users", component: <UsersSection /> },
    //{ key: "2", title: "Features", component: <FeaturesSection /> },
    // { key: "3", title: "Assign Roles", component: <AssignRolesSection /> },
    // { key: "4", title: "Manage Role Permissions", component: <ManageRolePermissionsSection /> },
    { key: "5", title: "Subscription Info", component: <SubscriptionInfoSection /> },
    { key: "6", title: "Invoice Info", component: <InvoiceInfoSection /> },
    { key: "7", title: "Payment Info", component: <PaymentInfoSection /> },
    // { key: "8", title: "Assign Menu", component: <AssignMenu /> },
  ];

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Manage - Organizations</h2>

      <Accordion defaultActiveKey="0" flush>
        {sections.map(section => (
          <Accordion.Item eventKey={section.key} key={section.key}>
            <Accordion.Header>{section.title}</Accordion.Header>
            <Accordion.Body>{section.component}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
};

export default ManageOrganization;
