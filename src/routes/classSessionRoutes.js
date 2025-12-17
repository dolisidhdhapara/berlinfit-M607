const express = require('express');
const router = express.Router();
const ClassSession = require('../models/ClassSession');
const Booking = require('../models/Booking');
const { requireAdmin } = require('../middleware/auth');

// GET /api/admin/class-sessions
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};
        if (from || to) {
            query.startTime = {};
            if (from) query.startTime.$gte = new Date(from);
            if (to) query.startTime.$lte = new Date(to);
        }

        const sessions = await ClassSession.find(query)
            .populate('classType')
            .sort({ startTime: 1 });

        const sessionsWithCount = await Promise.all(
            sessions.map(async (session) => {
                const bookedCount = await Booking.countDocuments({
                    classSession: session._id,
                    status: { $in: ['booked', 'attended', 'no_show'] },
                });

                return {
                    ...session.toObject(),
                    bookedCount,
                    availableSpots: session.capacity - bookedCount
                };
            })
        );

        res.json(sessionsWithCount);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/class-sessions
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { classType, startTime, endTime, capacity, location, trainer } = req.body;
        const session = await ClassSession.create({
            classType,
            startTime,
            endTime,
            capacity,
            location,
            trainer,
        });
        res.status(201).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/class-sessions/:id
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const session = await ClassSession.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/class-sessions/:id/status
router.patch('/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const session = await ClassSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        session.status = status;
        await session.save();
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// list bookings
router.get('/:id/bookings', requireAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({ classSession: req.params.id })
            .populate('user', 'fullName email')
            .sort({ bookedAt: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/class-sessions/:id
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const session = await ClassSession.findByIdAndDelete(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
