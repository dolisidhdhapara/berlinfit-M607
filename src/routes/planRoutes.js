const express = require('express');
const router = express.Router();
const MembershipPlan = require('../models/MembershipPlan');
const { requireAdmin } = require('../middleware/auth');

// get plans
router.get('/', async (req, res) => {
    try {
        const plans = await MembershipPlan.find({ isActive: true });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// get plan details
router.get('/:id', async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/plans
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, description, durationDays, priceEuro } = req.body;
        const plan = await MembershipPlan.create({
            name,
            description,
            durationDays,
            priceEuro,
        });
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/plans/:id
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/plans/:id
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        plan.isActive = false;
        await plan.save();
        res.json({ message: 'Plan deactivated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/plans/:id/status
router.patch('/:id/status', requireAdmin, async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        plan.isActive = !plan.isActive;
        await plan.save();
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

