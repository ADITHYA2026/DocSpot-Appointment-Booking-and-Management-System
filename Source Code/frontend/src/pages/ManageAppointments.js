import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { FaEye, FaFilter } from 'react-icons/fa';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [filter, dateFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await adminService.getAppointments();
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (filter !== 'all') {
      filtered = filtered.filter(a => a.status === filter);
    }

    if (dateFilter) {
      filtered = filtered.filter(a => 
        new Date(a.date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFilteredAppointments(filtered);
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

  const getPaymentBadge = (status) => {
    return status === 'paid' ? 
      <Badge bg="success">Paid</Badge> : 
      <Badge bg="warning">Pending</Badge>;
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
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Date</Form.Label>
            <Form.Control
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map(app => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.userInfo?.name}</strong>
                            <br />
                            <small>{app.userInfo?.phone}</small>
                          </td>
                          <td>
                            <strong>{app.doctorInfo?.name}</strong>
                            <br />
                            <small>{app.doctorInfo?.specialization}</small>
                          </td>
                          <td>
                            {new Date(app.date).toLocaleDateString()}
                            <br />
                            <small>{app.timeSlot?.start} - {app.timeSlot?.end}</small>
                          </td>
                          <td>{getStatusBadge(app.status)}</td>
                          <td>{getPaymentBadge(app.paymentStatus)}</td>
                          <td>${app.doctorInfo?.fees}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {/* View details */}}
                            >
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No appointments found
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
    </Container>
  );
};

export default ManageAppointments;