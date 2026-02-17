import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaFilter } from 'react-icons/fa';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  const fetchDoctors = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await adminService.getDoctors(params);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await adminService.updateDoctorStatus(doctorId, { status: 'approved' });
      toast.success('Doctor approved successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to approve doctor');
    }
  };

  const handleReject = async () => {
    try {
      await adminService.updateDoctorStatus(selectedDoctor._id, { 
        status: 'rejected',
        rejectionReason 
      });
      toast.success('Doctor rejected');
      setShowModal(false);
      setRejectionReason('');
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to reject doctor');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
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
          <h2>Manage Doctors</h2>
        </Col>
        <Col xs="auto">
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Doctors</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Form.Select>
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
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Fees</th>
                      <th>Status</th>
                      <th>Applied On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.length > 0 ? (
                      doctors.map(doctor => (
                        <tr key={doctor._id}>
                          <td>
                            <strong>{doctor.fullName}</strong>
                            <br />
                            <small>{doctor.email}</small>
                          </td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.experience} years</td>
                          <td>${doctor.fees}</td>
                          <td>{getStatusBadge(doctor.status)}</td>
                          <td>{new Date(doctor.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setShowModal(true);
                              }}
                            >
                              <FaEye />
                            </Button>
                            {doctor.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleApprove(doctor._id)}
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setShowModal(true);
                                  }}
                                >
                                  <FaTimes />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No doctors found
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

      {/* Doctor Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Doctor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <div>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <img 
                    src={selectedDoctor.profileImage || 'https://via.placeholder.com/150'}
                    alt={selectedDoctor.fullName}
                    className="img-fluid rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <h5>{selectedDoctor.fullName}</h5>
                  <p className="text-muted">{selectedDoctor.specialization}</p>
                </Col>
                <Col md={8}>
                  <h6>Personal Information</h6>
                  <p><strong>Email:</strong> {selectedDoctor.email}</p>
                  <p><strong>Phone:</strong> {selectedDoctor.phone}</p>
                  <p><strong>Experience:</strong> {selectedDoctor.experience} years</p>
                  <p><strong>Consultation Fee:</strong> ${selectedDoctor.fees}</p>
                  
                  <h6 className="mt-3">Address</h6>
                  <p>
                    {selectedDoctor.address?.street}<br />
                    {selectedDoctor.address?.city}, {selectedDoctor.address?.state} {selectedDoctor.address?.zipCode}
                  </p>

                  <h6 className="mt-3">Qualifications</h6>
                  {selectedDoctor.qualifications?.map((qual, index) => (
                    <p key={index}>
                      {qual.degree} from {qual.institution} ({qual.year})
                    </p>
                  ))}

                  {selectedDoctor.bio && (
                    <>
                      <h6 className="mt-3">Bio</h6>
                      <p>{selectedDoctor.bio}</p>
                    </>
                  )}
                </Col>
              </Row>

              {selectedDoctor.status === 'pending' && (
                <div className="mt-4">
                  <h6>Rejection Reason (Optional)</h6>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter reason for rejection (if any)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </Form.Group>
                  <div className="text-end mt-3">
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={() => handleApprove(selectedDoctor._id)}
                    >
                      <FaCheck /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleReject}
                    >
                      <FaTimes /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageDoctors;