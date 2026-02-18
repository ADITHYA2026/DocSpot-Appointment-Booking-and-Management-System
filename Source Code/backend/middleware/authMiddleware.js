const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Always fetch fresh user from DB — never rely on token payload for roles
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.type === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as admin'
        });
    }
};

// BUG FIX: The original doctor middleware only checked user.isDoctor flag.
// After admin approves a doctor, we update user.type = 'doctor' in the DB.
// But the doctor middleware was: req.user.isDoctor || req.user.type === 'admin'
// This was CORRECT — but the real issue is the token in localStorage is STALE.
// When a doctor logs in for the first time (before approval), their token has
// type: 'user', isDoctor: true. After admin approves and sets type: 'doctor',
// the STORED token is still old. The protect middleware now fetches fresh from DB
// so req.user always has the latest type. This middleware is now consistent.
const doctor = (req, res, next) => {
    if (req.user && (req.user.type === 'doctor' || req.user.type === 'admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as doctor. Your application may still be pending approval.'
        });
    }
};

module.exports = { protect, admin, doctor };