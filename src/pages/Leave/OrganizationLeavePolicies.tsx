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

// ---------- STATIC DATA ----------
const leaveTypes = [
  { LeaveTypeID: 1, LeaveTypeName: "Sick Leave", Description: "For illness" },
  { LeaveTypeID: 2, LeaveTypeName: "Casual Leave", Description: "Personal work" },
];

const systemLeavePolicies = [
  {
    LeavePolicyID: 1,
    PolicyName: "Standard Sick Leave Policy",
    LeaveTypeID: 1,
    TotalAnnualLeaves: 12,
    MaxCarryForward: 6,
    Encashable: false,
    AllowNegativeBalance: false,
    IsActive: true,
  },
  {
    LeavePolicyID: 2,
    PolicyName: "Standard Casual Leave Policy",
    LeaveTypeID: 2,
    TotalAnnualLeaves: 10,
    MaxCarryForward: 3,
    Encashable: true,
    AllowNegativeBalance: false,
    IsActive: true,
  },
];

// ------------------------------------------------------

const OrganizationLeavePolicies: React.FC = () => {
  // Leave Types Tab State
  const [leaveTypeList, setLeaveTypeList] = useState(leaveTypes);
  const [selectedLeaveType, setSelectedLeaveType] = useState("");

  const handleAddLeaveType = () => {
    if (!selectedLeaveType) return alert("Select Leave Type");

    const type = leaveTypes.find(
      (t) => t.LeaveTypeID === Number(selectedLeaveType)
    );

    if (!type) return;

    if (leaveTypeList.some((t) => t.LeaveTypeID === type.LeaveTypeID)) {
      return alert("Leave type already exists.");
    }

    setLeaveTypeList((prev) => [...prev, type]);
  };

  const handleDeleteLeaveType = (id: number) => {
    if (window.confirm("Delete this leave type?")) {
      setLeaveTypeList((prev) => prev.filter((t) => t.LeaveTypeID !== id));
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
  });

  const openAddModal = () => {
    setEditID(null);
    setPolicyForm({
      LeaveTypeID: "",
      LeavePolicyID: "",
      TotalAnnualLeaves: "",
      MaxCarryForward: "",
      EffectiveFrom: "",
      EffectiveTo: "",
      Encashable: false,
      AllowNegativeBalance: false,
      IsActive: true,
    });
    setShowModal(true);
  };

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

  const handleSavePolicy = () => {
    const sysPolicy = systemLeavePolicies.find(
      (p) => p.LeavePolicyID === Number(policyForm.LeavePolicyID)
    );

    if (!sysPolicy) return alert("Select System Leave Policy");

    const record = {
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
    };

    if (editID) {
      setOrgPolicies((prev) =>
        prev.map((p) => (p.OrgLeavePolicyID === editID ? record : p))
      );
    } else {
      setOrgPolicies((prev) => [...prev, record]);
    }

    closeModal();
  };

  const deletePolicy = (id: number) => {
    if (window.confirm("Delete this policy?")) {
      setOrgPolicies((prev) => prev.filter((p) => p.OrgLeavePolicyID !== id));
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
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Select Leave Type</Form.Label>
                <Form.Select
                  value={selectedLeaveType}
                  onChange={(e) => setSelectedLeaveType(e.target.value)}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt.LeaveTypeID} value={lt.LeaveTypeID}>
                      {lt.LeaveTypeName}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3} className="d-flex align-items-end">
                <Button variant="primary" onClick={handleAddLeaveType}>
                  Add Leave Type
                </Button>
              </Col>
            </Row>

            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leaveTypeList.map((lt) => (
                  <tr key={lt.LeaveTypeID}>
                    <td>{lt.LeaveTypeName}</td>
                    <td>{lt.Description}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteLeaveType(lt.LeaveTypeID)}
                      >
                        Delete
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
                {orgPolicies.map((p) => {
                  const type = leaveTypes.find(
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
          <Accordion.Header>All Leave Policies</Accordion.Header>
          <Accordion.Body>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Filter by Leave Type</Form.Label>
                <Form.Select
                  value={filterLeaveType}
                  onChange={(e) => setFilterLeaveType(e.target.value)}
                >
                  <option value="">All Leave Types</option>
                  {leaveTypes.map((lt) => (
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
                  .filter((p) =>
                    filterLeaveType
                      ? p.LeaveTypeID === Number(filterLeaveType)
                      : true
                  )
                  .map((p) => {
                    const type = leaveTypes.find(
                      (t) => t.LeaveTypeID === p.LeaveTypeID
                    );

                    return (
                      <tr key={p.LeavePolicyID}>
                        <td>{p.PolicyName}</td>
                        <td>{type?.LeaveTypeName}</td>
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
                    );
                  })}
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
        >
          <option value="">Select Leave Type</option>
          {leaveTypes.map((lt) => (
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
