const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        fullAddress: String
    },

    // FIX: These three fields were marked required: true but are NOT collected
    // during registration — only during profile completion (DoctorProfile page).
    // Making them optional here so registration succeeds, then the doctor fills
    // them in via their profile. The admin approval flow handles ensuring they
    // are complete before approving.
    specialization: {
        type: String,
        required: false,
        trim: true
    },
    experience: {
        type: Number,
        required: false,
        min: 0
    },
    fees: {
        type: Number,
        required: false,
        min: 0
    },

    timings: {
        monday:    { start: String, end: String, available: Boolean },
        tuesday:   { start: String, end: String, available: Boolean },
        wednesday: { start: String, end: String, available: Boolean },
        thursday:  { start: String, end: String, available: Boolean },
        friday:    { start: String, end: String, available: Boolean },
        saturday:  { start: String, end: String, available: Boolean },
        sunday:    { start: String, end: String, available: Boolean }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number
    }],
    profileImage: {
        type: String,
        default: 'default-doctor.png'
    },
    bio: {
        type: String,
        maxlength: 500
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Doctor', doctorSchema);