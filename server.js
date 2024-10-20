require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const moment = require('moment-timezone'); // Import moment-timezone

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Create a schema and model for birthdays
const birthdaySchema = new mongoose.Schema({
    name: String,
    email: String,
    date: Date,  // Ensure this date is in UTC
    gender: String
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
    const { name, email, date, gender } = req.body;

    // Ensure date is converted to UTC before saving
    const dateInUTC = moment(date).utc().toDate();

    const newBirthday = new Birthday({
        name,
        email,
        date: dateInUTC,
        gender
    });

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
    const today = moment().tz('Asia/Kolkata'); // Change to your timezone
    const todayMonth = today.month() + 1; // moment.js month is 0-indexed
    const todayDate = today.date();

    const birthdaysToday = await Birthday.find({
        $expr: {
            $and: [
                { $eq: [{ $month: "$date" }, todayMonth] },
                { $eq: [{ $dayOfMonth: "$date" }, todayDate] }
            ]
        }
    });

    birthdaysToday.forEach(birthday => {
        const birthDate = moment(birthday.date);
        const age = today.diff(birthDate, 'years');
        const weeks = today.diff(birthDate, 'weeks');
        const days = today.diff(birthDate, 'days');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: birthday.email,
            subject: 'Happy Birthday!',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                    <h1 style="color: #5C67F2;">Happy Birthday, ${birthday.name}!</h1>
                    <h3 style="color: #333;">🎂 Wishing You a Day Filled with Joy 🎂</h3>
                    <p style="font-size: 18px; color: #555;">
                        "Count your life by smiles, not tears. Count your age by friends, not years."
                    </p>
                    <p style="font-size: 16px; color: #777;">
                        You are now <strong>${age} years, ${weeks} weeks, and ${days} days</strong> old!
                    </p>
                    <p style="font-size: 16px; color: #777;">
                        We hope you have a fantastic day filled with love, laughter, and all the things that bring you happiness. Enjoy your special day!
                    </p>
                    <div style="margin-top: 30px;">
                        <img src="https://cdn.vectorstock.com/i/500p/03/34/birthday-cake-vector-1130334.jpg" alt="Birthday Cake" style="width: 100px; height: auto;"/>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error sending email:', error);
            }
            console.log('Email sent:', info.response);
        });
    });
};

// Schedule the job to run daily at midnight in the specified timezone
cron.schedule('0 0 * * *', () => {
    console.log('Running scheduled task to send birthday emails');
    sendBirthdayEmails()
        .then(() => console.log('Birthday email task completed'))
        .catch(error => {
            console.error('Error running sendBirthdayEmails:', error);
        });
}, {
    timezone: 'Asia/Kolkata' // Change this to your preferred timezone
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
