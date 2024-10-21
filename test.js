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
    date: Date,
    gender: String // Include gender if needed
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
    // Get today's date using JavaScript's built-in Date
    const today = new Date();
    const currentMonth = today.getMonth(); // Get current month (0-11)
    const currentDate = today.getDate(); // Get current date (1-31)

    console.log(`Checking for birthdays on: ${currentDate}-${currentMonth + 1}`);

    // Fetch all birthdays and filter manually for matching day and month
    const allBirthdays = await Birthday.find({});
    const birthdaysToday = allBirthdays.filter(birthday => {
        const birthDate = new Date(birthday.date);
        return birthDate.getDate() === currentDate && birthDate.getMonth() === currentMonth;
    });

    if (birthdaysToday.length === 0) {
        console.log('No birthdays found for today.');
        return;
    }

    // Send birthday emails for each matching birthday
    for (const birthday of birthdaysToday) {
        const birthDate = new Date(birthday.date);
        const age = today.getFullYear() - birthDate.getFullYear();
        const weeks = Math.floor((today - birthDate) / (7 * 24 * 60 * 60 * 1000));
        const days = Math.floor((today - birthDate) / (24 * 60 * 60 * 1000));

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

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${birthday.email}:`, info.response);
        } catch (error) {
            console.error(`Error sending email to ${birthday.email}:`, error);
        }
    }
};

// Test function to run the email sending process
const testEmailSending = async () => {
    await sendBirthdayEmails();
    mongoose.connection.close(); // Close the connection after testing
};
