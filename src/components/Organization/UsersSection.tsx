import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { User } from "../../types/user";
import userService from "../../services/userService";

const UsersSection: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined =
    id ? Number(id) : userFromStorage?.organizationID;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

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
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              isPasswordReset: true,
              passwordResetDate: new Date().toISOString().split("T")[0],
            }
          : u
      )
    );
  };

  if (loading) return <div className="mt-3">Loading users...</div>;

  return (
    <Table bordered hover size="sm" responsive className="mt-3">
      <thead>
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
                  onClick={() => handleResetPassword(u.id)}
                >
                  Reset Password
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default UsersSection;
