// test.js

require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        testEmailSending();
    })
    .catch(err => console.log('MongoDB connection error:', err));

// Create a schema and model for birthdays
const birthdaySchema = new mongoose.Schema({
    name: String,
    email: String,
    date: Date
});

const Birthday = mongoose.model('Birthday', birthdaySchema);

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

    if (birthdaysToday.length === 0) {
        console.log('No birthdays found for today.');
        return;
    }

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

// Test function to run the email sending process
const testEmailSending = async () => {
    await sendBirthdayEmails();
    mongoose.connection.close(); // Close the connection after testing
};
