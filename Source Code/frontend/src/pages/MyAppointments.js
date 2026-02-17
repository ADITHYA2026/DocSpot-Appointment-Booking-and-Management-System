import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaCalendar, FaClock, FaUserMd, FaFile, FaTrash, FaSync } from 'react-icons/fa';
import { appointmentService } from '../services/api';
import { toast } from 'react-toastify';
import './MyAppointments.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getUserAppointments();
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
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
    return <Badge bg={variants[status] || 'primary'}>{status.toUpperCase()}</Badge>;
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await appointmentService.cancelAppointment(selectedAppointment._id, cancelReason);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select new date and time');
      return;
    }

    try {
      await appointmentService.rescheduleAppointment(selectedAppointment._id, {
        date: rescheduleDate,
        timeSlot: {
          start: rescheduleTime,
          end: calculateEndTime(rescheduleTime)
        }
      });
      toast.success('Appointment rescheduled successfully');
      fetchAppointments();
      setShowRescheduleModal(false);
      setRescheduleDate('');
      setRescheduleTime('');
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Failed to reschedule appointment');
    }
  };

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
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
    <div className="my-appointments-page">
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>My Appointments</h2>
            <p className="text-muted">View and manage your appointment bookings</p>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                {appointments.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="appointments-table">
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Specialization</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map(app => (
                          <tr key={app._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <FaUserMd className="text-primary me-2" />
                                {app.doctorInfo?.name}
                              </div>
                            </td>
                            <td>{app.doctorInfo?.specialization}</td>
                            <td>
                              <div>
                                <FaCalendar className="me-1 text-muted" />
                                {new Date(app.date).toLocaleDateString()}
                              </div>
                              <div>
                                <FaClock className="me-1 text-muted" />
                                {app.timeSlot?.start} - {app.timeSlot?.end}
                              </div>
                            </td>
                            <td>{getStatusBadge(app.status)}</td>
                            <td>
                              {app.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => {
                                      setSelectedAppointment(app);
                                      setShowRescheduleModal(true);
                                    }}
                                  >
                                    <FaSync />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAppointment(app);
                                      setShowCancelModal(true);
                                    }}
                                  >
                                    <FaTrash />
                                  </Button>
                                </>
                              )}
                              {app.documents?.length > 0 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => window.open(app.documents[0].path, '_blank')}
                                >
                                  <FaFile />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h5>No appointments found</h5>
                    <p className="text-muted">Book your first appointment now!</p>
                    <Button href="/doctors" variant="primary">
                      Find Doctors
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Cancel Modal */}
        <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Cancel Appointment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Reason for Cancellation</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Close
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Cancel Appointment
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reschedule Modal */}
        <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reschedule Appointment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>New Date</Form.Label>
                <Form.Control
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Time</Form.Label>
                <Form.Control
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleReschedule}>
              Confirm Reschedule
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyAppointments;