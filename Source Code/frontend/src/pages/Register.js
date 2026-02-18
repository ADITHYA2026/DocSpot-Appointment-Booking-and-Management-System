import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserMd } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const doctorParam = searchParams.get('type') === 'doctor';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    isDoctor: doctorParam
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setFormData(prev => ({ ...prev, isDoctor: doctorParam }));
  }, [doctorParam]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setPasswordError('');
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(formData);

    if (result.success) {
      if (formData.isDoctor) {
        // FIX 6: Was '/doctor/application-status' which doesn't exist in App.js routes.
        // Redirect to doctor dashboard instead — the pending status is shown there.
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error?.response?.data?.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-4">
          <Col md={10} lg={8} xl={6}>
            <Card className="auth-card shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="auth-icon">
                    {formData.isDoctor ? (
                      <FaUserMd size={50} className="text-primary" />
                    ) : (
                      <FaUser size={50} className="text-primary" />
                    )}
                  </div>
                  <h2 className="fw-bold">
                    {formData.isDoctor ? 'Join as Doctor' : 'Create Account'}
                  </h2>
                  <p className="text-muted">
                    {formData.isDoctor
                      ? 'Register to start accepting appointments'
                      : 'Sign up to book appointments with top doctors'}
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {formData.isDoctor && (
                  <Alert variant="info" className="mb-4">
                    Your application will be reviewed by our admin team.
                    You'll be notified once approved.
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FaUser className="text-primary" />
                          </span>
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="border-0 bg-light"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FaEnvelope className="text-primary" />
                          </span>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="border-0 bg-light"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FaPhone className="text-primary" />
                          </span>
                          <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (10 digits)"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="border-0 bg-light"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FaLock className="text-primary" />
                          </span>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="border-0 bg-light"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FaLock className="text-primary" />
                          </span>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="border-0 bg-light"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    {passwordError && (
                      <Col md={12} className="mb-3">
                        <Alert variant="danger" className="py-2">
                          {passwordError}
                        </Alert>
                      </Col>
                    )}
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label={
                        <span className="text-muted">
                          I agree to the{' '}
                          <Link to="/terms" className="text-decoration-none">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-decoration-none">
                            Privacy Policy
                          </Link>
                        </span>
                      }
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-4"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <Link to="/login" className="text-decoration-none fw-bold">
                        Sign In
                      </Link>
                    </p>

                    {!formData.isDoctor && (
                      <p className="text-muted mt-3 mb-0">
                        Are you a doctor?{' '}
                        <Link to="/register?type=doctor" className="text-decoration-none">
                          Register as Doctor
                        </Link>
                      </p>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;