const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema({
    classType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassType',
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['scheduled', 'cancelled'],
        default: 'scheduled',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ClassSession', classSessionSchema);
