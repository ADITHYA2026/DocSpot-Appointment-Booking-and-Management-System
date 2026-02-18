const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    try {
        const { specialization, city, minExperience, maxFees } = req.query;

        // Only show approved doctors who have completed their profile
        // (specialization exists = profile is filled in)
        let query = { status: 'approved' };

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
        res.status(500).json({
            success: false,
            message: 'Server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
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
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Apply to become a doctor
// @route   POST /api/doctors/apply
// @access  Private
const applyAsDoctor = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const existingApplication = await Doctor.findOne({ userId: user._id });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied'
            });
        }

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

        user.isDoctor = true;
        await user.save();

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
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
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

        const updatableFields = [
            'fullName', 'phone', 'address', 'specialization',
            'experience', 'fees', 'timings', 'qualifications', 'bio'
        ];

        const oldSpecialization = doctor.specialization;

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                doctor[field] = req.body[field];
            }
        });

        // If specialization changed → set status back to pending
        if (
            req.body.specialization &&
            req.body.specialization !== oldSpecialization
        ) {
            doctor.status = 'pending';
        }


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
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Get doctor appointments
// @route   GET /api/doctors/appointments/list
// @access  Private (Doctor only)
const getDoctorAppointments = async (req, res) => {
    try {
        // BUG FIX: Was Doctor.findOne({ userId: req.user._id })
        // After admin approves doctor, user.type = 'doctor' in DB.
        // But the doctor middleware now checks type === 'doctor', so req.user is correct.
        // The issue was: if the doctor had JUST registered and logged in with old token
        // they wouldn't pass the middleware. Now that middleware checks DB fresh, this works.
        let doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            doctor = await Doctor.create({
                userId: req.user._id,
                status: 'approved'
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
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Update appointment status (approve/reject by doctor)
// @route   PUT /api/doctors/appointments/:id
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res) => {
    try {
        console.log("=== UPDATE APPOINTMENT STATUS ===");
        console.log("Params:", req.params);
        console.log("Body:", req.body);

        // BUG FIX: DoctorDashboard.js calls:
        //   doctorService.updateAppointmentStatus(appointmentId, 'approved')
        // which maps to: api.put(`/doctors/appointments/${id}`, { status })
        // But DoctorDashboard passes the STATUS STRING directly as second arg,
        // while DoctorAppointments.js passes it correctly.
        // The API service is: updateAppointmentStatus: (id, status) => api.put(..., { status })
        // So { status } = { status: 'approved' } — that IS correct on the service side.
        //
        // The actual server error was: doctor middleware blocked because user.type
        // was still 'user' in localStorage token. Now that we fetch from DB fresh,
        // the middleware uses the real updated type. This should now work.

        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }

        const { status } = body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['approved', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Verify this appointment belongs to this doctor
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found'
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Security check: make sure this doctor owns this appointment
        if (appointment.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }

        const oldStatus = appointment.status;
        appointment.status = status;
        await appointment.save();

        console.log(`Appointment ${appointment._id} updated: ${oldStatus} → ${status}`);

        // Notify patient
        try {
            const patientUser = await User.findById(appointment.userId);
            if (patientUser) {
                if (!patientUser.notification) patientUser.notification = [];
                patientUser.notification.push({
                    type: 'appointment',
                    message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} has been ${status} by the doctor`,
                    appointmentId: appointment._id,
                    date: new Date()
                });
                await patientUser.save();
            }
        } catch (notifyError) {
            console.error('Error notifying patient:', notifyError);
            // Don't fail the whole request just because notification failed
        }

        res.json({
            success: true,
            data: appointment,
            message: `Appointment ${status} successfully`
        });
    } catch (error) {
        console.error("ERROR in updateAppointmentStatus:", error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
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