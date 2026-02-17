import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-4 mb-3">Contact Us</h1>
          <p className="lead text-muted">
            Have questions? We'd love to hear from you.
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center">
              <FaMapMarkerAlt className="text-primary mb-3" size={32} />
              <h5>Visit Us</h5>
              <p className="text-muted mb-0">
                123 Healthcare Avenue<br />
                Medical District<br />
                New York, NY 10001
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center">
              <FaPhone className="text-primary mb-3" size={32} />
              <h5>Call Us</h5>
              <p className="text-muted mb-0">
                +1 (555) 123-4567<br />
                Toll-free: 1-800-DOCSPOT
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center">
              <FaEnvelope className="text-primary mb-3" size={32} />
              <h5>Email Us</h5>
              <p className="text-muted mb-0">
                support@docspot.com<br />
                careers@docspot.com
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaClock className="text-primary mb-3" size={32} />
              <h5>Business Hours</h5>
              <p className="text-muted mb-0">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 2:00 PM<br />
                Sunday: Closed
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <h3 className="mb-4">Send us a Message</h3>
              
              {submitted && (
                <Alert variant="success" className="mb-4">
                  Thank you for contacting us! We'll get back to you soon.
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Your Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" size="lg">
                  Send Message
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;