import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaFilter } from 'react-icons/fa';
import { doctorService } from '../services/api';
import './DoctorsList.css';

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
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
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
      const searchLower = filters.search.toLowerCase();
      return doctor.fullName?.toLowerCase().includes(searchLower) ||
             doctor.specialization?.toLowerCase().includes(searchLower) ||
             doctor.address?.city?.toLowerCase().includes(searchLower);
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
              <Button variant="primary" onClick={() => {}}>
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
                      <Button 
                        variant="primary" 
                        className="w-100"
                        onClick={applyFilters}
                      >
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
              Found <strong>{filteredDoctors.length}</strong> doctors
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
                        <img 
                          src={doctor.profileImage || 'https://via.placeholder.com/100'}
                          alt={doctor.fullName}
                          className="img-fluid rounded-circle"
                        />
                      </Col>
                      <Col xs={8}>
                        <h5 className="mb-1">{doctor.fullName}</h5>
                        <p className="text-primary mb-1">{doctor.specialization}</p>
                        <div className="d-flex align-items-center mb-2">
                          <FaStar className="text-warning me-1" />
                          <span>{doctor.rating || 'New'}</span>
                          <span className="text-muted ms-2">({doctor.totalReviews || 0} reviews)</span>
                        </div>
                      </Col>
                    </Row>
                    
                    <hr />
                    
                    <div className="doctor-details">
                      <p className="mb-2">
                        <strong>Experience:</strong> {doctor.experience} years
                      </p>
                      <p className="mb-2">
                        <strong>Location:</strong> {doctor.address?.city || 'N/A'}
                      </p>
                      <p className="mb-3">
                        <strong>Consultation Fee:</strong> <span className="text-primary fw-bold">${doctor.fees}</span>
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