const express = require('express');
const router = express.Router();
const ClassSession = require('../models/ClassSession');
const Booking = require('../models/Booking');

// GET /api/schedule/upcoming
router.get('/upcoming', async (req, res) => {
    try {
        const now = new Date();
        const sessions = await ClassSession.find({
            startTime: { $gte: now },
            status: 'scheduled',
        })
            .populate('classType', 'name difficulty')
            .populate('trainer', 'fullName')
            .sort({ startTime: 1 });


        const sessionsWithCount = await Promise.all(
            sessions.map(async (session) => {
                const bookedCount = await Booking.countDocuments({
                    classSession: session._id,
                    status: { $in: ['booked', 'attended', 'no_show'] },
                });

                return {
                    _id: session._id,
                    classType: session.classType,
                    trainer: session.trainer,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    location: session.location,
                    capacity: session.capacity,
                    bookedCount,
                    availableSpots: session.capacity - bookedCount,
                };
            })
        );

        res.json(sessionsWithCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
