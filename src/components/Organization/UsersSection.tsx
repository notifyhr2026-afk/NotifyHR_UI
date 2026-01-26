import React, { useEffect, useState } from "react";
import { Button, Table, Form, Row, Col, Card } from "react-bootstrap";
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

  /* NEW STATE */
  const [isLoginActivate, setIsLoginActivate] = useState<boolean>(false);
  const [loginRemarks, setLoginRemarks] = useState<string>("");

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

  /* NEW HANDLER */
  const handleActivateLogin = () => {
    console.log("Activate Login Payload:", {
      organizationID,
      isLoginActivate,
      loginRemarks,
    });

    // API integration later
    alert("Login activation updated successfully!");
  };

  if (loading) return <div className="mt-3">Loading users...</div>;

  return (
    <>
      {/* ================= LOGIN ACTIVATION SECTION ================= */}

      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">Login Activation</h6>

          <Row className="align-items-center">
            <Col md={3}>
              <Form.Check
                type="checkbox"
                label="Is Login Activated"
                checked={isLoginActivate}
                onChange={(e) => setIsLoginActivate(e.target.checked)}
              />
            </Col>

            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Login remarks"
                value={loginRemarks}
                onChange={(e) => setLoginRemarks(e.target.value)}
              />
            </Col>

            <Col md={3} className="text-end">
              <Button
                variant="success"
                onClick={handleActivateLogin}
                disabled={!loginRemarks.trim()}
              >
                Activate Login
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================= USERS GRID ================= */}

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
    </>
  );
};

export default UsersSection;
