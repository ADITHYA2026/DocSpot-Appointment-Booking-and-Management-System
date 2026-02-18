import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/api';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await doctorService.getAppointments();
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // BUG FIX: Was calling updateAppointmentStatus(appointmentId, status) correctly
  // but the original DoctorAppointments also had this fine.
  // Keeping consistent — pass plain string, let api.js service wrap it.
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
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Manage Appointments</h2>
          <p className="text-muted">Review and respond to patient appointment requests</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              {appointments.length === 0 ? (
                <p className="text-center text-muted py-4">No appointments found</p>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(app => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.userInfo?.name}</strong>
                            <br />
                            <small className="text-muted">{app.userInfo?.phone}</small>
                          </td>
                          <td>{new Date(app.date).toLocaleDateString()}</td>
                          <td>{app.timeSlot?.start} – {app.timeSlot?.end}</td>
                          <td>
                            <small>{app.reason || '—'}</small>
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
                            {app.status === 'approved' && (
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleStatusUpdate(app._id, 'completed')}
                              >
                                Mark Complete
                              </Button>
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
  );
};

export default DoctorAppointments;