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
  const user = "Admin"; // TODO: replace with auth user

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

  // ================= AUDIT LOGGER (NON-BLOCKING) =================
  const logAudit = async (
    action: string,
    entity: string,
    field: string,
    oldValue: any,
    newValue: any
  ) => {
    try {
      const payload = [
        {
          ActionType: action,
          EntityName: entity,
          FieldName: field,
          OldValue: oldValue ? JSON.stringify(oldValue) : null,
          NewValue: newValue ? JSON.stringify(newValue) : null,
        },
      ];

      await auditLogsService.PostGenerateLoginsAsync({
        AuditJson: JSON.stringify(payload),
        TraceID: crypto.randomUUID(),
        IPAddress: "0.0.0.0", // replace from backend if possible
        UserAgent: navigator.userAgent,
        OrganizationID: organizationID,
        UpdatedBy: user,
        ScreenName: "JobApprovalGroups",
      });
    } catch (err) {
      console.error("Audit failed (ignored):", err);
    }
  };

  // fire-and-forget wrapper
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
        "Group",
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

      fireAudit("DELETE", "ApprovalGroup", "Group", oldData, null);

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

      fireAudit(
        "ADD",
        "ApprovalGroupMember",
        "Member",
        null,
        {
          GroupID: selectedGroup.GroupID,
          GroupName: selectedGroup.GroupName,
          EmployeeID: selectedEmployeeID,
          EmployeeName: getEmployeeName(selectedEmployeeID),
        }
      );

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

      fireAudit(
        "REMOVE",
        "ApprovalGroupMember",
        "Member",
        {
          GroupID: selectedGroup.GroupID,
          GroupName: selectedGroup.GroupName,
          EmployeeID: employeeID,
          EmployeeName: getEmployeeName(employeeID),
        },
        null
      );

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

      <ToastContainer />
    </div>
  );
};

export default JobApprovalGroups;