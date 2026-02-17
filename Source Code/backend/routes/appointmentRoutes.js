const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
    rescheduleAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('documents', 5), bookAppointment);
router.get('/my-appointments', protect, getUserAppointments);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/reschedule', protect, rescheduleAppointment);

module.exports = router;