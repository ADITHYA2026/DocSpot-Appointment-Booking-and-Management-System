import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaClock, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await doctorService.getAppointments();
      const data = response.data.data || [];
      setAppointments(data);

      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        approved: data.filter(a => a.status === 'approved').length,
        completed: data.filter(a => a.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // BUG FIX: Was calling updateAppointmentStatus(appointmentId, { status })
  // which double-wraps the status: service does api.put(..., { status })
  // so body becomes { status: { status: 'approved' } } — backend gets an object, not string.
  // Fix: pass the plain string 'approved' / 'rejected' directly.
  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await doctorService.updateAppointmentStatus(appointmentId, status);
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      completed: 'info',
      cancelled: 'secondary'
    };
    return <Badge bg={variants[status] || 'primary'}>{status}</Badge>;
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
              <h2>Dr. {user?.name}</h2>
              <p className="mb-0">Manage your appointments and schedule</p>
            </Col>
            <Col xs="auto">
              <Button as={Link} to="/doctor/profile" variant="light">
                Edit Profile
              </Button>
            </Col>
          </Row>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="stats-card bg-primary text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50">Total Appointments</h6>
                    <h3>{stats.total}</h3>
                  </div>
                  <FaCalendarCheck size={40} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stats-card bg-warning text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50">Pending</h6>
                    <h3>{stats.pending}</h3>
                  </div>
                  <FaClock size={40} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stats-card bg-success text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50">Approved</h6>
                    <h3>{stats.approved}</h3>
                  </div>
                  <FaCheck size={40} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stats-card bg-info text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50">Completed</h6>
                    <h3>{stats.completed}</h3>
                  </div>
                  <FaUser size={40} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Appointments */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Appointments</h5>
                <Button as={Link} to="/doctor/appointments" variant="link" size="sm">
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {appointments.length === 0 ? (
                  <p className="text-center text-muted py-4">No appointments yet</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 5).map(app => (
                          <tr key={app._id}>
                            <td>{app.userInfo?.name}</td>
                            <td>
                              {new Date(app.date).toLocaleDateString()} {app.timeSlot?.start}
                            </td>
                            <td>{getStatusBadge(app.status)}</td>
                            <td>
                              {app.status === 'pending' && (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleStatusUpdate(app._id, 'approved')}
                                  >
                                    <FaCheck /> Approve
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                  >
                                    <FaTimes /> Reject
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorDashboard;