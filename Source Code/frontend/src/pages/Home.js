import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Carousel } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaClock, 
  FaUserMd, 
  FaShieldAlt, 
  FaMobile, 
  FaStar,
  FaArrowRight 
} from 'react-icons/fa';
import { doctorService } from '../services/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    satisfaction: 0
  });

  useEffect(() => {
    fetchFeaturedDoctors();
    fetchStats();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      const response = await doctorService.getDoctors({ limit: 6 });
      setFeaturedDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching featured doctors:', error);
    }
  };

  const fetchStats = async () => {
    // Mock stats for demo
    setStats({
      doctors: 150,
      patients: 5000,
      appointments: 15000,
      satisfaction: 98
    });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Your Health, Our Priority
              </h1>
              <p className="lead mb-4">
                Book appointments with the best doctors instantly. 
                No more waiting in queues or playing phone tag with receptionists.
              </p>
              <div className="hero-buttons">
                <Button 
                  as={Link} 
                  to="/doctors" 
                  variant="light" 
                  size="lg" 
                  className="me-3 mb-2"
                >
                  Find a Doctor <FaArrowRight className="ms-2" />
                </Button>
                <Button 
                  as={Link} 
                  to="/register?type=doctor" 
                  variant="outline-light" 
                  size="lg" 
                  className="mb-2"
                >
                  Join as Doctor
                </Button>
              </div>
              
              {/* Stats */}
              <Row className="mt-5">
                <Col xs={6} md={3} className="mb-3">
                  <div className="stat-item">
                    <h3 className="h2 fw-bold">{stats.doctors}+</h3>
                    <p className="mb-0">Expert Doctors</p>
                  </div>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <div className="stat-item">
                    <h3 className="h2 fw-bold">{stats.patients}+</h3>
                    <p className="mb-0">Happy Patients</p>
                  </div>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <div className="stat-item">
                    <h3 className="h2 fw-bold">{stats.appointments}+</h3>
                    <p className="mb-0">Appointments</p>
                  </div>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <div className="stat-item">
                    <h3 className="h2 fw-bold">{stats.satisfaction}%</h3>
                    <p className="mb-0">Satisfaction</p>
                  </div>
                </Col>
              </Row>
            </Col>
            
            <Col lg={6}>
              <img 
                src="/images/hero-doctor.svg" 
                alt="Doctors" 
                className="img-fluid floating-animation"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Doctors';
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5">Why Choose DocSpot?</h2>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaClock size={40} className="text-primary" />
                  </div>
                  <h5>24/7 Booking</h5>
                  <p className="text-muted">
                    Book appointments anytime, anywhere with our 24/7 platform
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaUserMd size={40} className="text-primary" />
                  </div>
                  <h5>Expert Doctors</h5>
                  <p className="text-muted">
                    Access to 150+ verified and experienced doctors
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaShieldAlt size={40} className="text-primary" />
                  </div>
                  <h5>Secure & Private</h5>
                  <p className="text-muted">
                    Your health data is encrypted and kept confidential
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3} className="mb-4">
              <Card className="feature-card h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <FaMobile size={40} className="text-primary" />
                  </div>
                  <h5>Mobile Friendly</h5>
                  <p className="text-muted">
                    Fully responsive design works on all devices
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Doctors */}
      <section className="featured-doctors-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Our Featured Doctors</h2>
          <Row>
            {featuredDoctors.map(doctor => (
              <Col lg={4} md={6} className="mb-4" key={doctor._id}>
                <Card className="doctor-card h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="doctor-avatar me-3">
                        <img 
                          src={doctor.profileImage || '/images/default-doctor.png'}
                          alt={doctor.fullName}
                          className="rounded-circle"
                          width="60"
                          height="60"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60';
                          }}
                        />
                      </div>
                      <div>
                        <h5 className="mb-1">{doctor.fullName}</h5>
                        <p className="text-primary mb-0">{doctor.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="doctor-info mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Experience:</span>
                        <span className="fw-bold">{doctor.experience} years</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Consultation Fee:</span>
                        <span className="fw-bold text-primary">${doctor.fees}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Rating:</span>
                        <span className="text-warning">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.floor(doctor.rating) ? 'text-warning' : 'text-secondary'} />
                          ))}
                          <span className="ms-2 text-dark">({doctor.totalReviews})</span>
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline-primary" 
                      className="w-100"
                      onClick={() => navigate(`/book-appointment/${doctor._id}`)}
                    >
                      Book Appointment
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div className="text-center mt-4">
            <Button 
              as={Link} 
              to="/doctors" 
              variant="primary" 
              size="lg"
            >
              View All Doctors <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section py-5">
        <Container>
          <h2 className="text-center mb-5">What Our Patients Say</h2>
          <Carousel indicators={false} interval={5000}>
            <Carousel.Item>
              <Row className="justify-content-center">
                <Col md={8}>
                  <Card className="testimonial-card border-0 shadow-sm">
                    <Card.Body className="text-center p-5">
                      <img 
                        src="/images/testimonial-1.jpg" 
                        alt="Patient"
                        className="rounded-circle mb-4"
                        width="80"
                        height="80"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80';
                        }}
                      />
                      <p className="lead mb-4">
                        "DocSpot made it so easy to find and book an appointment with a cardiologist. 
                        The whole process took less than 5 minutes!"
                      </p>
                      <h5 className="mb-1">John Smith</h5>
                      <p className="text-muted">Patient</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Carousel.Item>

            <Carousel.Item>
              <Row className="justify-content-center">
                <Col md={8}>
                  <Card className="testimonial-card border-0 shadow-sm">
                    <Card.Body className="text-center p-5">
                      <img 
                        src="/images/testimonial-2.jpg" 
                        alt="Patient"
                        className="rounded-circle mb-4"
                        width="80"
                        height="80"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80';
                        }}
                      />
                      <p className="lead mb-4">
                        "As a working professional, the ability to book evening appointments has been a lifesaver. 
                        Highly recommended!"
                      </p>
                      <h5 className="mb-1">Sarah Johnson</h5>
                      <p className="text-muted">Patient</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Carousel.Item>
          </Carousel>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-primary text-white py-5">
        <Container className="text-center">
          <h2 className="mb-4">Ready to Book Your Appointment?</h2>
          <p className="lead mb-4">
            Join thousands of satisfied patients who have simplified their healthcare journey with DocSpot.
          </p>
          <Button 
            as={Link} 
            to="/register" 
            variant="light" 
            size="lg"
            className="me-3 mb-2"
          >
            Get Started Now
          </Button>
          <Button 
            as={Link} 
            to="/contact" 
            variant="outline-light" 
            size="lg"
            className="mb-2"
          >
            Contact Us
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default Home;