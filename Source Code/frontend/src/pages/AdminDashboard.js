import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserMd, FaCalendarCheck, FaClock, FaDollarSign } from 'react-icons/fa';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0
  });
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchDashboardData();

  // Auto refresh every 10 seconds
  const interval = setInterval(() => {
    fetchDashboardData();
  }, 10000);

  return () => clearInterval(interval);
}, []);


  const fetchDashboardData = async () => {
    try {
      const [statsRes, doctorsRes, appointmentsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getDoctors({ status: 'pending' }),
        adminService.getAppointments()
      ]);

      setStats(statsRes.data.data);
      setRecentDoctors(doctorsRes.data.data.slice(0, 5));
      setRecentAppointments(appointmentsRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stats-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50">Total Users</h6>
                  <h3>{stats.totalUsers}</h3>
                </div>
                <FaUsers size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50">Total Doctors</h6>
                  <h3>{stats.totalDoctors}</h3>
                </div>
                <FaUserMd size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50">Pending Approvals</h6>
                  <h3>{stats.pendingDoctors}</h3>
                </div>
                <FaClock size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stats-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50">Total Appointments</h6>
                  <h3>{stats.totalAppointments}</h3>
                </div>
                <FaCalendarCheck size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Doctor Approvals</h5>
              <Button as={Link} to="/admin/doctors" variant="link" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDoctors.length > 0 ? (
                      recentDoctors.map(doctor => (
                        <tr key={doctor._id}>
                          <td>{doctor.fullName}</td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.experience} years</td>
                          <td>
                            <Button
                              as={Link}
                              to={`/admin/doctors`}
                              variant="primary"
                              size="sm"
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No pending approvals
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Appointments</h5>
              <Button as={Link} to="/admin/appointments" variant="link" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.length > 0 ? (
                      recentAppointments.map(app => (
                        <tr key={app._id}>
                          <td>{app.userInfo?.name}</td>
                          <td>{app.doctorInfo?.name}</td>
                          <td>{new Date(app.date).toLocaleDateString()}</td>
                          <td>{getStatusBadge(app.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No recent appointments
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/admin/users" variant="outline-primary" className="w-100">
                    <FaUsers className="me-2" /> Manage Users
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/admin/doctors" variant="outline-success" className="w-100">
                    <FaUserMd className="me-2" /> Manage Doctors
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/admin/appointments" variant="outline-info" className="w-100">
                    <FaCalendarCheck className="me-2" /> View Appointments
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/admin/reports" variant="outline-warning" className="w-100">
                    <FaDollarSign className="me-2" /> Revenue Reports
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;