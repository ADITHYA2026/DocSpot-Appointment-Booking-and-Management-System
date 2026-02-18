import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaFilter } from 'react-icons/fa';
import { doctorService } from '../services/api';
import './DoctorsList.css';

// ── PROFILE IMAGE FIX ──────────────────────────────────────────────────────
// New doctors who register have profileImage = 'default-doctor.png' (a local
// file that doesn't exist) or null. Both render as a broken/grey placeholder.
// This component generates a coloured circle with initials (e.g. "PK" for
// Pradeep Kumar, "NI" for Nikhil) as a fallback — exactly like Google/GitHub.

// Pick a consistent color per doctor based on their name
const AVATAR_COLORS = [
  '#0d6efd', // blue
  '#198754', // green
  '#dc3545', // red
  '#6f42c1', // purple
  '#fd7e14', // orange
  '#20c997', // teal
  '#0dcaf0', // cyan
  '#d63384', // pink
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
  if (parts.length === 0 || !parts[0]) return '?';
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
          display: 'block',
          margin: '0 auto',
        }}
      />
    );
  }

  // Initials avatar fallback
  const color = getAvatarColor(doctor.fullName);
  const initials = getInitials(doctor.fullName);
  const fontSize = size * 0.36;

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
        margin: '0 auto',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: '#ffffff',
          fontSize: fontSize,
          fontWeight: '700',
          letterSpacing: '1px',
          lineHeight: 1,
          fontFamily: 'Segoe UI, sans-serif',
          userSelect: 'none',
        }}
      >
        {initials}
      </span>
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getDoctors();
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.city) params.city = filters.city;
      const response = await doctorService.getDoctors(params);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        doctor.fullName?.toLowerCase().includes(q) ||
        doctor.specialization?.toLowerCase().includes(q) ||
        doctor.address?.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];
  const cities = [...new Set(doctors.map(d => d.address?.city).filter(Boolean))];

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
    <div className="doctors-list-page">
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2>Find a Doctor</h2>
            <p className="text-muted">Browse through our list of qualified healthcare professionals</p>
          </Col>
        </Row>

        {/* Search Bar */}
        <Row className="mb-4">
          <Col lg={8} className="mx-auto">
            <InputGroup className="search-bar">
              <Form.Control
                placeholder="Search by doctor name, specialization, or city..."
                value={filters.search}
                onChange={handleFilterChange}
                name="search"
              />
              <Button variant="primary">
                <FaSearch />
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
              </Button>
            </InputGroup>
          </Col>
        </Row>

        {/* Filters */}
        {showFilters && (
          <Row className="mb-4">
            <Col lg={8} className="mx-auto">
              <Card className="filters-card">
                <Card.Body>
                  <Row>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>Specialization</Form.Label>
                        <Form.Select
                          name="specialization"
                          value={filters.specialization}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Specializations</option>
                          {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Select
                          name="city"
                          value={filters.city}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Cities</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button variant="primary" className="w-100 mb-3" onClick={applyFilters}>
                        Apply
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Results Count */}
        <Row className="mb-3">
          <Col>
            <p className="text-muted">
              Found <strong>{filteredDoctors.length}</strong> doctor{filteredDoctors.length !== 1 ? 's' : ''}
            </p>
          </Col>
        </Row>

        {/* Doctors Grid */}
        <Row>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doctor => (
              <Col lg={4} md={6} className="mb-4" key={doctor._id}>
                <Card className="doctor-card h-100 shadow-sm">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs={4}>
                        {/* FIXED: DoctorAvatar renders initials when no real photo */}
                        <DoctorAvatar doctor={doctor} size={80} />
                      </Col>
                      <Col xs={8}>
                        <h5 className="mb-1">{doctor.fullName}</h5>
                        <p className="text-primary mb-1">{doctor.specialization}</p>
                        <div className="d-flex align-items-center mb-2">
                          <FaStar className="text-warning me-1" />
                          <span>{doctor.rating > 0 ? doctor.rating : 'New'}</span>
                          <span className="text-muted ms-2">({doctor.totalReviews || 0} reviews)</span>
                        </div>
                      </Col>
                    </Row>

                    <hr />

                    <div className="doctor-details">
                      <p className="mb-2">
                        <strong>Experience:</strong> {doctor.experience ? `${doctor.experience} years` : 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Location:</strong> {doctor.address?.city || 'N/A'}
                      </p>
                      <p className="mb-3">
                        <strong>Consultation Fee:</strong>{' '}
                        <span className="text-primary fw-bold">
                          {doctor.fees ? `$${doctor.fees}` : 'N/A'}
                        </span>
                      </p>
                    </div>

                    <Button
                      as={Link}
                      to={`/book-appointment/${doctor._id}`}
                      variant="primary"
                      className="w-100"
                    >
                      Book Appointment
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <div className="text-center py-5">
                <h4>No doctors found</h4>
                <p className="text-muted">Try adjusting your filters or search criteria</p>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default DoctorsList;