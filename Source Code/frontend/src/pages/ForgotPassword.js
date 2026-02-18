import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaUserMd } from 'react-icons/fa';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Wire up to backend password reset endpoint when implemented
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={8} lg={6} xl={5}>
            <Card className="auth-card shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="auth-icon">
                    <FaUserMd size={50} className="text-primary" />
                  </div>
                  <h2 className="fw-bold">Forgot Password</h2>
                  <p className="text-muted">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {submitted ? (
                  <Alert variant="success">
                    If an account with that email exists, a password reset link has been sent.
                    Please check your inbox.
                  </Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <FaEnvelope className="text-primary" />
                        </span>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="border-0 bg-light"
                        />
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 mb-4"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </Form>
                )}

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Remember your password?{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;