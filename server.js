
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors()); // For handling cross-origin requests

// Razorpay instance
const razorpay = new Razorpay({
    key_id: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key_id
    key_secret: 'YOUR_RAZORPAY_KEY_SECRET' // Replace with your Razorpay key_secret
});

// Create an order and return it to the frontend
app.post('/create-order', async (req, res) => {
    const { amount, currency = 'INR' } = req.body;

    const options = {
        amount: amount * 100, // Amount in paise for INR
        currency: currency,
        receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
        payment_capture: 1 // Auto-capture payment
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Verify the payment signature (optional but recommended)
app.post('/verify-payment', (req, res) => {
    const crypto = require('crypto');
    const { order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', 'YOUR_RAZORPAY_KEY_SECRET');
    hmac.update(`${order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        res.json({ status: 'success' });
    } else {
        res.status(400).json({ status: 'failure' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});