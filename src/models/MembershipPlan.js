const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    durationDays: {
        type: Number,
    },
    priceEuro: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
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

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
