import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SideMenu from './OrgSideMenu';
import { useAuth } from '../auth/AuthContext';
import avatarImg from '../img/avatar.jpg';
import { Dropdown } from 'react-bootstrap';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const data:any =  localStorage.getItem('user');
  const user = { name: JSON.parse(data)?.fullName };
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hideTopBarPaths = ['/add-item', '/edit-item'];
  const hideTopBar = hideTopBarPaths.includes(location.pathname);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <SideMenu isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <div
        className="flex-grow-1 position-relative"
        style={{
          marginLeft: isSidebarOpen ? 250 : 60,
          transition: 'margin-left 0.3s ease',
          backgroundColor: '#f4f7fa',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Fixed Top Bar */}
        {!hideTopBar && (
          <div
            className="d-flex justify-content-between align-items-center px-4 border-bottom bg-white shadow-sm"
            style={{
              height: '56px',
              position: 'fixed',
              top: 0,
              left: isSidebarOpen ? 250 : 60, // match sidebar width
              right: 0,
              zIndex: 1000,
              transition: 'left 0.3s ease',
            }}
          >
            <button
              className="btn btn-link text-primary fs-4"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <i className="bi bi-list"></i>
            </button>

            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold text-dark user-select-none">
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
                  id="dropdown-user"
                  className="p-0 border-0 bg-transparent"
                  style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}
                >
                  <img
                    src={avatarImg}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="rounded-circle"
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item href="/myprofile">My Profile</Dropdown.Item>
                  <Dropdown.Item href="/ChangePassword">Change password</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        )}

        {/* Main Page Content */}
        <main
        className="p-4"
        style={{
          paddingTop: hideTopBar ? 0 : 70, // offset for fixed top bar
        }}
      >
  <Outlet />
</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
