import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SideMenu from './OrgSideMenu';
import { useAuth } from '../auth/AuthContext';
import avatarImg from '../img/avatar.jpg';
import { Dropdown } from 'react-bootstrap';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();

  const data: any = localStorage.getItem('user');
  const user = { name: JSON.parse(data)?.fullName };
  const organizationName = { name: JSON.parse(data)?.organizationName };
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // 🌙 Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Apply theme globally
useEffect(() => {
  document.body.classList.remove('dark-mode', 'light-mode');
  document.body.classList.add(isDarkMode ? 'dark-mode' : 'light-mode');

  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}, [isDarkMode]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hideTopBarPaths = ['/add-item', '/edit-item'];
  const hideTopBar = hideTopBarPaths.includes(location.pathname);

  return (
    <div className="d-flex app-container">
      {/* Sidebar */}
      <SideMenu isOpen={isSidebarOpen} />

      {/* Main Content */}
      <div
        className="flex-grow-1 position-relative main-wrapper"
        style={{
          marginLeft: isSidebarOpen ? 250 : 60,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Top Bar */}
<div className="topbar d-flex justify-content-between align-items-center px-4 shadow-sm">
  {/* Sidebar Toggle */}
  <button
    className="btn btn-link fs-4"
    onClick={toggleSidebar}
    aria-label="Toggle sidebar"
    style={{ color: isDarkMode ? '#fff' : '#0d6efd' }}
  >
    <i className="bi bi-list"></i>
  </button>

  {/* Organization Name */}
  <div
    className="mx-3 text-truncate"
    style={{
      maxWidth: '400px',
      fontWeight: 1000,
      fontSize: '2rem',
      color: isDarkMode ? '#fff' : '#0d6efd',
      textAlign: 'center',
    }}
    title={organizationName.name}
  >
    {organizationName.name || 'Organization'}
  </div>

  {/* User Section */}
  <div className="d-flex align-items-center gap-2">
    <span className="fw-semibold user-select-none">
      {user?.name || 'User'}
    </span>

    <Dropdown
      align="end"
      show={showDropdown}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <Dropdown.Toggle
        variant="light"
        className="p-0 border-0 bg-transparent"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <img
          src={avatarImg}
          alt="User Avatar"
          width={40}
          height={40}
          className="rounded-circle"
        />
      </Dropdown.Toggle>

      <Dropdown.Menu className="theme-dropdown">
        <Dropdown.Item href="/myprofile">My Profile</Dropdown.Item>
        <Dropdown.Item href="/ChangePassword">Change Password</Dropdown.Item>
        <Dropdown.Divider />

        {/* Theme Toggle */}
        <div className="px-3 py-2">
          <small className={isDarkMode ? "text-light" : "text-muted"}>
            Theme Mode
          </small>
          <div
            className="theme-switch mt-2"
            onClick={() => setIsDarkMode(prev => !prev)}
          >
            <span className={!isDarkMode ? 'active' : ''}>Light</span>
            <div className="switch-track">
              <div
                className="switch-thumb"
                style={{
                  transform: isDarkMode
                    ? 'translateX(26px)'
                    : 'translateX(0px)',
                }}
              />
            </div>
            <span className={isDarkMode ? 'active' : ''}>Dark</span>
          </div>
        </div>

        <Dropdown.Divider />
        <Dropdown.Item onClick={handleLogout} className="text-danger">
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  </div>
</div>

        {/* PAGE CONTENT */}
        <main className="p-4 page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;