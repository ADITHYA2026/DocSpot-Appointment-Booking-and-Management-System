const express = require('express');
const router = express.Router();
const {
    getDoctors,
    getDoctorById,
    applyAsDoctor,
    updateDoctorProfile,
    getDoctorAppointments,
    updateAppointmentStatus
} = require('../controllers/doctorController');
const { protect, doctor } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/apply', protect, applyAsDoctor);
router.put('/profile', protect, doctor, updateDoctorProfile);
router.get('/appointments/list', protect, doctor, getDoctorAppointments);
router.put('/appointments/:id', protect, doctor, updateAppointmentStatus);

module.exports = router;