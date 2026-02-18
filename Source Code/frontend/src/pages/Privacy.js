import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <h1 className="fw-bold mb-4">Privacy Policy</h1>
              <p className="text-muted">Last updated: January 2024</p>
              <hr />

              <h5 className="mt-4">1. Information We Collect</h5>
              <p>
                We collect information you provide directly (name, email, phone) and
                information about your use of our service (appointments, activity logs).
              </p>

              <h5 className="mt-4">2. How We Use Your Information</h5>
              <p>
                Your information is used to facilitate appointment bookings, send
                notifications, and improve our services. We do not sell your personal data.
              </p>

              <h5 className="mt-4">3. Data Security</h5>
              <p>
                We implement industry-standard security measures including encryption and
                access controls to protect your personal information.
              </p>

              <h5 className="mt-4">4. Medical Information</h5>
              <p>
                Any medical documents or health information you upload is stored securely
                and only shared with the healthcare provider you book with.
              </p>

              <h5 className="mt-4">5. Cookies</h5>
              <p>
                We use session tokens stored in localStorage to keep you logged in.
                No tracking cookies are used for advertising purposes.
              </p>

              <h5 className="mt-4">6. Contact Us</h5>
              <p>
                For privacy-related questions, please visit our{' '}
                <Link to="/contact" className="text-decoration-none">Contact page</Link>.
              </p>

              <div className="text-center mt-5">
                <Link to="/register" className="btn btn-primary px-4">
                  Back to Registration
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Privacy;