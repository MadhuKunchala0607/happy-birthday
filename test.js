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
            html: ` <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                <h1 style="color: #5C67F2;">Happy Birthday, ${birthday.name}!</h1>
                <h3 style="color: #333;">🎂 Wishing You a Day Filled with Joy 🎂</h3>
                <p style="font-size: 18px; color: #555;">
                    "Count your life by smiles, not tears. Count your age by friends, not years."
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

// Test function to run the email sending process
const testEmailSending = async () => {
    await sendBirthdayEmails();
    mongoose.connection.close(); // Close the connection after testing
};
