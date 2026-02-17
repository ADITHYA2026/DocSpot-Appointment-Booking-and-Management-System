const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getAllDoctors,
    updateDoctorStatus,
    getAllAppointments,
    getDashboardStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getAllUsers);
router.get('/doctors', protect, admin, getAllDoctors);
router.put('/doctors/:id/status', protect, admin, updateDoctorStatus);
router.get('/appointments', protect, admin, getAllAppointments);
router.get('/stats', protect, admin, getDashboardStats);

module.exports = router;