import React, { useState } from "react";
import {
  Accordion,
  Table,
  Form,
  Row,
  Col,
  Button,
  Container,
  Modal,
} from "react-bootstrap";
import { useEffect } from "react";
import OrgleaveTypesService from "../../services/OrgleaveTypesService";
import leavePolicyService from "../../services/leavePolicyService";
import OrgLeaveType from "../../types/LeaveType";
import LeavePolicy from "../../types/LeavePolicy";
import OrgLeavePolicy from "../../types/OrgLeavePolicy";

// ------------------------------------------------------

const OrganizationLeavePolicies: React.FC = () => {  
  const [orgLeaveTypes, setOrgLeaveTypes] = useState<OrgLeaveType[]>([]);
  const [systemLeavePolicies, setSystemLeavePolicies] = useState<LeavePolicy[]>([]);
  const [orgLeavePolicies, setOrgLeavePolicies] = useState<OrgLeavePolicy[]>([]);
  // Leave Types Tab State
// Get organizationID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;
useEffect(() => {
  const fetchLeaveTypes = async () => {
    if (!organizationID) {
      console.error("Organization ID is missing");
      return;
    }

    try {
      const data = await OrgleaveTypesService.getOrgLeaveLeaveTypes(organizationID);
      setOrgLeaveTypes(data);
    } catch (error) {
      console.error("Failed to load leave types for dropdowns", error);
    }
  };

  fetchLeaveTypes();
}, [organizationID]);

useEffect(() => {
  const fetchOrgLeavePolicies = async () => {
    if (!organizationID) {
      console.error("Organization ID is missing");
      return;
    }

    try {
      const data = await leavePolicyService.getOrgLeavePolicy(organizationID);
      setOrgLeavePolicies(data);
    } catch (error) {
      console.error("Failed to load leave types for dropdowns", error);
    }
  };

  fetchOrgLeavePolicies();
}, [organizationID]);

useEffect(() => {
  const fetchSystemPolicies = async () => {
    try {
      const data = await leavePolicyService.getLeavePolicy();
      setSystemLeavePolicies(data);
    } catch (error) {
      console.error("Failed to load system leave policies", error);
    }
  };

  if (organizationID) {
    fetchSystemPolicies();
  }
}, [organizationID]);



const handleToggleStatus = async (lt: OrgLeaveType) => {
  if (!organizationID) return;

  const confirmMsg = lt.IsActive
    ? "Are you sure you want to deactivate this leave type?"
    : "Are you sure you want to activate this leave type?";

  if (!window.confirm(confirmMsg)) return;

  try {
    const payload: OrgLeaveType = {
      ...lt,
      OrganizationID: organizationID,
      IsActive: !lt.IsActive,
      CreatedBy: 'Admin',
      OrgLeaveTypeID: lt.OrgLeaveTypeID
    };

    await OrgleaveTypesService.postOrgLeaveTypeByAsync(payload);

    // 🔥 Don't depend on API return
    setOrgLeaveTypes((prev) =>
      prev.map((item) =>
        item.OrgLeaveTypeID === lt.OrgLeaveTypeID
          ? { ...item, IsActive: !lt.IsActive }
          : item
      )
    );
  } catch (error) {
    console.error("Failed to update leave type status", error);
  }
};
  // Organization Policies
  const [orgPolicies, setOrgPolicies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editID, setEditID] = useState<number | null>(null);

  const [policyForm, setPolicyForm] = useState({
    LeaveTypeID: "",
    LeavePolicyID: "",
    TotalAnnualLeaves: "",
    MaxCarryForward: "",
    EffectiveFrom: "",
    EffectiveTo: "",
    Encashable: false,
    AllowNegativeBalance: false,
    IsActive: true,
    CreatedBy:"Admin",
  });



  const openEditModal = (row: any) => {
    setEditID(row.OrgLeavePolicyID || null);

    setPolicyForm({
      LeaveTypeID: String(row.LeaveTypeID),
      LeavePolicyID: String(row.LeavePolicyID),
      TotalAnnualLeaves: String(row.TotalAnnualLeaves),
      MaxCarryForward: String(row.MaxCarryForward),
      EffectiveFrom: row.EffectiveFrom || "",
      EffectiveTo: row.EffectiveTo || "",
      Encashable: row.Encashable,
      AllowNegativeBalance: row.AllowNegativeBalance,
      IsActive: row.IsActive,
      CreatedBy:"Admin",
    });

    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFormChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type } = e.target;

    setPolicyForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSavePolicy = async () => {
  const sysPolicy = systemLeavePolicies.find(
    (p) => p.LeavePolicyID === Number(policyForm.LeavePolicyID)
  );

  if (!sysPolicy) {
    alert("Select System Leave Policy");
    return;
  }

  const record = {
    OrganizationID:organizationID,
    OrgLeavePolicyID: editID ? editID : orgPolicies.length + 1,
    PolicyName: sysPolicy.PolicyName,
    LeaveTypeID: Number(policyForm.LeaveTypeID),
    LeavePolicyID: Number(policyForm.LeavePolicyID),
    TotalAnnualLeaves: policyForm.TotalAnnualLeaves,
    MaxCarryForward: policyForm.MaxCarryForward,
    EffectiveFrom: policyForm.EffectiveFrom || null,
    EffectiveTo: policyForm.EffectiveTo || null,
    Encashable: policyForm.Encashable,
    AllowNegativeBalance: policyForm.AllowNegativeBalance,
    IsActive: policyForm.IsActive,
    CreatedBy:"Admin",
  };

  try {
    // API call
    const response = await leavePolicyService.PostOrgLeavePolicyByAsync(record);

    if (editID) {
      setOrgPolicies((prev) =>
        prev.map((p) => (p.OrgLeavePolicyID === editID ? response : p))
      );
    } else {
      setOrgPolicies((prev) => [...prev, response]);
    }

    closeModal();
  } catch (error) {
    console.error("Error saving leave policy:", error);
    alert("Failed to save policy");
  }
};

const deletePolicy = async (id: number) => {
  if (!window.confirm("Delete this policy?")) return;

  try {
    await leavePolicyService.DeleteOrgLeavePolicyByAsync(id);

    setOrgPolicies((prev) =>
      prev.filter((p) => p.OrgLeavePolicyID !== id)
    );
  } catch (error) {
    console.error("Error deleting policy:", error);
    alert("Failed to delete policy");
  }
};

  // ---------- Filter for All Policies Tab ----------
  const [filterLeaveType, setFilterLeaveType] = useState("");

  return (
    <Container className="mt-5">
      <h3>Manage Leave Policies</h3>
      <Accordion defaultActiveKey="0">

        {/* ---------- 1. Leave Types Tab ---------- */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Leave Types</Accordion.Header>
          <Accordion.Body>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orgLeaveTypes.map((lt) => (
                  <tr key={lt.LeaveTypeID}>
                    <td>{lt.LeaveTypeName}</td>
                    <td>{lt.Description}</td>
                    <td>
                      <Button
                      size="sm"
                      variant={lt.IsActive ? "danger" : "success"}
                      onClick={() => handleToggleStatus(lt)}
                    >
                      {lt.IsActive ? "Deactivate" : "Activate"}
                    </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>

        {/* ---------- 2. Organization Leave Policies ---------- */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Organization Leave Policies</Accordion.Header>
          <Accordion.Body>
            <Table bordered hover size="sm" className="mt-3">
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Leave Type</th>
                  <th>Total</th>
                  <th>Carry</th>
                  <th>Effective From</th>
                  <th>Effective To</th>
                  <th>Encash</th>
                  <th>-Ve</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orgLeavePolicies.map((p) => {
                  const type = orgLeaveTypes.find(
                    (t) => t.LeaveTypeID === p.LeaveTypeID
                  );

                  return (
                    <tr key={p.OrgLeavePolicyID}>
                      <td>{p.PolicyName}</td>
                      <td>{type?.LeaveTypeName}</td>
                      <td>{p.TotalAnnualLeaves}</td>
                      <td>{p.MaxCarryForward}</td>
                      <td>{p.EffectiveFrom || "-"}</td>
                      <td>{p.EffectiveTo || "-"}</td>
                      <td>{p.Encashable ? "✔️" : "❌"}</td>
                      <td>{p.AllowNegativeBalance ? "✔️" : "❌"}</td>
                      <td>{p.IsActive ? "✔️" : "❌"}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deletePolicy(p.OrgLeavePolicyID)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>

        {/* ---------- 3. All Leave Policies ---------- */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Manage Leave Policies</Accordion.Header>
          <Accordion.Body>
            <Row className="mb-3">
             <Col md={4}>
              <Form.Label>Filter by Leave Type</Form.Label>
              <Form.Select
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
              >
                <option value="">- Select Leave Type - </option>

                {orgLeaveTypes
                  .filter((lt) => lt.IsActive) // 👈 only active
                  .map((lt) => (
                    <option key={lt.LeaveTypeID} value={lt.LeaveTypeID}>
                      {lt.LeaveTypeName}
                    </option>
                  ))}
              </Form.Select>
            </Col>
            </Row>

            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Leave Type</th>
                  <th>Total</th>
                  <th>Carry</th>
                  <th>Encash</th>
                  <th>-Ve</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
  {systemLeavePolicies
    .filter((p) => {
      // Get only active leave types
      const activeLeaveTypeIds = orgLeaveTypes
        .filter((lt) => lt.IsActive)
        .map((lt) => lt.LeaveTypeID);

      // If user selected a filter
      if (filterLeaveType) {
        return p.LeaveTypeID === Number(filterLeaveType);
      }

      // On first load → show only policies of active leave types
      return activeLeaveTypeIds.includes(p.LeaveTypeID);
    })
    .map((p) => (
      <tr key={p.LeavePolicyID}>
        <td>{p.PolicyName}</td>
        <td>{p.LeaveTypeName}</td>
        <td>{p.TotalAnnualLeaves}</td>
        <td>{p.MaxCarryForward}</td>
        <td>{p.Encashable ? "✔️" : "❌"}</td>
        <td>{p.AllowNegativeBalance ? "✔️" : "❌"}</td>
        <td>{p.IsActive ? "✔️" : "❌"}</td>
        <td>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              openEditModal({
                OrgLeavePolicyID: null,
                LeaveTypeID: p.LeaveTypeID,
                LeavePolicyID: p.LeavePolicyID,
                TotalAnnualLeaves: p.TotalAnnualLeaves,
                MaxCarryForward: p.MaxCarryForward,
                EffectiveFrom: "",
                EffectiveTo: "",
                Encashable: p.Encashable,
                AllowNegativeBalance: p.AllowNegativeBalance,
                IsActive: p.IsActive,
              })
            }
          >
            ➕ Add Policy
          </Button>
        </td>
      </tr>
    ))}
</tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* ---------- POLICY MODAL ---------- */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editID ? "Edit Policy" : "Add Policy"}</Modal.Title>
        </Modal.Header>

      <Modal.Body>
  <Form>
    {/* Leave Type + System Policy */}
    <Row className="mb-3">
      <Col md={6}>
        <Form.Label>Leave Type</Form.Label>
        <Form.Select
          name="LeaveTypeID"
          value={policyForm.LeaveTypeID}
          onChange={handleFormChange}
          disabled
        >
          <option value="">Select Leave Type</option>
          {orgLeaveTypes
                  .filter((lt) => lt.IsActive) // 👈 only active
                  .map((lt) => (
                    <option key={lt.LeaveTypeID} value={lt.LeaveTypeID}>
                      {lt.LeaveTypeName}
                    </option>
                  ))}
        </Form.Select>
    
      </Col>

      <Col md={6}>
        <Form.Label>System Leave Policy</Form.Label>
        <Form.Select
          name="LeavePolicyID"
          value={policyForm.LeavePolicyID}
          onChange={handleFormChange}
          disabled
        >
          <option value="">Select System Policy</option>
          {systemLeavePolicies.map((p) => (
            <option key={p.LeavePolicyID} value={p.LeavePolicyID}>
              {p.PolicyName}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Row>

    {/* Total Leaves + Carry Forward */}
    <Row className="mb-3">
      <Col md={6}>
        <Form.Label>Total Annual Leaves</Form.Label>
        <Form.Control
          type="number"
          name="TotalAnnualLeaves"
          value={policyForm.TotalAnnualLeaves}
          onChange={handleFormChange}
        />
      </Col>

      <Col md={6}>
        <Form.Label>Max Carry Forward</Form.Label>
        <Form.Control
          type="number"
          name="MaxCarryForward"
          value={policyForm.MaxCarryForward}
          onChange={handleFormChange}
        />
      </Col>
    </Row>

    {/* ✅ NEW: Effective Dates */}
    <Row className="mb-3">
      <Col md={6}>
        <Form.Label>Effective From</Form.Label>
        <Form.Control
          type="date"
          name="EffectiveFrom"
          value={policyForm.EffectiveFrom}
          onChange={handleFormChange}
        />
      </Col>

      <Col md={6}>
        <Form.Label>Effective To</Form.Label>
        <Form.Control
          type="date"
          name="EffectiveTo"
          value={policyForm.EffectiveTo}
          onChange={handleFormChange}
        />
      </Col>
    </Row>

    {/* Checkboxes */}
    <Row className="mb-3">
      <Col md={4}>
        <Form.Check
          type="checkbox"
          label="Encashable"
          name="Encashable"
          checked={policyForm.Encashable}
          onChange={handleFormChange}
        />
      </Col>

      <Col md={4}>
        <Form.Check
          type="checkbox"
          label="Allow Negative Balance"
          name="AllowNegativeBalance"
          checked={policyForm.AllowNegativeBalance}
          onChange={handleFormChange}
        />
      </Col>

      <Col md={4}>
        <Form.Check
          type="checkbox"
          label="Active"
          name="IsActive"
          checked={policyForm.IsActive}
          onChange={handleFormChange}
        />
      </Col>
    </Row>
  </Form>
</Modal.Body>


        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePolicy}>
            {editID ? "Update Policy" : "Save Policy"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrganizationLeavePolicies;
