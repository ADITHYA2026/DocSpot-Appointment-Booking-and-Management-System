import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/api';
import { toast } from 'react-toastify';
import { FaUserMd, FaGraduationCap, FaMapMarkerAlt, FaDollarSign, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import './DoctorProfile.css';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      fullAddress: ''
    },
    specialization: '',
    experience: '',
    fees: '',
    bio: '',
    qualifications: [{ degree: '', institution: '', year: '' }],
    timings: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '10:00', end: '14:00', available: true },
      sunday: { start: '', end: '', available: false }
    }
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  const fetchDoctorProfile = async () => {
  setLoading(true);
  try {
    console.log('Fetching doctor profile for user:', user);
    
    const response = await doctorService.getDoctors();
    console.log('All doctors response:', response.data);
    
    const doctorsList = response.data.data || [];
    const doctorData = doctorsList.find(d => d.userId === user?._id);
    
    console.log('Found doctor data:', doctorData);
    
    if (doctorData) {
      setDoctor(doctorData);
      setFormData({
        fullName: doctorData.fullName || user?.name || '',  // Use user.name as fallback
        phone: doctorData.phone || user?.phone || '',       // Use user.phone as fallback
        address: doctorData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          fullAddress: ''
        },
        specialization: doctorData.specialization || '',
        experience: doctorData.experience || '',
        fees: doctorData.fees || '',
        bio: doctorData.bio || '',
        qualifications: doctorData.qualifications?.length > 0 
          ? doctorData.qualifications 
          : [{ degree: '', institution: '', year: '' }],
        timings: doctorData.timings || {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '10:00', end: '14:00', available: true },
          sunday: { start: '', end: '', available: false }
        }
      });
    } else {
      console.log('No doctor profile found for this user');
      // Pre-fill with user data
      setFormData(prev => ({
        ...prev,
        fullName: user?.name || '',
        phone: user?.phone || ''
      }));
      toast.info('Please complete your doctor profile');
    }
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    toast.error('Failed to load profile');
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (like address fields)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTimingChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      timings: {
        ...prev.timings,
        [day]: {
          ...prev.timings[day],
          [field]: value
        }
      }
    }));
  };

  const handleQualificationChange = (index, field, value) => {
    const updated = [...formData.qualifications];
    updated[index][field] = value;
    setFormData(prev => ({
      ...prev,
      qualifications: updated
    }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', institution: '', year: '' }]
    }));
  };

  const removeQualification = (index) => {
    if (formData.qualifications.length > 1) {
      const updated = formData.qualifications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        qualifications: updated
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    console.log("Current editMode:", editMode);
    console.log("Form data being saved:", formData);
    console.log("Full Name value:", formData.fullName);
    console.log("Phone value:", formData.phone);
    try {
      // Update the doctor profile
      await doctorService.updateProfile(formData);
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchDoctorProfile(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (!doctor) return null;
    
    switch(doctor.status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending Approval</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="doctor-profile-page" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
      <Container className="py-4">
        <Row>
          <Col lg={10} className="mx-auto">
            {/* Header Card */}
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <div className="d-flex align-items-center">
                      <div 
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: '80px', height: '80px', fontSize: '32px' }}
                      >
                        <FaUserMd />
                      </div>
                      <div>
                        <h3 className="mb-1">{doctor?.fullName || user?.name || 'Doctor Profile'}</h3>
                        <p className="text-muted mb-2">{doctor?.specialization || 'Specialization not set'}</p>
                        {getStatusBadge()}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
                    {!editMode ? (
                      <Button 
                        variant="primary" 
                        onClick={() => setEditMode(true)}
                        disabled={doctor?.status === 'pending'}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setEditMode(false);
                          fetchDoctorProfile(); // Reset form
                        }}
                      >
                        Cancel Editing
                      </Button>
                    )}
                    {doctor?.status === 'pending' && (
                      <p className="text-warning mt-2 mb-0">
                        <small>Profile pending approval - editing disabled</small>
                      </p>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Profile Form */}
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                {!doctor ? (
                  <Alert variant="info">
                    <Alert.Heading>Complete Your Profile</Alert.Heading>
                    <p>
                      Please fill in your professional details below to complete your doctor profile.
                      Once submitted, admin will review and approve your profile.
                    </p>
                  </Alert>
                ) : null}
                
                <Form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <h5 className="mb-3 pb-2 border-bottom">
                    <FaUserMd className="me-2 text-primary" />
                    Personal Information
                  </h5>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={formData.fullName || user?.name || ''}
                          onChange={handleChange}
                          disabled={!editMode || doctor?.status === 'pending'}
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
                          value={formData.phone || user?.phone || ''}
                          onChange={handleChange}
                          disabled={!editMode || doctor?.status === 'pending'}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Professional Information */}
                  <h5 className="mb-3 mt-4 pb-2 border-bottom">
                    <FaGraduationCap className="me-2 text-primary" />
                    Professional Information
                  </h5>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Specialization</Form.Label>
                        <Form.Control
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          disabled={!editMode || doctor?.status === 'approved'}
                          required
                          placeholder="e.g., Cardiologist, Dermatologist"
                        />
                        {doctor?.status === 'approved' && (
                          <Form.Text className="text-muted">
                            Specialization cannot be changed after approval
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Experience (years)</Form.Label>
                        <Form.Control
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          disabled={!editMode}
                          required
                          min="0"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <FaDollarSign className="me-1" />
                          Consultation Fee ($)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="fees"
                          value={formData.fees}
                          onChange={handleChange}
                          disabled={!editMode}
                          required
                          min="0"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Bio / Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="Tell patients about yourself, your experience, and approach to care..."
                    />
                  </Form.Group>

                  {/* Address */}
                  <h5 className="mb-3 mt-4 pb-2 border-bottom">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    Clinic Address
                  </h5>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.street"
                          value={formData.address?.street || ''}
                          onChange={handleChange}
                          disabled={!editMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.city"
                          value={formData.address?.city || ''}
                          onChange={handleChange}
                          disabled={!editMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.state"
                          value={formData.address?.state || ''}
                          onChange={handleChange}
                          disabled={!editMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>ZIP Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.zipCode"
                          value={formData.address?.zipCode || ''}
                          onChange={handleChange}
                          disabled={!editMode}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Qualifications */}
                  <h5 className="mb-3 mt-4 pb-2 border-bottom">
                    <FaGraduationCap className="me-2 text-primary" />
                    Qualifications
                  </h5>
                  {formData.qualifications.map((qual, index) => (
                    <Row key={index} className="mb-3 align-items-end">
                      <Col md={4}>
                        <Form.Group>
                          {index === 0 && <Form.Label>Degree</Form.Label>}
                          <Form.Control
                            type="text"
                            placeholder="e.g., MBBS, MD"
                            value={qual.degree}
                            onChange={(e) => handleQualificationChange(index, 'degree', e.target.value)}
                            disabled={!editMode}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          {index === 0 && <Form.Label>Institution</Form.Label>}
                          <Form.Control
                            type="text"
                            placeholder="University/College"
                            value={qual.institution}
                            onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
                            disabled={!editMode}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          {index === 0 && <Form.Label>Year</Form.Label>}
                          <Form.Control
                            type="number"
                            placeholder="Year"
                            value={qual.year}
                            onChange={(e) => handleQualificationChange(index, 'year', e.target.value)}
                            disabled={!editMode}
                          />
                        </Form.Group>
                      </Col>
                      {editMode && (
                        <Col md={1}>
                          {index === formData.qualifications.length - 1 ? (
                            <Button variant="success" size="sm" onClick={addQualification}>
                              +
                            </Button>
                          ) : (
                            <Button variant="danger" size="sm" onClick={() => removeQualification(index)}>
                              -
                            </Button>
                          )}
                        </Col>
                      )}
                    </Row>
                  ))}

                  {/* Working Hours */}
                  <h5 className="mb-3 mt-4 pb-2 border-bottom">
                    <FaClock className="me-2 text-primary" />
                    Working Hours
                  </h5>
                  {daysOfWeek.map(day => (
                    <Row key={day} className="mb-3 align-items-center">
                      <Col md={2}>
                        <Form.Check
                          type="checkbox"
                          label={dayLabels[day]}
                          checked={formData.timings[day]?.available || false}
                          onChange={(e) => handleTimingChange(day, 'available', e.target.checked)}
                          disabled={!editMode}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="time"
                          value={formData.timings[day]?.start || '09:00'}
                          onChange={(e) => handleTimingChange(day, 'start', e.target.value)}
                          disabled={!editMode || !formData.timings[day]?.available}
                        />
                      </Col>
                      <Col md={1} className="text-center">to</Col>
                      <Col md={3}>
                        <Form.Control
                          type="time"
                          value={formData.timings[day]?.end || '17:00'}
                          onChange={(e) => handleTimingChange(day, 'end', e.target.value)}
                          disabled={!editMode || !formData.timings[day]?.available}
                        />
                      </Col>
                    </Row>
                  ))}

                  {/* Submit Button */}
                  {editMode && (
                    <div className="text-end mt-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg"
                        disabled={saving}
                      >
                        {saving ? (
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
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorProfile;