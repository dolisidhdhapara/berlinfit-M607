const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ClassSession = require('../models/ClassSession');
const Membership = require('../models/Membership');
const { requireLogin, requireAdmin } = require('../middleware/auth');

// POST /api/bookings
router.post('/', requireLogin, async (req, res) => {
    try {
        const activeMembership = await Membership.findOne({
            user: req.session.user._id,
            status: 'active',
            endDate: { $gte: new Date() },
        });

        if (!activeMembership) {
            return res.status(403).json({ message: 'You need an active membership to book a class.' });
        }

        const { classSessionId } = req.body;
        const session = await ClassSession.findById(classSessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }


        if (session.status !== 'scheduled') {
            return res.status(400).json({ message: 'Session is cancelled' });
        }
        if (new Date(session.startTime) <= new Date()) {
            return res.status(400).json({ message: 'Session has already started' });
        }


        const bookedCount = await Booking.countDocuments({
            classSession: classSessionId,
            status: { $in: ['booked', 'attended', 'no_show'] },
        });

        if (bookedCount >= session.capacity) {
            return res.status(400).json({ message: 'Session is full' });
        }


        const existingBooking = await Booking.findOne({
            user: req.session.user._id,
            classSession: classSessionId,
            status: { $in: ['booked', 'attended', 'no_show'] },
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked this session' });
        }



        const booking = await Booking.create({
            user: req.session.user._id,
            classSession: classSessionId,
            status: 'booked',
        });

        res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/bookings/my/upcoming
router.get('/my/upcoming', requireLogin, async (req, res) => {
    try {

        const bookings = await Booking.find({
            user: req.session.user._id,
            status: 'booked',
        })
            .populate({
                path: 'classSession',
                populate: [
                    { path: 'classType', select: 'name difficulty' },
                    { path: 'trainer', select: 'fullName' }
                ]
            })
            .sort({ bookedAt: -1 });

        const now = new Date();
        const upcomingBookings = bookings.filter(
            (b) => b.classSession && new Date(b.classSession.startTime) >= now
        );

        res.json(upcomingBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', requireLogin, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('classSession');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const isOwner = booking.user.toString() === req.session.user._id;
        const isAdmin = req.session.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }


        if (new Date(booking.classSession.startTime) <= new Date()) {
            return res.status(400).json({ message: 'Cannot cancel past session' });
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        await booking.save();

        res.json({ message: 'Booking cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/bookings/admin/:id/attendance
router.patch('/admin/:id/attendance', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
