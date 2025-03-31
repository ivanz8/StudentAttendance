const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (you'll need your serviceAccountKey.json)
admin.initializeApp({
    // Your Firebase configuration
    databaseURL: "https://amaz-4e4ef-default-rtdb.firebaseio.com"
});

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'perezestopa@gmail.com',
        pass: 'duplpzfbyqhqfxoy'
    }
});

// Endpoint to send email
app.post('/send-email', async (req, res) => {
    const { studentName, type, guardianEmail, time, date } = req.body;

    const mailOptions = {
        from: 'perezestopa@gmail.com',
        to: guardianEmail,
        subject: `Student Attendance Notification - ${type.toUpperCase()}`,
        html: `
            <h2>Student Attendance Notification</h2>
            <p>Dear Guardian,</p>
            <p>This is to inform you that <strong>${studentName}</strong> has recorded their attendance:</p>
            <ul>
                <li>Type: ${type.toUpperCase()}</li>
                <li>Date: ${date}</li>
                <li>Time: ${time}</li>
            </ul>
            <p>Best regards,<br>School Attendance System</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
