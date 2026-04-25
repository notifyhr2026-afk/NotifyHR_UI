import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideMenu from './OrgSideMenu';
import { useAuth } from '../auth/AuthContext';
import { Dropdown } from 'react-bootstrap';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();

  const data: any = localStorage.getItem('user');
  const parsed = data ? JSON.parse(data) : {};

  const user = { name: parsed?.fullName };
  const organizationName = { name: parsed?.organizationName };

  const roles: string[] = parsed?.roles || ['Admin', 'Manager'];
  const [currentRole, setCurrentRole] = useState(
    parsed?.currentRole || roles[0]
  );

  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
    const updatedUser = { ...parsed, currentRole: role };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ✅ Avatar initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="d-flex app-container">
      <SideMenu isOpen={isSidebarOpen} />

      <div
        className="flex-grow-1 main-wrapper"
        style={{
          marginLeft: isSidebarOpen ? 250 : 60,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
        }}
      >
        {/* TOP BAR */}
        <div className="topbar d-flex justify-content-between align-items-center px-4 shadow-sm">

          {/* Sidebar Toggle */}
          <button
            className="btn btn-link fs-4"
            onClick={toggleSidebar}
            style={{ color: isDarkMode ? '#fff' : '#1e73be' }}
          >
            <i className="bi bi-list"></i>
          </button>

          {/* Organization */}
          <div
            className="fw-bold text-truncate"
            style={{
              fontSize: '1.8rem',
              color: isDarkMode ? '#fff' : '#1e73be',
              maxWidth: 400,
            }}
          >
            {organizationName.name || 'Organization'}
          </div>

          {/* USER */}
          <div className="d-flex align-items-center gap-3">

            {/* Role Chip */}
            {roles.length > 1 && (
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background: isDarkMode ? '#4f46e5' : '#1e73be',
                  color: '#fff',
                }}
              >
                <i className="bi bi-briefcase me-1"></i>
                {currentRole}
              </span>
            )}

            <span className="fw-semibold">{user?.name || 'User'}</span>

            {/* DROPDOWN */}
            <Dropdown align="end">
              <Dropdown.Toggle className="avatar-toggle">

                {/* ✅ Avatar Initial */}
                <div className="avatar-circle">
                  {getInitials(user?.name)}
                </div>

              </Dropdown.Toggle>

              <Dropdown.Menu className="custom-dropdown">

                {/* TOP SECTION */}
                <div className="px-3 py-2">
                  <div className="d-flex">

                    {/* LEFT */}
                    <div className="flex-grow-1 pe-3">
                      <Dropdown.Item href="/myprofile">
                        <i className="bi bi-person me-2"></i>
                        My Profile
                      </Dropdown.Item>

                      <Dropdown.Item href="/ChangePassword">
                        <i className="bi bi-lock me-2"></i>
                        Change Password
                      </Dropdown.Item>
                    </div>

                    {/* DIVIDER */}
                    <div className="divider-vertical" />

                    {/* RIGHT */}
                    <div className="flex-grow-1 ps-3">
                      <small className="section-title">Theme</small>

                      <div
                        className="theme-switch mt-2"
                        onClick={() => setIsDarkMode(prev => !prev)}
                      >
                        <span className={!isDarkMode ? 'active' : ''}>
                          Light
                        </span>

                        <div className="switch-track">
                          <div
                            className="switch-thumb"
                            style={{
                              transform: isDarkMode
                                ? 'translateX(22px)'
                                : 'translateX(0)',
                            }}
                          />
                        </div>

                        <span className={isDarkMode ? 'active' : ''}>
                          Dark
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                <Dropdown.Divider />

                {/* ROLES */}
                {roles.length > 1 && (
                  <div className="px-3 py-2">
                    <small className="section-title">Workspace</small>

                    <div className="mt-2">
                      {roles.map(role => (
                        <div
                          key={role}
                          className={`role-item ${
                            currentRole === role ? 'active' : ''
                          }`}
                          onClick={() => handleRoleChange(role)}
                        >
                          <i className="bi bi-briefcase me-2"></i>
                          {role}
                          {currentRole === role && (
                            <i className="bi bi-check ms-auto"></i>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Dropdown.Divider />

                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* PAGE */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>

      {/* 🎨 STYLES */}
      <style>{`
        /* REMOVE DROPDOWN ARROW */
        .avatar-toggle::after {
          display: none !important;
        }

        .avatar-toggle {
          border: none !important;
          background: transparent !important;
          padding: 0;
        }

        /* AVATAR */
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #1e73be, #4f46e5);
          transition: all 0.2s ease;
        }

        .avatar-circle:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .dark-mode .avatar-circle {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        /* DROPDOWN */
        .custom-dropdown {
          min-width: 340px;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .divider-vertical {
          width: 1px;
          background: rgba(0,0,0,0.1);
        }

        .dark-mode .divider-vertical {
          background: rgba(255,255,255,0.2);
        }

        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0.7;
        }

        /* ROLE ITEM */
        .role-item {
          display: flex;
          align-items: center;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }

        .role-item:hover {
          background: rgba(0,0,0,0.05);
        }

        .dark-mode .role-item:hover {
          background: rgba(255,255,255,0.1);
        }

        .role-item.active {
          background: rgba(30,115,190,0.15);
          font-weight: 600;
        }

        /* THEME SWITCH */
        .theme-switch {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .switch-track {
          width: 36px;
          height: 18px;
          background: #ccc;
          border-radius: 20px;
          position: relative;
        }

        .dark-mode .switch-track {
          background: #4f46e5;
        }

        .switch-thumb {
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 2px;
          transition: transform 0.3s;
        }

        .theme-switch span.active {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;