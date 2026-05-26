const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // لقراءة البيانات الحساسة من ملف .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// 1. الاتصال بقاعدة بيانات MongoDB السحابية
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('تم الاتصال بقاعدة بيانات MongoDB السحابية بنجاح.'))
    .catch(err => console.error('فشل الاتصال بقاعدة بيانات MongoDB:', err.message));

// 2. تعريف هيكل البيانات (Mongoose Schema)
const bookingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // كود الحجز مثل BK-XXXXXX
    clientName: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: null }, // يقبل الكائنات المرنة للباقة المخصصة
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'active' }, // active, finished, cancelled
    createdAt: { type: String, required: true }
});

const Booking = mongoose.model('Booking', bookingSchema);

// 3. جلب جميع الحجوزات (للأدمن)
app.get('/api/bookings', async (req, res) => {
    try {
        // جلب الحجوزات وفرزها من الأحدث للأقدم
        const result = await Booking.find().sort({ createdAt: -1 });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. إضافة حجز جديد سحابياً
app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.json({ success: true, bookingId: newBooking.id });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. تحديث حالة الجلسة (نشط / منتهي / ملغى)
app.post('/api/bookings/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // البحث باستخدام كود الحجز المخصص وتعديل حالته
        await Booking.findOneAndUpdate({ id: id }, { status: status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. حذف حجز نهائياً
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // البحث باستخدام كود الحجز المخصص وحذفه
        await Booking.findOneAndDelete({ id: id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = app;