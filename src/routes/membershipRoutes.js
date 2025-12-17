const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const { requireLogin } = require('../middleware/auth');

// POST /api/memberships
router.post('/', requireLogin, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await MembershipPlan.findById(planId);

        if (!plan || !plan.isActive) {
            return res.status(404).json({ message: 'Plan not found or inactive' });
        }


        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);



        const membership = await Membership.create({
            user: req.session.user._id,
            plan: planId,
            startDate,
            endDate,
            status: 'active',
        });

        res.status(201).json({
            message: 'Membership purchased successfully',
            membership,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/memberships/my
router.get('/my', requireLogin, async (req, res) => {
    try {
        const membership = await Membership.findOne({
            user: req.session.user._id,
            status: 'active',
            endDate: { $gte: new Date() },
        })
            .populate('plan')
            .sort({ endDate: -1 });

        if (!membership) {
            return res.json({ message: 'No active membership' });
        }

        res.json(membership);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/memberships/my/status
router.get('/my/status', requireLogin, async (req, res) => {
    try {
        const membership = await Membership.findOne({
            user: req.session.user._id,
        })
            .populate('plan', 'name')
            .sort({ endDate: -1 });

        if (!membership) {
            return res.json({ status: 'none' });
        }

        const now = new Date();
        const status = membership.endDate >= now ? 'active' : 'expired';

        res.json({
            status,
            planName: membership.plan ? membership.plan.name : 'Unknown',
            startDate: membership.startDate,
            endDate: membership.endDate,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
