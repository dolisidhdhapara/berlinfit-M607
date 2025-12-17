const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const Booking = require('../models/Booking');
const { requireLogin } = require('../middleware/auth');

// check if admin
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

// get all users
router.get('/users', requireLogin, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        const memberships = await Membership.find({ status: 'active', endDate: { $gt: new Date() } });

        const usersWithStatus = users.map(user => {
            const activeMembership = memberships.find(m => m.user.toString() === user._id.toString());
            return {
                ...user.toObject(),
                membershipStatus: activeMembership ? 'Active' : 'Inactive',
                membershipExpires: activeMembership ? activeMembership.endDate : null
            };
        });

        res.json(usersWithStatus);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// activate user manual
router.post('/users/activate', requireLogin, requireAdmin, async (req, res) => {
    try {
        const { userId, planId } = req.body;

        const plan = await MembershipPlan.findById(planId);

        if (!plan) {
            return res.status(404).json({ message: 'Selected plan not found.' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);


        await Membership.updateMany(
            { user: userId, status: 'active' },
            { status: 'expired' }
        );

        const membership = await Membership.create({
            user: userId,
            plan: plan._id,
            startDate,
            endDate,
            status: 'active',
            paymentStatus: 'manual_override' // Custom field or just valid
        });

        res.json({ message: 'Membership activated successfully', membership });
    } catch (error) {
        console.error('Error activating membership:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/users/:id/bookings
router.get('/users/:id/bookings', requireLogin, requireAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.id })
            .populate({
                path: 'classSession',
                populate: { path: 'classType', select: 'name' }
            })
            .sort({ bookedAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
