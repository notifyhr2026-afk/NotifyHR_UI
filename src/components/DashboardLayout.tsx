import React, { useState } from 'react';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // Mode toggle state
  const [isAdminMode, setIsAdminMode] = useState(false);

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

      {/* Main Content */}
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
        {!hideTopBar && (
          <div
            className="d-flex justify-content-between align-items-center px-4 border-bottom shadow-sm"
            style={{
              height: '56px',
              position: 'fixed',
              backgroundColor: '#f0f4f8',
              top: 0,
              left: isSidebarOpen ? 250 : 60,
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

                <Dropdown.Menu style={{ minWidth: 230, padding: '0.5rem 1rem' }}>
                  <Dropdown.Item href="/myprofile">My Profile</Dropdown.Item>
                  <Dropdown.Item href="/ChangePassword">Change Password</Dropdown.Item>

                  <Dropdown.Divider />

                  {/* Mode Switch */}
                  <div className="d-flex flex-column align-items-start px-2 py-2">
                    <small className="text-muted mb-1">Switch View Mode</small>
                    <div
                      className="d-flex align-items-center justify-content-between w-100 px-2 py-1 bg-light rounded"
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => setIsAdminMode(prev => !prev)}
                    >
                      <span
                        className={`badge ${!isAdminMode ? 'bg-primary text-white' : 'bg-secondary text-dark'}`}
                        style={{ width: 70, textAlign: 'center', fontSize: 12 }}
                      >
                        Employee
                      </span>

                      <div
                        className="position-relative flex-grow-1 mx-2"
                        style={{
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 2,
                        }}
                      >
                        <div
                          className="bg-primary"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            transition: 'transform 0.3s ease',
                            transform: isAdminMode ? 'translateX(26px)' : 'translateX(0px)',
                          }}
                        ></div>
                      </div>

                      <span
                        className={`badge ${isAdminMode ? 'bg-primary text-white' : 'bg-secondary text-dark'}`}
                        style={{ width: 70, textAlign: 'center', fontSize: 12 }}
                      >
                        Admin
                      </span>
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
        )}

        <main
          className="p-4"
          style={{
            paddingTop: hideTopBar ? 0 : 70,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
