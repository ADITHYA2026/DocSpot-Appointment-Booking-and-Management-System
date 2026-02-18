import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaUserMd, FaBell, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { appointmentService, doctorService } from '../services/api';
import './Dashboard.css';

// ── PROFILE IMAGE FIX (Same as DoctorsList) ──

const AVATAR_COLORS = [
  '#0d6efd',
  '#198754',
  '#dc3545',
  '#6f42c1',
  '#fd7e14',
  '#20c997',
  '#0dcaf0',
  '#d63384',
];

const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const isValidImageUrl = (url) => {
  if (!url) return false;
  if (url === 'default-doctor.png') return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  if (url.startsWith('/uploads/')) return true;
  return false;
};

const DoctorAvatar = ({ doctor, size = 90 }) => {
  const [imgError, setImgError] = useState(false);
  const hasValidImage = isValidImageUrl(doctor.profileImage) && !imgError;

  if (hasValidImage) {
    return (
      <img
        src={doctor.profileImage}
        alt={doctor.fullName}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    );
  }

  const color = getAvatarColor(doctor.fullName);
  const initials = getInitials(doctor.fullName);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto'
      }}
    >
      <span style={{ color: '#fff', fontSize: 35, fontWeight: 600 }}>
        {initials}
      </span>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        appointmentService.getUserAppointments(),
        doctorService.getDoctors({ limit: 4 })
      ]);
      setAppointments(appointmentsRes.data.data || []);
      setDoctors(doctorsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      completed: 'info',
      cancelled: 'secondary'
    };
    return <Badge bg={statusMap[status] || 'primary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Container className="py-4">
        {/* Welcome Banner */}
        <div className="welcome-banner bg-primary text-white p-4 rounded-3 mb-4">
          <Row className="align-items-center">
            <Col>
              <h2>Welcome back, {user?.name}!</h2>
              <p className="mb-0">Manage your appointments and find the best doctors for your healthcare needs.</p>
            </Col>
            <Col xs="auto">
              <Button as={Link} to="/doctors" variant="light">
                Book Appointment
              </Button>
            </Col>
          </Row>
        </div>

        <Row>
          {/* Upcoming Appointments */}
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaCalendarCheck className="me-2 text-primary" />
                  Upcoming Appointments
                </h5>
                <Button as={Link} to="/my-appointments" variant="link" size="sm">
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {appointments.length > 0 ? (
                  <ListGroup variant="flush">
                    {appointments.slice(0, 3).map(app => (
                      <ListGroup.Item key={app._id} className="px-0">
                        <Row className="align-items-center">
                          <Col md={5}>
                            <strong>{app.doctorInfo?.name}</strong>
                            <br />
                            <small className="text-muted">{app.doctorInfo?.specialization}</small>
                          </Col>
                          <Col md={3}>
                            <FaClock className="me-1 text-muted" />
                            {new Date(app.date).toLocaleDateString()}
                          </Col>
                          <Col md={2}>
                            {getStatusBadge(app.status)}
                          </Col>
                          <Col md={2} className="text-end">
                            <Button 
                              as={Link} 
                              to={`/my-appointments`} 
                              variant="outline-primary" 
                              size="sm"
                            >
                              View
                            </Button>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted text-center mb-0">No upcoming appointments</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Stats */}
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <FaBell className="me-2 text-primary" />
                  Quick Stats
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="stats-item mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Total Appointments</span>
                    <strong>{appointments.length}</strong>
                  </div>
                </div>
                <div className="stats-item mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Pending</span>
                    <strong>{appointments.filter(a => a.status === 'pending').length}</strong>
                  </div>
                </div>
                <div className="stats-item mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Approved</span>
                    <strong>{appointments.filter(a => a.status === 'approved').length}</strong>
                  </div>
                </div>
                <div className="stats-item">
                  <div className="d-flex justify-content-between">
                    <span>Completed</span>
                    <strong>{appointments.filter(a => a.status === 'completed').length}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recommended Doctors */}
        <Row className="mt-4">
          <Col>
            <h4 className="mb-3">
              <FaUserMd className="me-2 text-primary" />
              Recommended Doctors
            </h4>
          </Col>
        </Row>
        <Row>
          {doctors.map(doctor => (
            <Col lg={3} md={6} className="mb-4" key={doctor._id}>
              <Card className="doctor-card h-100 shadow-sm">
                <Card.Body>
                  <div className="text-center mb-3">
                    <DoctorAvatar doctor={doctor} size={80} />
                    <h6 className="mt-2 mb-1">{doctor.fullName}</h6>
                    <p className="text-muted small">{doctor.specialization}</p>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Experience:</span>
                    <strong>{doctor.experience} years</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Fees:</span>
                    <strong>${doctor.fees}</strong>
                  </div>
                  <Button 
                    as={Link} 
                    to={`/book-appointment/${doctor._id}`}
                    variant="primary" 
                    size="sm" 
                    className="w-100"
                  >
                    Book Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default UserDashboard;