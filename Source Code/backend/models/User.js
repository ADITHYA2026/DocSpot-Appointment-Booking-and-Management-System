const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    isDoctor: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['user', 'doctor', 'admin'],
        default: 'user'
    },
    notification: [{
        type: {
            type: String,
            enum: ['appointment', 'approval', 'reminder', 'cancellation'],
            required: true
        },
        message: String,
        read: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);