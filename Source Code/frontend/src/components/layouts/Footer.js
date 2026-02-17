import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt 
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light mt-5">
      <Container className="py-4">
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">DocSpot</h5>
            <p className="text-muted">
              Your trusted platform for seamless doctor appointments. 
              Book appointments with the best healthcare providers instantly.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light me-3">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-light">
                <FaLinkedin size={20} />
              </a>
            </div>
          </Col>

          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li><Link to="/doctors" className="text-muted text-decoration-none">Find Doctors</Link></li>
              <li><Link to="/about" className="text-muted text-decoration-none">About Us</Link></li>
              <li><Link to="/contact" className="text-muted text-decoration-none">Contact</Link></li>
            </ul>
          </Col>

          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="mb-3">For Doctors</h6>
            <ul className="list-unstyled">
              <li><Link to="/register?type=doctor" className="text-muted text-decoration-none">Join as Doctor</Link></li>
              <li><Link to="/login" className="text-muted text-decoration-none">Doctor Login</Link></li>
              <li><Link to="/faq" className="text-muted text-decoration-none">FAQ</Link></li>
              <li><Link to="/support" className="text-muted text-decoration-none">Support</Link></li>
            </ul>
          </Col>

          <Col md={3}>
            <h6 className="mb-3">Contact Info</h6>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                123 Healthcare Ave, Medical District
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" />
                +1 (555) 123-4567
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                support@docspot.com
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="bg-secondary" />

        <Row>
          <Col className="text-center text-muted">
            <small>
              &copy; {new Date().getFullYear()} DocSpot. All rights reserved. 
              <Link to="/privacy" className="text-muted ms-3">Privacy Policy</Link>
              <Link to="/terms" className="text-muted ms-3">Terms of Service</Link>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;