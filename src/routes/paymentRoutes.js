const express = require('express');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const { getPayPalClient } = require('../config/paypal');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const { requireLogin } = require('../middleware/auth');

// POST /api/payments/create-order
router.post('/create-order', requireLogin, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await MembershipPlan.findById(planId);

        if (!plan || !plan.isActive) {
            return res.status(404).json({ message: 'Plan not found or inactive' });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'EUR',
                        value: plan.priceEuro.toString(),
                    },
                    description: plan.name,
                },
            ],
        });

        const client = getPayPalClient();
        const order = await client.execute(request);


        // save payment
        const payment = await Payment.create({
            user: req.session.user._id,
            plan: planId,
            amountEuro: plan.priceEuro,
            currency: 'EUR',
            paypalOrderId: order.result.id,
            status: 'created',
        });

        res.json({
            orderId: order.result.id,
            planId: planId,
            links: order.result.links,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/payments/capture-order
router.post('/capture-order', requireLogin, async (req, res) => {
    try {
        const { orderId } = req.body;

        const payment = await Payment.findOne({
            paypalOrderId: orderId,
            user: req.session.user._id,
        }).populate('plan');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        if (payment.status === 'completed') {
            return res.status(400).json({ message: 'Payment already completed' });
        }

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const client = getPayPalClient();
        const capture = await client.execute(request);

        if (capture.result.status === 'COMPLETED') {
            // Update Payment
            payment.status = 'completed';
            payment.paypalCaptureId = capture.result.purchase_units[0].payments.captures[0].id;
            await payment.save();

            // Create Membership
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + payment.plan.durationDays);

            const membership = await Membership.create({
                user: req.session.user._id,
                plan: payment.plan._id,
                startDate,
                endDate,
                status: 'active',
            });



            res.json({
                message: 'Payment completed and membership activated',
                membership,
                payment,
            });
        } else {
            payment.status = 'failed';
            await payment.save();
            res.status(400).json({ message: 'Payment capture failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const body = req.body;
    const headers = req.headers;

    console.log('Received PayPal Webhook:', body.event_type);

    try {
        switch (body.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                // capture success
                const captureId = body.resource.id;
                console.log('Payment captured via webhook:', captureId);
                break;

            case 'PAYMENT.CAPTURE.DENIED':
                console.log('Payment capture denied');
                break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
                console.log('Subscription cancelled');
                break;

            default:
                console.log('Unhandled webhook event:', body.event_type);
        }


        res.status(200).send();
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send();
    }
});

module.exports = router;
