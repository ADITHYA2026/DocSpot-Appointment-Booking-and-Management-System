const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = async (req, res) => {
    try {
        console.log('=== BOOK APPOINTMENT REQUEST ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('User:', req.user?._id);

        let { doctorId, date, timeSlot, reason } = req.body;

        // Validate required fields
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID is required'
            });
        }

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid doctor ID format'
            });
        }

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        if (!timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Time slot is required'
            });
        }

        // Parse timeSlot if it's a string
        if (typeof timeSlot === 'string') {
            try {
                timeSlot = JSON.parse(timeSlot);
            } catch (e) {
                console.error('Error parsing timeSlot:', e);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid time slot format'
                });
            }
        }

        // Validate timeSlot has start property
        if (!timeSlot.start) {
            return res.status(400).json({
                success: false,
                message: 'Time slot start time is required'
            });
        }

        // Ensure timeSlot has end property
        if (!timeSlot.end) {
            const [hours, minutes] = timeSlot.start.split(':').map(Number);
            const endMinutes = minutes + 30;
            const endHours = hours + Math.floor(endMinutes / 60);
            const endMins = endMinutes % 60;
            timeSlot.end = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        }

        console.log('Parsed doctorId:', doctorId);
        console.log('Parsed date:', date);
        console.log('Parsed timeSlot:', timeSlot);

        // Check if doctor exists and is approved
        let doctor;
        try {
            doctor = await Doctor.findOne({
                _id: doctorId,
                status: 'approved'
            });
        } catch (dbError) {
            console.error('Database error finding doctor:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error finding doctor'
            });
        }

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found or not approved'
            });
        }

        console.log('Found doctor:', doctor.fullName);

        // Parse date
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // Set to start of day for comparison
        appointmentDate.setHours(0, 0, 0, 0);

        // Check if slot is available
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: {
                $gte: appointmentDate,
                $lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)
            },
            'timeSlot.start': timeSlot.start,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        // Handle file uploads
        let documents = [];
        if (req.files && req.files.length > 0) {
            documents = req.files.map(file => ({
                filename: file.originalname,
                path: file.path.replace(/\\/g, '/')
            }));
        }

        // Create appointment
        const appointmentDateTime = new Date(date);

        const appointment = await Appointment.create({
            doctorId,
            userId: req.user._id,
            doctorInfo: {
                name: doctor.fullName,
                specialization: doctor.specialization,
                fees: doctor.fees
            },
            userInfo: {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone
            },
            date: appointmentDateTime,
            timeSlot: {
                start: timeSlot.start,
                end: timeSlot.end
            },
            documents,
            reason: reason || '',
            status: 'pending'
        });

        console.log('Appointment created:', appointment._id);

        // Notify doctor (don't fail if notification fails)
        if (doctor.userId) {
            try {
                const doctorUser = await User.findById(doctor.userId);
                if (doctorUser) {
                    if (!doctorUser.notification) doctorUser.notification = [];
                    doctorUser.notification.push({
                        type: 'appointment',
                        message: `New appointment request from ${req.user.name}`,
                        appointmentId: appointment._id,
                        date: new Date()
                    });
                    await doctorUser.save();
                    console.log('Doctor notified');
                }
            } catch (notifyError) {
                console.error('Error notifying doctor:', notifyError);
            }
        }

        res.status(201).json({
            success: true,
            data: appointment,
            message: 'Appointment booked successfully'
        });
    } catch (error) {
        console.error('=== BOOKING ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format',
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// Helper function to calculate end time
const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
};

// @desc    Get user appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
const getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user._id })
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .sort({ date: -1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if user owns this appointment
        if (appointment.userId.toString() !== req.user._id.toString() &&
            req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if appointment can be cancelled
        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed appointment'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancellationReason = req.body.reason || 'Cancelled by user';
        await appointment.save();

        // FIX 4: appointment.doctorId is a raw ObjectId (not populated).
        // Previously code did appointment.doctorId.userId which is always undefined.
        // Correct approach: fetch the Doctor document first, then get its userId.
        if (appointment.doctorId) {
            try {
                const doctor = await Doctor.findById(appointment.doctorId);
                if (doctor) {
                    const doctorUser = await User.findById(doctor.userId);
                    if (doctorUser) {
                        if (!doctorUser.notification) doctorUser.notification = [];
                        doctorUser.notification.push({
                            type: 'cancellation',
                            message: `Appointment cancelled by ${req.user.name}`,
                            appointmentId: appointment._id,
                            date: new Date()
                        });
                        await doctorUser.save();
                    }
                }
            } catch (notifyError) {
                console.error('Error notifying doctor:', notifyError);
            }
        }

        res.json({
            success: true,
            data: appointment,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
const rescheduleAppointment = async (req, res) => {
    try {
        const { date, timeSlot } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if user owns this appointment
        if (appointment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if new slot is available
        const existingAppointment = await Appointment.findOne({
            doctorId: appointment.doctorId,
            date: new Date(date),
            'timeSlot.start': timeSlot.start,
            status: { $in: ['pending', 'approved'] },
            _id: { $ne: appointment._id }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        appointment.date = new Date(date);
        appointment.timeSlot = timeSlot;
        appointment.status = 'pending'; // Reset to pending for doctor approval
        await appointment.save();

        // FIX 4 (same fix for reschedule): Look up Doctor first, then User
        if (appointment.doctorId) {
            try {
                const doctor = await Doctor.findById(appointment.doctorId);
                if (doctor) {
                    const doctorUser = await User.findById(doctor.userId);
                    if (doctorUser) {
                        if (!doctorUser.notification) doctorUser.notification = [];
                        doctorUser.notification.push({
                            type: 'appointment',
                            message: `Appointment rescheduled by ${req.user.name}`,
                            appointmentId: appointment._id,
                            date: new Date()
                        });
                        await doctorUser.save();
                    }
                }
            } catch (notifyError) {
                console.error('Error notifying doctor:', notifyError);
            }
        }

        res.json({
            success: true,
            data: appointment,
            message: 'Appointment rescheduled successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

module.exports = {
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
    rescheduleAppointment
};