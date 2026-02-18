const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, isDoctor } = req.body;

        // Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Email validation
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit phone number'
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            isDoctor: isDoctor || false,
            type: 'user', // All users start as 'user' regardless of doctor flag
            notification: []
        });

        if (user) {
            // If registering as doctor, create a MINIMAL doctor application.
            // FIX: Only provide the fields we have at registration time.
            // specialization / experience / fees are NOT required at this stage —
            // the doctor completes those in their profile after logging in.
            // The Doctor model's required: false change makes this work correctly.
            if (isDoctor) {
                try {
                    await Doctor.create({
                        userId: user._id,
                        fullName: name,
                        email: email,
                        phone: phone,
                        status: 'pending'
                        // specialization, experience, fees left empty intentionally —
                        // doctor fills these in via DoctorProfile page
                    });
                } catch (doctorCreateError) {
                    // If doctor record creation fails, roll back the user to avoid orphan records
                    console.error('Error creating doctor application:', doctorCreateError);
                    await User.findByIdAndDelete(user._id);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create doctor application. Please try again.',
                        ...(process.env.NODE_ENV === 'development' && { error: doctorCreateError.message })
                    });
                }

                // Notify admin about new doctor application
                try {
                    const admin = await User.findOne({ type: 'admin' });
                    if (admin) {
                        if (!admin.notification) admin.notification = [];
                        admin.notification.push({
                            type: 'approval',
                            message: `New doctor application from ${name}`,
                            date: new Date()
                        });
                        await admin.save();
                    }
                } catch (notifyError) {
                    console.error('Error notifying admin:', notifyError);
                    // Continue — don't fail registration if only notification fails
                }
            }

            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isDoctor: user.isDoctor,
                    type: user.type,
                    token: generateToken(user._id)
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Get doctor status if applicable
        let doctorStatus = null;
        if (user.isDoctor) {
            const doctor = await Doctor.findOne({ userId: user._id });
            doctorStatus = doctor ? doctor.status : null;
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isDoctor: user.isDoctor,
                type: user.type,
                doctorStatus,
                token: generateToken(user._id)
            }
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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let doctorData = null;
        if (user.isDoctor) {
            doctorData = await Doctor.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            data: {
                user,
                doctor: doctorData
            }
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                isDoctor: updatedUser.isDoctor,
                type: updatedUser.type,
                token: generateToken(updatedUser._id)
            }
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

// @desc    Get user notifications
// @route   GET /api/auth/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('notification')
            .populate('notification.appointmentId');

        res.json({
            success: true,
            data: user.notification.sort((a, b) => b.date - a.date)
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

// @desc    Mark notification as read
// @route   PUT /api/auth/notifications/:id
// @access  Private
const markNotificationRead = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const notification = user.notification.id(req.params.id);
        if (notification) {
            notification.read = true;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
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
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getNotifications,
    markNotificationRead
};