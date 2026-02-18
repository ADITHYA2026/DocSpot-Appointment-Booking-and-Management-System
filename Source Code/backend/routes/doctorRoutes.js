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

// FIX 2: Specific routes MUST come before the wildcard /:id route.
// Previously /:id was registered second (line 2), which caused Express to
// match '/apply', '/profile', and '/appointments/list' as :id values,
// silently breaking those endpoints with wrong handler or 404.

router.get('/', getDoctors);
router.post('/apply', protect, applyAsDoctor);
router.put('/profile', protect, doctor, updateDoctorProfile);
router.get('/appointments/list', protect, doctor, getDoctorAppointments);
router.put('/appointments/:id', protect, doctor, updateAppointmentStatus);

// Wildcard route — MUST be last
router.get('/:id', getDoctorById);

module.exports = router;