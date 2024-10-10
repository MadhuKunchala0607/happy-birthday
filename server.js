require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public directory

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Create a schema and model for birthdays
const birthdaySchema = new mongoose.Schema({
    name: String,
    email: String,
    date: Date
});

const Birthday = mongoose.model('Birthday', birthdaySchema);

// Endpoint to get all birthdays
app.get('/birthdays', async (req, res) => {
    try {
        const birthdays = await Birthday.find({});
        res.json(birthdays);
    } catch (error) {
        console.error('Error fetching birthdays:', error);
        res.status(500).json({ error: 'Error fetching birthdays' });
    }
});

// Endpoint to add a birthday
app.post('/birthdays', async (req, res) => {
    const { name, email, date } = req.body;
    const newBirthday = new Birthday({ name, email, date });

    try {
        const savedBirthday = await newBirthday.save();
        res.json(savedBirthday);
    } catch (error) {
        console.error('Error adding birthday:', error);
        res.status(500).json({ error: 'Error adding birthday' });
    }
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send birthday emails
const sendBirthdayEmails = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight

    const birthdaysToday = await Birthday.find({
        date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Get the range for today
        }
    });

    birthdaysToday.forEach(birthday => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: birthday.email,
            subject: 'Happy Birthday!',
            text: `Happy Birthday, ${birthday.name}! 🎉`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error sending email:', error);
            }
            console.log('Email sent:', info.response);
        });
    });
};

// Call the function when the server starts
sendBirthdayEmails(); // This will send emails for today if there are any birthdays

// Endpoint to send birthday emails manually
app.get('/send-birthday-emails', async (req, res) => {
    try {
        await sendBirthdayEmails();
        res.json({ message: 'Birthday emails sent!' });
    } catch (error) {
        console.error('Error sending birthday emails:', error);
        res.status(500).json({ error: 'Error sending birthday emails' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
