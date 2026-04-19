import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Row, Col, Card } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import api from "../../services/jobRequisitionService";
import employeeApi from "../../services/employeeService";
import auditLogsService from "../../services/auditLogsService";

// ===== TYPES =====
interface ApprovalGroup {
  GroupID: number;
  GroupName: string;
  ApprovalType: "All" | "Any";
  MinApprovalsRequired: number;
}

interface GroupMember {
  GroupMemberID: number;
  GroupID: number;
  EmployeeID: number;
}

interface Employee {
  EmployeeID: number;
  EmployeeName: string;
}

const JobApprovalGroups: React.FC = () => {
  const organizationID = 45;
  const user = "Admin"; // TODO: replace with real user

  const [groups, setGroups] = useState<ApprovalGroup[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | null>(null);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [groupForm, setGroupForm] = useState<ApprovalGroup>({
    GroupID: 0,
    GroupName: "",
    ApprovalType: "All",
    MinApprovalsRequired: 1,
  });

  const [selectedEmployeeID, setSelectedEmployeeID] = useState<number>(0);

  // ================= FIELD-LEVEL AUDIT BUILDER =================
  const buildAuditChanges = (
    action: string,
    entity: string,
    oldObj: any,
    newObj: any
  ) => {
    const changes: any[] = [];

    // CREATE
    if (!oldObj && newObj) {
      Object.keys(newObj).forEach((key) => {
        changes.push({
          ActionType: action,
          EntityName: entity,
          FieldName: key,
          OldValue: null,
          NewValue: newObj[key]?.toString() ?? null,
        });
      });
    }

    // DELETE
    else if (oldObj && !newObj) {
      Object.keys(oldObj).forEach((key) => {
        changes.push({
          ActionType: action,
          EntityName: entity,
          FieldName: key,
          OldValue: oldObj[key]?.toString() ?? null,
          NewValue: null,
        });
      });
    }

    // UPDATE
    else if (oldObj && newObj) {
      Object.keys(newObj).forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          changes.push({
            ActionType: action,
            EntityName: entity,
            FieldName: key,
            OldValue: oldObj[key]?.toString() ?? null,
            NewValue: newObj[key]?.toString() ?? null,
          });
        }
      });
    }

    return changes;
  };

  // ================= AUDIT LOGGER =================
  const logAudit = async (
    action: string,
    entity: string,
    oldValue: any,
    newValue: any
  ) => {
    try {
      const auditArray = buildAuditChanges(action, entity, oldValue, newValue);

      if (auditArray.length === 0) return;

      await auditLogsService.PostGenerateLoginsAsync({
        AuditJson: JSON.stringify(auditArray),
        TraceID: crypto.randomUUID(),
        IPAddress: "0.0.0.0",
        UserAgent: navigator.userAgent,
        OrganizationID: organizationID,
        UpdatedBy: user,
        ScreenName: "JobApprovalGroups",
      });
    } catch (err) {
      console.error("Audit failed:", err);
    }
  };

  // fire-and-forget
  const fireAudit = (...args: Parameters<typeof logAudit>) => {
    void logAudit(...args);
  };

  // ================= HELPERS =================
  const getEmployeeName = (id: number) =>
    employees.find((e) => e.EmployeeID === id)?.EmployeeName || "Unknown";

  // ================= LOAD =================
  const loadGroups = async () => {
    try {
      const data = await api.GetGetApprovalGroupsByOrganization(organizationID);
      setGroups(data);
    } catch {
      toast.error("Failed to load groups");
    }
  };

  const loadMembers = async (groupID: number) => {
    try {
      const data = await api.GetApprovalGroupMembersAsync(groupID, organizationID);
      setMembers(data);
    } catch {
      toast.error("Failed to load members");
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeApi.getEmployeesByOrganizationIdAsync(organizationID);
      setEmployees(data);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    loadGroups();
    loadEmployees();
  }, []);

  // ================= GROUP =================
  const saveGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = groupForm.GroupID !== 0;
    const oldData = groups.find((g) => g.GroupID === groupForm.GroupID);

    try {
      await api.PostSaveApprovalGroupByAsync({
        ...groupForm,
        OrganizationID: organizationID,
      });

      fireAudit(
        isEdit ? "UPDATE" : "CREATE",
        "ApprovalGroup",
        oldData,
        groupForm
      );

      toast.success("Group saved!");
      setShowGroupModal(false);
      loadGroups();
    } catch {
      toast.error("Save failed");
    }
  };

  const deleteGroup = async (groupID: number) => {
    if (!window.confirm("Delete this group?")) return;

    const oldData = groups.find((g) => g.GroupID === groupID);

    try {
      await api.DeleteApprovalGroupsByAsync(groupID);

      fireAudit("DELETE", "ApprovalGroup", oldData, null);

      toast.success("Deleted!");
      loadGroups();
      setSelectedGroup(null);
      setMembers([]);
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= MEMBER =================
  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroup || !selectedEmployeeID) return;

    if (members.some((m) => m.EmployeeID === selectedEmployeeID)) {
      toast.warning("Employee already in group");
      return;
    }

    try {
      await api.PostManageApprovalGroupMemberAsync({
        Action: "ADD",
        GroupID: selectedGroup.GroupID,
        OrganizationID: organizationID,
        EmployeeID: selectedEmployeeID,
        SequenceOrder: 1,
      });

      fireAudit("ADD", "ApprovalGroupMember", null, {
        GroupID: selectedGroup.GroupID,
        EmployeeID: selectedEmployeeID,
      });

      toast.success("Member added!");
      setShowMemberModal(false);
      setSelectedEmployeeID(0);
      loadMembers(selectedGroup.GroupID);
    } catch {
      toast.error("Error adding member");
    }
  };

  const deleteMember = async (employeeID: number) => {
    if (!selectedGroup) return;

    try {
      await api.PostManageApprovalGroupMemberAsync({
        Action: "REMOVE",
        GroupID: selectedGroup.GroupID,
        OrganizationID: organizationID,
        EmployeeID: employeeID,
      });

      fireAudit("REMOVE", "ApprovalGroupMember", {
        GroupID: selectedGroup.GroupID,
        EmployeeID: employeeID,
      }, null);

      toast.success("Member removed!");
      loadMembers(selectedGroup.GroupID);
    } catch {
      toast.error("Error removing member");
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between mb-3">
        <h3>Approval Groups</h3>
        <Button onClick={() => setShowGroupModal(true)}>+ Add Group</Button>
      </div>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Table hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Min</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.GroupID}>
                      <td>{g.GroupName}</td>
                      <td>{g.ApprovalType}</td>
                      <td>{g.MinApprovalsRequired}</td>
                      <td>
                        <Button size="sm" onClick={() => {
                          setGroupForm(g);
                          setShowGroupModal(true);
                        }}>Edit</Button>

                        <Button size="sm" className="ms-2" onClick={() => {
                          setSelectedGroup(g);
                          loadMembers(g.GroupID);
                        }}>Members</Button>

                        <Button size="sm" variant="danger" className="ms-2"
                          onClick={() => deleteGroup(g.GroupID)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <span>{selectedGroup?.GroupName || "Members"}</span>
              <Button size="sm" disabled={!selectedGroup}
                onClick={() => setShowMemberModal(true)}>
                + Add
              </Button>
            </Card.Header>

            <Card.Body>
              {members.length === 0 && <div>No members</div>}
              {members.map((m) => (
                <div key={m.GroupMemberID} className="d-flex justify-content-between mb-2">
                  <span>{getEmployeeName(m.EmployeeID)}</span>
                  <Button size="sm" variant="danger"
                    onClick={() => deleteMember(m.EmployeeID)}>
                    Remove
                  </Button>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
  {/* GROUP MODAL */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{groupForm.GroupID ? "Edit" : "Add"} Group</Modal.Title>
        </Modal.Header>

        <Form onSubmit={saveGroup}>
          <Modal.Body>
            <Form.Control
              className="mb-2"
              placeholder="Group Name"
              required
              value={groupForm.GroupName}
              onChange={(e) =>
                setGroupForm({ ...groupForm, GroupName: e.target.value })
              }
            />

            <Form.Select
              className="mb-2"
              value={groupForm.ApprovalType}
              onChange={(e) =>
                setGroupForm({
                  ...groupForm,
                  ApprovalType: e.target.value as "All" | "Any",
                })
              }
            >
              <option value="All">All Must Approve</option>
              <option value="Any">Any Can Approve</option>
            </Form.Select>

            <Form.Control
              type="number"
              min={1}
              value={groupForm.MinApprovalsRequired}
              onChange={(e) =>
                setGroupForm({
                  ...groupForm,
                  MinApprovalsRequired: Math.max(
                    1,
                    parseInt(e.target.value) || 1
                  ),
                })
              }
            />
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={() => setShowGroupModal(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MEMBER MODAL */}
      <Modal show={showMemberModal} onHide={() => setShowMemberModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>

        <Form onSubmit={addMember}>
          <Modal.Body>
            <Form.Select
              required
              value={selectedEmployeeID}
              onChange={(e) =>
                setSelectedEmployeeID(parseInt(e.target.value))
              }
            >
              <option value={0}>-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.EmployeeID} value={emp.EmployeeID}>
                  {emp.EmployeeName}
                </option>
              ))}
            </Form.Select>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={() => setShowMemberModal(false)}>Cancel</Button>
            <Button type="submit" disabled={!selectedEmployeeID}>
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default JobApprovalGroups;