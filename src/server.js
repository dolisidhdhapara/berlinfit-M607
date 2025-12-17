require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const planRoutes = require('./routes/planRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const classTypeRoutes = require('./routes/classTypeRoutes');
const classSessionRoutes = require('./routes/classSessionRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// setup middleware
app.use(express.json());
app.use(cors());

app.use(express.static('public'));


// session setup
app.use(
    session({
        secret: 'gisma-university',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', testRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/admin/class-types', classTypeRoutes);
app.use('/api/admin/class-sessions', classSessionRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

// config
// PayPal Config
app.get('/api/config/paypal', (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});


const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const admin = new User({
                fullName: 'Admin Trainer',
                email: 'admin@berlin-fit.de',
                password: 'admin123', // PLAIN TEXT
                role: 'admin',
            });
            await admin.save();
            console.log('Admin user seeded successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

// Connect to Database and Start Server
const startServer = async () => {
    try {
        await connectDB();

        await connectDB();

        // create admin if needed
        await seedAdmin();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
