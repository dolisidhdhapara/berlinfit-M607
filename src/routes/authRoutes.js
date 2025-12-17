const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // check existing
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }


        // create user
        const user = await User.create({
            fullName,
            email,
            password,
            role: 'member',
        });

        res.status(201).json({
            message: 'Registered successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // check user
        const user = await User.findOne({ email });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        // check pass
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }


        // session
        req.session.user = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };

        res.json({
            message: 'Login successful',
            user: req.session.user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out' });
    });
});

module.exports = router;
