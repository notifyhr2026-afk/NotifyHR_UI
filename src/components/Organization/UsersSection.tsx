import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Badge,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { User } from "../../types/user";
import userService from "../../services/userService";
import { resetUserPasswordByAdmin } from "../../services/Changepassword";
import Swal from "sweetalert2";

const UsersSection: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = id
    ? Number(id)
    : userFromStorage?.organizationID;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (organizationID) {
      loadUsers(organizationID);
    } else {
      setLoading(false);
    }
  }, [organizationID]);

  const loadUsers = async (orgId: number) => {
    try {
      setLoading(true);
      const response = await userService.getOrgDetailsAsync(orgId);
      const mappedUsers: User[] = response.map((u: any) => ({
        id: u.Username,
        fullName: u.FullName,
        email: u.Email,
        phone: u.Phone,
        username: u.Username,
        passwordHash: "****",
        isPasswordReset: u.IsPasswordReset,
        passwordResetDate: u.PasswordResetDate,
        isActive: u.IsActive,
        isDeleted: u.IsDeleted,
        User_ID: u.UserID,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;
    try {
      setResetting(true);
      await resetUserPasswordByAdmin({
        userID: selectedUser.User_ID,
        organizationID: organizationID!,
        modifiedBy: "admin",
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, isPasswordReset: true }
            : u
        )
      );

      setShowModal(false);
      await Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        confirmButtonColor: "#3085d6",
        heightAuto: false,
        width: 380,
        customClass: { popup: "custom-swal-popup" },
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        scrollbarPadding: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text: "Invalid current password or request failed.",
      });
    } finally {
      setResetting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          color: "var(--text-color)",
          opacity: 0.5,
        }}
      >
        <Spinner animation="border" className="me-3" />
        Loading users...
      </div>
    );
  }

  return (
    <>
      {/* Table wrapper */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
        }}
      >
        <Table hover className="table-dark-custom" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                Full Name
              </th>
              <th style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                Email
              </th>
              <th style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                Phone
              </th>
              <th
                style={{ padding: "12px 16px", whiteSpace: "nowrap" }}
                className="text-center"
              >
                Password Reset
              </th>
              <th
                style={{ padding: "12px 16px", whiteSpace: "nowrap" }}
                className="text-center"
              >
                Status
              </th>
              <th
                style={{ padding: "12px 16px", whiteSpace: "nowrap" }}
                className="text-center"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    opacity: 0.4,
                    fontSize: "0.9rem",
                  }}
                >
                  <i
                    className="bi bi-people"
                    style={{ fontSize: "1.5rem", display: "block", marginBottom: 8 }}
                  />
                  No admin users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #1e73be, #6366f1)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {u.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase() || "U"}
                      </div>
                      <div>
                        <div>{u.fullName}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                          {u.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                    {u.phone || "-"}
                  </td>
                  <td className="text-center" style={{ padding: "12px 16px" }}>
                    {u.isPasswordReset ? (
                      <Badge
                        bg="success"
                        style={{ fontWeight: 500, fontSize: "0.75rem" }}
                      >
                        Reset Done
                      </Badge>
                    ) : (
                      <Badge
                        bg="warning"
                        text="dark"
                        style={{ fontWeight: 500, fontSize: "0.75rem" }}
                      >
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="text-center" style={{ padding: "12px 16px" }}>
                    {u.isActive ? (
                      <Badge
                        bg="success"
                        style={{
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          background: "#22c55e",
                          border: "none",
                        }}
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        bg="secondary"
                        style={{ fontWeight: 500, fontSize: "0.75rem" }}
                      >
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="text-center" style={{ padding: "12px 16px" }}>
                    <Button
                      size="sm"
                      variant="outline-warning"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowModal(true);
                      }}
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        fontSize: "0.78rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise" />
                      Reset Password
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Confirm Reset Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "1px solid var(--border-color)" }}>
          <Modal.Title
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            <i className="bi bi-shield-exclamation" style={{ color: "#dc3545" }} />
            Confirm Password Reset
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px 24px" }}>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Are you sure you want to reset the password for{" "}
            <strong>{selectedUser?.fullName}</strong>?
          </p>
          <p style={{ margin: "8px 0 0", fontSize: "0.8rem", opacity: 0.5 }}>
            The user will be required to set a new password on their next login.
          </p>
        </Modal.Body>
        <Modal.Footer
          style={{
            borderTop: "1px solid var(--border-color)",
            padding: "12px 24px",
          }}
        >
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            style={{ borderRadius: 6, fontWeight: 500, fontSize: "0.85rem" }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmResetPassword}
            disabled={resetting}
            style={{
              borderRadius: 6,
              fontWeight: 600,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {resetting ? (
              <>
                <Spinner size="sm" animation="border" />
                Resetting...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" />
                Yes, Reset
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UsersSection;
