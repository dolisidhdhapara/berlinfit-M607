const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        required: true,
    },
    amountEuro: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'EUR',
    },
    paypalOrderId: {
        type: String,
        required: true,
    },
    paypalCaptureId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['created', 'completed', 'failed'],
        default: 'created',
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

module.exports = mongoose.model('Payment', paymentSchema);
