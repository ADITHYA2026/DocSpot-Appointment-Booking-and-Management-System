const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    try {
        const { specialization, city, minExperience, maxFees } = req.query;
        let query = { status: 'approved' };

        // Apply filters
        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }
        if (city) {
            query['address.city'] = { $regex: city, $options: 'i' };
        }
        if (minExperience) {
            query.experience = { $gte: parseInt(minExperience) };
        }
        if (maxFees) {
            query.fees = { $lte: parseInt(maxFees) };
        }

        const doctors = await Doctor.find(query)
            .populate('userId', 'name email')
            .sort({ rating: -1 });

        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error(error);
        res.status500.json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('userId', 'name email');

        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor not found' 
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Apply to become a doctor
// @route   POST /api/doctors/apply
// @access  Private
const applyAsDoctor = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Check if already applied
        const existingApplication = await Doctor.findOne({ userId: user._id });
        if (existingApplication) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already applied' 
            });
        }

        // Create doctor application
        const doctor = await Doctor.create({
            userId: user._id,
            fullName: req.body.fullName,
            email: user.email,
            phone: req.body.phone,
            address: req.body.address,
            specialization: req.body.specialization,
            experience: req.body.experience,
            fees: req.body.fees,
            timings: req.body.timings,
            qualifications: req.body.qualifications,
            bio: req.body.bio,
            status: 'pending'
        });

        // Update user
        user.isDoctor = true;
        await user.save();

        // Notify admin
        const admin = await User.findOne({ type: 'admin' });
        if (admin) {
            admin.notification.push({
                type: 'approval',
                message: `New doctor application from ${user.name}`,
                date: new Date()
            });
            await admin.save();
        }

        res.status(201).json({
            success: true,
            data: doctor,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor profile not found' 
            });
        }

        // Update fields
        const updatableFields = [
            'fullName', 'phone', 'address', 'specialization', 
            'experience', 'fees', 'timings', 'qualifications', 'bio'
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                doctor[field] = req.body[field];
            }
        });

        const updatedDoctor = await doctor.save();

        res.json({
            success: true,
            data: updatedDoctor,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Get doctor appointments
// @route   GET /api/doctors/appointments
// @access  Private (Doctor only)
const getDoctorAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor not found' 
            });
        }

        const appointments = await Appointment.find({ doctorId: doctor._id })
            .populate('userId', 'name email phone')
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
            error: error.message 
        });
    }
};

// @desc    Update appointment status
// @route   PUT /api/doctors/appointments/:id
// @access  Private (Doctor only)
// @desc    Update appointment status
// @route   PUT /api/doctors/appointments/:id
// @access  Private (Doctor only)
// Parse the body if it's a string

const updateAppointmentStatus = async (req, res) => {
    try {
        console.log("=== UPDATE APPOINTMENT STATUS ===");
        console.log("Request params:", req.params);
        console.log("Request body RAW:", req.body);
        
        // Handle if body is a string
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error('Failed to parse body:', e);
            }
        }
        
        const { status } = body;
        console.log("Extracted status:", status);
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Appointment not found' 
            });
        }

        console.log("Found appointment:", appointment._id);
        console.log("Current status:", appointment.status);
        console.log("New status:", status);

        appointment.status = status;
        await appointment.save();

        console.log("Status updated successfully");

        // Notify user
        const user = await User.findById(appointment.userId);
        if (user) {
            if (!user.notification) user.notification = [];
            user.notification.push({
                type: 'appointment',
                message: `Your appointment has been ${status}`,
                appointmentId: appointment._id,
                date: new Date()
            });
            await user.save();
            console.log("User notified");
        }

        res.json({
            success: true,
            data: appointment,
            message: `Appointment ${status} successfully`
        });
    } catch (error) {
        console.error("ERROR in updateAppointmentStatus:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message,
            error: error.message 
        });
    }
};

module.exports = {
    getDoctors,
    getDoctorById,
    applyAsDoctor,
    updateDoctorProfile,
    getDoctorAppointments,
    updateAppointmentStatus
};