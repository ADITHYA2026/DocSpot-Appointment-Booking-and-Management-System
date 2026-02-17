import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1 text-primary fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead text-muted mb-5">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/" variant="primary" size="lg">
              <FaHome className="me-2" /> Go Home
            </Button>
            <Button as={Link} to="/doctors" variant="outline-primary" size="lg">
              <FaSearch className="me-2" /> Find Doctors
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;