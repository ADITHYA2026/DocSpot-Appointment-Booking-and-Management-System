import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Navbar as BootstrapNavbar, 
  Nav, 
  Container, 
  NavDropdown,
  Badge,
  Button 
} from 'react-bootstrap';
import { 
  FaUserMd, 
  FaCalendarAlt, 
  FaBell, 
  FaUserCircle,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUsers,
  FaClipboardList
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, notifications, markNotificationRead } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification._id);
    if (notification.appointmentId) {
      navigate(`/my-appointments`);
    }
    setShowNotifications(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.type === 'admin') return '/admin/dashboard';
    if (user.isDoctor || user.type === 'doctor') return '/doctor/dashboard';
    return '/dashboard';
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="shadow-sm" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaUserMd className="me-2" size={28} />
          <span className="fw-bold">DocSpot</span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/doctors">Find Doctors</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            {user ? (
              <>
                {/* Notifications */}
                <Nav.Item className="position-relative me-3">
                  <Button
                    variant="link"
                    className="text-white position-relative p-0"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <FaBell size={20} />
                    {unreadCount > 0 && (
                      <Badge 
                        bg="danger" 
                        className="position-absolute top-0 start-100 translate-middle rounded-circle"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="notifications-dropdown">
                      <div className="notifications-header">
                        <h6 className="mb-0">Notifications</h6>
                        <small>{unreadCount} unread</small>
                      </div>
                      <div className="notifications-list">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map(notification => (
                            <div
                              key={notification._id}
                              className={`notification-item ${!notification.read ? 'unread' : ''}`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <p className="mb-1">{notification.message}</p>
                              <small className="text-muted">
                                {new Date(notification.date).toLocaleDateString()}
                              </small>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-3 text-muted">
                            No notifications
                          </div>
                        )}
                      </div>
                      {notifications.length > 5 && (
                        <div className="notifications-footer">
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => {
                              navigate('/notifications');
                              setShowNotifications(false);
                            }}
                          >
                            View all
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Nav.Item>

                {/* User Menu */}
                <NavDropdown
                  title={
                    <span className="text-white">
                      <FaUserCircle className="me-1" size={20} />
                      {user.name.split(' ')[0]}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to={getDashboardLink()}>
                    <MdDashboard className="me-2" /> Dashboard
                  </NavDropdown.Item>

                  {user.type === 'admin' ? (
                    <>
                      <NavDropdown.Item as={Link} to="/admin/users">
                        <FaUsers className="me-2" /> Manage Users
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/doctors">
                        <FaUserMd className="me-2" /> Manage Doctors
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/appointments">
                        <FaClipboardList className="me-2" /> All Appointments
                      </NavDropdown.Item>
                    </>
                  ) : user.isDoctor || user.type === 'doctor' ? (
                    <>
                      <NavDropdown.Item as={Link} to="/doctor/appointments">
                        <FaCalendarAlt className="me-2" /> My Appointments
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/doctor/profile">
                        <FaUserCircle className="me-2" /> Profile
                      </NavDropdown.Item>
                    </>
                  ) : (
                    <>
                      <NavDropdown.Item as={Link} to="/my-appointments">
                        <FaCalendarAlt className="me-2" /> My Appointments
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/profile">
                        <FaUserCircle className="me-2" /> Profile
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">
                  Login
                </Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="light" 
                  size="sm"
                  className="ms-2"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;