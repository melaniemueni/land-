console.log("Starting server...");
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve your static files

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, interest, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        // Email options for admin notification
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `New Contact Form Submission from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Phone: ${phone || 'Not provided'}
                Interest: ${interest || 'Not specified'}
                
                Message:
                ${message}
            `,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Interest:</strong> ${interest || 'Not specified'}</p>
                <h3>Message:</h3>
                <p>${message}</p>
            `
        };

        // Email options for user confirmation
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting Barsta Land Properties',
            text: `
                Dear ${name},
                
                Thank you for reaching out to Barsta Land Properties. We have received your message and will get back to you within 24-48 hours.
                
                Here's a copy of your message:
                ${message}
                
                If you have any urgent inquiries, please call us at 0712345678.
                
                Best regards,
                The Barsta Team
            `,
            html: `
                <h2>Thank you for contacting Barsta Land Properties</h2>
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to Barsta Land Properties. We have received your message and will get back to you within 24-48 hours.</p>
                
                <h3>Your Message:</h3>
                <p>${message}</p>
                
                <p>If you have any urgent inquiries, please call us at <strong>0712345678</strong>.</p>
                
                <p>Best regards,<br>The Barsta Team</p>
            `
        };

        // Send both emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});