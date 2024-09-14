const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const apiKey = process.env.HUBSPOT_API_KEY;
const nodemailer = require('nodemailer');

// Function to generate a random password
function generateRandomPassword(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Function to send an email with the generated password
async function sendPasswordEmail(userEmail, password) {
    const senderEmail = 'huzefa.markcoders@gmail.com';
    const senderPassword = 'dwtzeexfoklkbazr'
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or use another email service
        auth: {
            user: senderEmail,
            pass: senderPassword
        }
    });

    const mailOptions = {
        from: senderEmail,
        to: userEmail,
        subject: 'Sportscard Demo Account Credentials',
        text: `Your account has been created successfully. Here is your password: ${password}, please goto https://demo.sportscard.icu/login and add login details`
    };

    await transporter.sendMail(mailOptions);
}

router.post("/sportscard", async (req, res) => {
    try {
        // Generate a random password
        const password = generateRandomPassword();
        const data = req.body.properties;
        console.log('data came from the request == ', data);
        
        // Step 1: Send the registration data to the Laravel /register endpoint
        const registerResponse = await axios.post('https://demo.sportscard.icu/register', {
            first_name: data.firstname,
            last_name: data.lastname || "Doe",
            email: data.email,
            password: password,  // Use the generated password
            password_confirmation: password,
            term_policy_check:true,
            referral_code: data.referral_code || null,  // Optional
        }, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        //console.log('User registered successfully:', registerResponse.data);

        // Send the generated password to the user's email
        await sendPasswordEmail(data.email, password);

        // Step 2: If the user is successfully created, send data to HubSpot
        const config = {
            url: "https://api.hubapi.com/crm/v3/objects/contacts/",
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            data: JSON.stringify(req.body),
        };

        const hubspotResponse = await axios.request(config);
        console.log('HubSpot response:', hubspotResponse.data);

        // Step 3: Send a success response back to the client
        res.json(hubspotResponse.data);
    } catch (error) {
        console.log('Error:', error?.response?.data || error.message);

        // If the error occurred during the registration step, respond accordingly
        if (error?.response?.status === 400) {
            return res.status(400).json({ message: "Registration failed", details: error.response.data });
        }

        // If the error occurred during the HubSpot step, respond accordingly
        res.status(500).json({ message: "Internal server error", details: error.message });
    }
});

module.exports = router;
