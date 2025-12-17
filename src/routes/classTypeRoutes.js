const express = require('express');
const router = express.Router();
const ClassType = require('../models/ClassType');
const { requireAdmin } = require('../middleware/auth');

// GET /api/admin/class-types
router.get('/', requireAdmin, async (req, res) => {
    try {
        const classTypes = await ClassType.find();
        res.json(classTypes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// create class type
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, description, difficulty, defaultDurationMinutes, defaultCapacity } = req.body;

        const classType = await ClassType.create({
            name,
            description,
            difficulty,
            defaultDurationMinutes,
            defaultCapacity,
        });
        res.status(201).json(classType);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/class-types/:id
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const classType = await ClassType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!classType) {
            return res.status(404).json({ message: 'Class type not found' });
        }
        res.json(classType);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/class-types/:id
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const classType = await ClassType.findByIdAndDelete(req.params.id);
        if (!classType) {
            return res.status(404).json({ message: 'Class type not found' });
        }
        res.json({ message: 'Class type deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
