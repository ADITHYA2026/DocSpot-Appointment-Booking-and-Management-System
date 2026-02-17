import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { FaUserCircle, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords if trying to change
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    
    try {
      // Prepare update data (only send fields that changed)
      const updateData = {
        name: formData.name,
        phone: formData.phone
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await authService.updateProfile(updateData);
      
      if (response.data.success) {
        updateUser(response.data.data);
        toast.success('Profile updated successfully');
        setEditMode(false);
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
      <Container className="py-4">
        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white py-3">
                <h4 className="mb-0">
                  <FaUserCircle className="me-2" />
                  My Profile
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                
                {/* Profile Summary Card */}
                <Row className="mb-4">
                  <Col md={12}>
                    <div className="bg-light p-4 rounded-3">
                      <Row>
                        <Col md={8}>
                          <h5>{user?.name}</h5>
                          <p className="text-muted mb-2">
                            <FaEnvelope className="me-2 text-primary" />
                            {user?.email}
                          </p>
                          <p className="text-muted mb-2">
                            <FaPhone className="me-2 text-primary" />
                            {user?.phone || 'Not provided'}
                          </p>
                          <p className="text-muted mb-0">
                            <FaCalendarAlt className="me-2 text-primary" />
                            Member since: {formatDate(user?.createdAt)}
                          </p>
                        </Col>
                        <Col md={4} className="text-end">
                          <div className="badge bg-primary p-3 rounded-3">
                            <h6 className="mb-0 text-white">Role</h6>
                            <h5 className="mb-0 text-white text-uppercase">
                              {user?.type || 'Patient'}
                            </h5>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>

                {!editMode ? (
                  <div className="text-center">
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <h5 className="mb-3">Edit Profile Information</h5>
                    
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Full Name</Form.Label>
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
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={formData.email}
                            disabled
                            readOnly
                          />
                          <Form.Text className="text-muted">
                            Email cannot be changed
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <h5 className="mt-4 mb-3">Change Password (Optional)</h5>
                    
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setEditMode(false);
                          // Reset form to original user data
                          setFormData({
                            name: user.name || '',
                            phone: user.phone || '',
                            email: user.email || '',
                            password: '',
                            confirmPassword: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;