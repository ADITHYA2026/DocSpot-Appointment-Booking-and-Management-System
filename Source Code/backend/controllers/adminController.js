const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({
            success: true,
            count: users.length,
            data: users
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

// @desc    Get all doctors (including pending)
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
const getAllDoctors = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        if (status) {
            query.status = status;
        }

        const doctors = await Doctor.find(query)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

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
            error: error.message 
        });
    }
};

// @desc    Approve or reject doctor
// @route   PUT /api/admin/doctors/:id/status
// @access  Private (Admin only)
const updateDoctorStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        
        // Validate status
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either "approved" or "rejected"'
            });
        }

        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor not found' 
            });
        }

        doctor.status = status;
        await doctor.save();

        // Update user's isDoctor status based on approval/rejection
        if (status === 'approved') {
            await User.findByIdAndUpdate(doctor.userId, { 
                isDoctor: true,
                type: 'doctor'
            });

            // Notify doctor (with error handling)
            try {
                const doctorUser = await User.findById(doctor.userId);
                if (doctorUser) {
                    if (!doctorUser.notification) doctorUser.notification = [];
                    doctorUser.notification.push({
                        type: 'approval',
                        message: 'Your doctor application has been approved!',
                        date: new Date()
                    });
                    await doctorUser.save();
                }
            } catch (notifyError) {
                console.error('Error sending approval notification:', notifyError);
                // Continue - don't fail the whole request
            }
        } else if (status === 'rejected') {
            await User.findByIdAndUpdate(doctor.userId, { 
                isDoctor: false,
                type: 'user'
            });

            // Notify doctor (with error handling)
            try {
                const doctorUser = await User.findById(doctor.userId);
                if (doctorUser) {
                    if (!doctorUser.notification) doctorUser.notification = [];
                    doctorUser.notification.push({
                        type: 'approval',
                        message: `Your doctor application has been rejected. Reason: ${rejectionReason || 'Not specified by admin'}`,
                        date: new Date()
                    });
                    await doctorUser.save();
                }
            } catch (notifyError) {
                console.error('Error sending rejection notification:', notifyError);
                // Continue - don't fail the whole request
            }
        }

        res.json({
            success: true,
            data: doctor,
            message: `Doctor ${status} successfully`
        });
    } catch (error) {
        console.error("ERROR in updateDoctorStatus:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('userId', 'name email phone')
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

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

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ type: 'user' });
        const totalDoctors = await Doctor.countDocuments({ status: 'approved' });
        const pendingDoctors = await Doctor.countDocuments({ status: 'pending' });
        const totalAppointments = await Appointment.countDocuments();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAppointments = await Appointment.countDocuments({
            date: { $gte: today }
        });

        // Handle revenue aggregation safely
        let totalRevenue = 0;
        try {
            const revenue = await Appointment.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$doctorInfo.fees' } } }
            ]);
            totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
        } catch (revenueError) {
            console.error('Error calculating revenue:', revenueError);
            // Default to 0 if error
        }

        res.json({
            success: true,
            data: {
                totalUsers,
                totalDoctors,
                pendingDoctors,
                totalAppointments,
                todayAppointments,
                totalRevenue
            }
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

module.exports = {
    getAllUsers,
    getAllDoctors,
    updateDoctorStatus,
    getAllAppointments,
    getDashboardStats
};