// routes/birthdays.js
const express = require('express');
const Birthday = require('../models/Birthday'); // Adjust the path as necessary
const router = express.Router();

// Get all birthdays
router.get('/', async (req, res) => {
    try {
        const birthdays = await Birthday.find({});
        res.json(birthdays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new birthday
router.post('/', async (req, res) => {
    const { name, email, date } = req.body;

    const birthday = new Birthday({
        name,
        email,
        date,
    });

    try {
        const savedBirthday = await birthday.save();
        res.status(201).json(savedBirthday);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
