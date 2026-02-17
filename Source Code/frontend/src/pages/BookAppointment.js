import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doctorService, appointmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './BookAppointment.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [documents, setDocuments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctor) {
      generateTimeSlots();
    }
  }, [selectedDate, doctor]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await doctorService.getDoctorById(doctorId);
      setDoctor(response.data.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    // This is a simplified version - in production, you'd check against booked appointments
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    setAvailableSlots(slots);
  };

  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedDate || !selectedTime) {
    toast.error('Please select date and time');
    return;
  }

  setSubmitting(true);

  try {
    // Format the date properly
    const formattedDate = selectedDate.toISOString();
    
    // Create timeSlot object
    const timeSlotObj = {
      start: selectedTime,
      end: calculateEndTime(selectedTime)
    };

    // Create appointment data object
    const appointmentData = {
      doctorId: doctorId,
      date: formattedDate,
      timeSlot: JSON.stringify(timeSlotObj), // Stringify the timeSlot object
      reason: reason || ''
    };

    console.log('Sending appointment data:', appointmentData);
    console.log('Files:', documents);

    // Call the API
    const response = await appointmentService.bookAppointment(appointmentData, documents);
    
    console.log('Response:', response);
    
    toast.success('Appointment booked successfully!');
    navigate('/my-appointments');
  } catch (error) {
    console.error('Error booking appointment:', error);
    console.error('Error response:', error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to book appointment');
  } finally {
    setSubmitting(false);
  }
};

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Doctor not found</Alert>
      </Container>
    );
  }

  return (
    <div className="book-appointment-page">
      <Container className="py-4">
        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Book Appointment with {doctor.fullName}</h4>
              </Card.Header>
              <Card.Body>
                {/* Doctor Info Summary */}
                <Row className="mb-4 pb-3 border-bottom">
                  <Col xs={3}>
                    <img 
                      src={doctor.profileImage || 'https://via.placeholder.com/100'}
                      alt={doctor.fullName}
                      className="img-fluid rounded-circle"
                    />
                  </Col>
                  <Col xs={9}>
                    <h5>{doctor.fullName}</h5>
                    <p className="text-primary mb-1">{doctor.specialization}</p>
                    <p className="mb-1"><strong>Experience:</strong> {doctor.experience} years</p>
                    <p className="mb-0"><strong>Consultation Fee:</strong> ${doctor.fees}</p>
                  </Col>
                </Row>

                <Form onSubmit={handleSubmit}>
                  {/* Date Selection */}
                  <Form.Group className="mb-3">
                    <Form.Label>Select Date</Form.Label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => setSelectedDate(date)}
                      minDate={new Date()}
                      maxDate={new Date().setMonth(new Date().getMonth() + 1)}
                      className="form-control"
                      placeholderText="Choose appointment date"
                      required
                    />
                  </Form.Group>

                  {/* Time Selection */}
                  {selectedDate && (
                    <Form.Group className="mb-3">
                      <Form.Label>Select Time</Form.Label>
                      <Row>
                        {availableSlots.map(slot => (
                          <Col xs={4} md={3} className="mb-2" key={slot}>
                            <Button
                              type="button"
                              variant={selectedTime === slot ? 'primary' : 'outline-primary'}
                              className="w-100"
                              onClick={() => setSelectedTime(slot)}
                            >
                              {slot}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Form.Group>
                  )}

                  {/* Reason */}
                  <Form.Group className="mb-3">
                    <Form.Label>Reason for Visit</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Briefly describe your symptoms or reason for appointment"
                    />
                  </Form.Group>

                  {/* Documents */}
                  <Form.Group className="mb-4">
                    <Form.Label>Upload Documents (Optional)</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Form.Text className="text-muted">
                      You can upload medical records, prescriptions, or insurance documents (Max 5 files)
                    </Form.Text>
                  </Form.Group>

                  {/* Price Summary */}
                  <div className="price-summary bg-light p-3 rounded mb-4">
                    <div className="d-flex justify-content-between">
                      <span>Consultation Fee:</span>
                      <strong>${doctor.fees}</strong>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between">
                      <span className="h5">Total:</span>
                      <span className="h5 text-primary">${doctor.fees}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={submitting || !selectedDate || !selectedTime}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BookAppointment;