require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

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
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    // Find birthdays matching today's month and day, regardless of the year
    const birthdaysToday = await Birthday.find({
        $expr: {
            $and: [
                { $eq: [{ $month: "$date" }, todayMonth + 1] }, // MongoDB month is 1-based
                { $eq: [{ $dayOfMonth: "$date" }, todayDate] }
            ]
        }
    });

    birthdaysToday.forEach(birthday => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: birthday.email,
            subject: 'Happy Birthday!',
            text: `Happy Birthday, ${birthday.name}! Wishing you a day filled with love, laughter, and happiness! May all your dreams and wishes come true as you celebrate this special day. Have an amazing year ahead, full of joy and success! 🎈🎁🎉`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error sending email:', error);
            }
            console.log('Email sent:', info.response);
        });
    });
};

// Endpoint to trigger sending birthday emails manually
app.get('/send-birthday-emails', async (req, res) => {
    try {
        await sendBirthdayEmails();
        res.json({ message: 'Birthday emails sent!' });
    } catch (error) {
        console.error('Error sending birthday emails:', error);
        res.status(500).json({ error: 'Error sending birthday emails' });
    }
});

// Schedule the job to run daily at 12 AM
cron.schedule('0 0 * * *', () => {
    console.log('Running scheduled task to send birthday emails');
    sendBirthdayEmails().catch(error => {
        console.error('Error running sendBirthdayEmails:', error);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
