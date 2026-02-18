import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <h1 className="fw-bold mb-4">Terms of Service</h1>
              <p className="text-muted">Last updated: January 2024</p>
              <hr />

              <h5 className="mt-4">1. Acceptance of Terms</h5>
              <p>
                By using DocSpot, you agree to these Terms of Service. If you do not agree,
                please do not use this platform.
              </p>

              <h5 className="mt-4">2. Use of Service</h5>
              <p>
                DocSpot is a healthcare appointment booking platform. You agree to use the
                service only for lawful purposes and in accordance with these terms.
              </p>

              <h5 className="mt-4">3. User Accounts</h5>
              <p>
                You are responsible for maintaining the confidentiality of your account
                credentials and for all activity that occurs under your account.
              </p>

              <h5 className="mt-4">4. Medical Disclaimer</h5>
              <p>
                DocSpot facilitates appointment booking only. It does not provide medical
                advice. Always consult a qualified healthcare provider for medical decisions.
              </p>

              <h5 className="mt-4">5. Privacy</h5>
              <p>
                Your use of DocSpot is also governed by our{' '}
                <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>.
              </p>

              <h5 className="mt-4">6. Changes to Terms</h5>
              <p>
                We may update these terms from time to time. Continued use of DocSpot
                after changes constitutes acceptance of the new terms.
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

export default Terms;