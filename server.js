const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('تم الاتصال بقاعدة بيانات MongoDB السحابية بنجاح.'))
    .catch(err => console.error('فشل الاتصال بقاعدة بيانات MongoDB:', err.message));

const bookingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    clientName: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: null },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'active' },
    createdAt: { type: String, required: true }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.get('/api/bookings', async (req, res) => {
    try {
        const result = await Booking.find().sort({ createdAt: -1 });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.json({ success: true, bookingId: newBooking.id });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/bookings/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await Booking.findOneAndUpdate({ id: id }, { status: status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findOneAndDelete({ id: id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


module.exports = app;
