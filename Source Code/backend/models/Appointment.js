const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorInfo: {
        name: String,
        specialization: String,
        fees: Number
    },
    userInfo: {
        name: String,
        email: String,
        phone: String
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        start: String,
        end: String
    },
    documents: [{
        filename: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    reason: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    cancellationReason: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save - FIXED: removed 'next' parameter
appointmentSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Appointment', appointmentSchema);