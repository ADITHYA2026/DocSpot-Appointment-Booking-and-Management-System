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
  const [dayUnavailable, setDayUnavailable] = useState(false);

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

  // FIX 5: Generate time slots based on the doctor's actual schedule for the
  // selected day of week. Previously this was hardcoded 9 AM–5 PM for every
  // doctor and every day regardless of their actual availability.
  const generateTimeSlots = () => {
    setSelectedTime('');
    setDayUnavailable(false);

    if (!doctor?.timings || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[selectedDate.getDay()];
    const timing = doctor.timings[dayName];

    // If doctor is not available on this day
    if (!timing || !timing.available || !timing.start || !timing.end) {
      setAvailableSlots([]);
      setDayUnavailable(true);
      return;
    }

    const [startH, startM] = timing.start.split(':').map(Number);
    const [endH, endM] = timing.end.split(':').map(Number);

    const startTotalMins = startH * 60 + startM;
    const endTotalMins = endH * 60 + endM;

    const slots = [];
    for (let mins = startTotalMins; mins < endTotalMins; mins += 30) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
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
      const formattedDate = selectedDate.toISOString();

      const timeSlotObj = {
        start: selectedTime,
        end: calculateEndTime(selectedTime)
      };

      const appointmentData = {
        doctorId: doctorId,
        date: formattedDate,
        timeSlot: JSON.stringify(timeSlotObj),
        reason: reason || ''
      };

      const response = await appointmentService.bookAppointment(appointmentData, documents);

      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
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

  // FIX 7: maxDate was new Date().setMonth(...) which returns a number (timestamp),
  // not a Date object — causing DatePicker to silently ignore the constraint.
  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

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
                      maxDate={maxDate}
                      className="form-control"
                      placeholderText="Choose appointment date"
                      required
                    />
                  </Form.Group>

                  {/* Time Selection */}
                  {selectedDate && (
                    <Form.Group className="mb-3">
                      <Form.Label>Select Time</Form.Label>
                      {dayUnavailable ? (
                        <Alert variant="warning" className="py-2">
                          Dr. {doctor.fullName} is not available on{' '}
                          {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}s.
                          Please select a different date.
                        </Alert>
                      ) : availableSlots.length === 0 ? (
                        <Alert variant="info" className="py-2">
                          No time slots available for this date.
                        </Alert>
                      ) : (
                        <Row>
                          {availableSlots.map(slot => (
                            <Col xs={4} md={3} className="mb-2" key={slot}>
                              <Button
                                type="button"
                                variant={selectedTime === slot ? 'primary' : 'outline-primary'}
                                className="w-100 time-slot-btn"
                                onClick={() => setSelectedTime(slot)}
                              >
                                {slot}
                              </Button>
                            </Col>
                          ))}
                        </Row>
                      )}
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
                    disabled={submitting || !selectedDate || !selectedTime || dayUnavailable}
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