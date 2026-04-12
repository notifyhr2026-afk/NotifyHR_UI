import React, { useEffect, useState } from "react";
import { Button, Table, Form, Row, Col, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { User } from "../../types/user";
import userService from "../../services/userService";
import { Modal } from "react-bootstrap";
import { useAuth } from "../../auth/AuthContext";
import { resetUserPasswordByAdmin } from "../../services/Changepassword";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const UsersSection: React.FC = () => {
const { id } = useParams<{ id?: string }>();

const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
const organizationID: number | undefined =
    id ? Number(id) : userFromStorage?.organizationID;

const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [showModal, setShowModal] = useState(false);
const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    if (organizationID) {
      loadUsers(organizationID);
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
        User_ID:u.UserID
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
      modifiedBy: "admin", // 👈 admin
    });

    // Optional: update UI state
    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, isPasswordReset: true }
          : u
      )
    );

    setShowModal(false);
    await Swal.fire({
            icon: 'success',
            title: 'Password Reset Successful!',
            confirmButtonColor: '#3085d6',
            heightAuto: false, 
            width: 380,
            customClass: {
              popup: "custom-swal-popup"
            },
            showConfirmButton: false,   // ❌ remove OK button
            timer: 2500,                // ⏱ 3 seconds
            timerProgressBar: true,     // optional progress bar
            allowOutsideClick: false,
            allowEscapeKey: false,
            scrollbarPadding: false,
           });

  } catch (error) {
    Swal.fire({
            icon: 'error',
            title: 'Password Reset Failed',
            text: 'Invalid current password or request failed.',
          });
  } finally {
    setResetting(false);
  }
};

  // const handleResetPassword = (id: string) => {
  //   setUsers((prev) =>
  //     prev.map((u) =>
  //       u.id === id
  //         ? {
  //             ...u,
  //             isPasswordReset: true,
  //             passwordResetDate: new Date().toISOString().split("T")[0],
  //           }
  //         : u
  //     )
  //   );
  // };
  if (loading) return <div className="mt-3">Loading users...</div>;
  return (
    <>
     
      <Table bordered hover size="sm" responsive>
        <thead className="table-light">
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Username</th>
            <th>Password Hash</th>
            <th>Password Reset</th>
            <th>Reset Date</th>
            <th>Active</th>
            <th>Deleted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center">
                No users found
              </td>
            </tr>
          ) : (
            users.map((u) => (
              
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.username}</td>
                <td>{u.passwordHash}</td>
                <td>{u.isPasswordReset ? "✔️" : "❌"}</td>
                <td>{u.passwordResetDate || "-"}</td>
                <td>{u.isActive ? "✔️" : "❌"}</td>
                <td>{u.isDeleted ? "✔️" : "❌"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => {
                      setSelectedUser(u);
                      setShowModal(true);
                    }}
                  >
                    Reset Password
                  </Button>

                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* pop up for confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Password Reset</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    Are you sure you want to reset the password for{" "}
    <strong>{selectedUser?.fullName}</strong>?
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      No
    </Button>

    <Button
      variant="danger"
      onClick={confirmResetPassword}
      disabled={resetting}
    >
      {resetting ? "Resetting..." : "Yes, Reset"}
    </Button>
  </Modal.Footer>
      </Modal>

    </>
  );
};

export default UsersSection;
 