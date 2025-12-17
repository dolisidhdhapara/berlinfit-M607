const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');

// me
router.get('/me', requireLogin, (req, res) => {
    res.json({
        message: 'User profile',
        user: req.session.user,
    });
});

// GET /api/admin/test
router.get('/admin/test', requireAdmin, (req, res) => {
    res.json({
        message: 'Admin route OK',
    });
});

module.exports = router;
