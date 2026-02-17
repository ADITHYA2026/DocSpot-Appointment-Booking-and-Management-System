import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaHeart, FaHandsHelping, FaShieldAlt, FaRocket } from 'react-icons/fa';

const About = () => {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-4 mb-3">About DocSpot</h1>
          <p className="lead text-muted">
            Revolutionizing healthcare accessibility through technology
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={6}>
          <h2>Our Mission</h2>
          <p className="fs-5">
            At DocSpot, we believe that quality healthcare should be accessible to everyone. 
            Our platform bridges the gap between patients and healthcare providers, making 
            appointment booking simple, efficient, and stress-free.
          </p>
          <p>
            Founded in 2024, we've grown to serve thousands of patients and hundreds of 
            doctors across the country. Our commitment to innovation and user experience 
            has made us a trusted name in digital healthcare solutions.
          </p>
        </Col>
        <Col lg={6}>
          <img 
            src="https://via.placeholder.com/600x400" 
            alt="About DocSpot"
            className="img-fluid rounded shadow"
          />
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Our Values</h2>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center border-0 shadow-sm">
            <Card.Body>
              <FaHeart className="text-primary mb-3" size={48} />
              <h4>Patient First</h4>
              <p className="text-muted">
                Every decision we make is focused on improving patient experience and outcomes.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center border-0 shadow-sm">
            <Card.Body>
              <FaHandsHelping className="text-primary mb-3" size={48} />
              <h4>Accessibility</h4>
              <p className="text-muted">
                Making healthcare accessible to everyone, regardless of location or schedule.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center border-0 shadow-sm">
            <Card.Body>
              <FaShieldAlt className="text-primary mb-3" size={48} />
              <h4>Trust & Security</h4>
              <p className="text-muted">
                Your health data is protected with enterprise-grade security measures.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center border-0 shadow-sm">
            <Card.Body>
              <FaRocket className="text-primary mb-3" size={48} />
              <h4>Innovation</h4>
              <p className="text-muted">
                Constantly evolving to bring you the best healthcare technology.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <h2 className="mb-4">Join Us in Transforming Healthcare</h2>
          <p className="mb-4">
            Whether you're a patient looking for convenient care or a doctor wanting to 
            streamline your practice, DocSpot is here for you.
          </p>
          <a href="/register" className="btn btn-primary btn-lg">
            Get Started Today
          </a>
        </Col>
      </Row>
    </Container>
  );
};

export default About;