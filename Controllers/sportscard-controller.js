const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const apiKey = process.env.HUBSPOT_API_KEY;
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

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
async function sendPasswordEmail(userEmail, password, request_token) {
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
        text: `Your account has been created successfully. Here is your password: ${password} \n Please goto https://demo.sportscard.icu/login?request-token=${request_token} and add login details`
    };

    await transporter.sendMail(mailOptions);
}

router.post("/sportscard", async (req, res) => {
    try {
        // Generate a random password
        const password = generateRandomPassword();
        const request_token = uuidv4();
        const data = req.body.properties;
        console.log('data came from the request == ', data);
        // Step 1: Send the registration data to the Laravel /register endpoint
        const registerResponse = await axios.post('https://demo.sportscard.icu/register', {
            form_type: data.form_type,
            first_name: data.firstname,
            last_name: data.lastname,
            is_admin: 1,
            region_code: 1,
            email: data.email,
            password: password,  // Use the generated password
            password_confirmation: password,
            term_policy_check:true,
            referral_code: data.referral_code || null,  // Optional
            request_token: request_token
        }, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        registerResponse.data ? console.log('User registered successfully:') : console.log('User not registered');
        ;

        // Send the generated password to the user's email
         await sendPasswordEmail(data.email, password, request_token);

        // // Step 2: If the user is successfully created, send data to HubSpot
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
        console.log('Error:', error?.response?.data.message);

        if ( error?.response?.data?.status === 422) {
            return res.status(422).json({ message: "Email already exists" });
        }

        // If the error occurred during the registration step, respond accordingly
        if (error?.response?.status === 400) {
            return res.status(400).json({ message: "Registration failed", details: error.response.data });
        }

        if (error?.response?.status === 500) {
        // If the error occurred during the HubSpot step, respond accordingly
        res.status(500).json({ message: "Internal server error", details: error.message });
        }
    }
});

// POST endpoint to update 'last_login' field in HubSpot for a given email
router.post("/update-last-login", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Step 1: Prepare the data to update 'last_login' in HubSpot
        const hubspotUpdateData = {
            properties: {
                last_login: new Date().toISOString(), // Current timestamp
            }
        };

        // Step 2: Send a PATCH request to update the HubSpot contact by email
        const config = {
            url: `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`,  // Assuming email is the identifier
            method: "patch", // HubSpot update method
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`, // API key from .env file
            },
            data: JSON.stringify(hubspotUpdateData),
        };

        const hubspotResponse = await axios.request(config);
        console.log('HubSpot contact updated:', hubspotResponse.data);

        // Step 3: Send a success response back to the client
        res.json({
            message: 'HubSpot contact updated successfully',
            hubspotData: hubspotResponse.data
        });

    } catch (error) {
        console.error('Error updating HubSpot contact:', error?.response?.data || error.message);

        // Handle specific error statuses
        if (error?.response?.status === 404) {
            return res.status(404).json({ message: "Contact not found in HubSpot" });
        }

        res.status(500).json({ message: "Internal server error", details: error.message });
    }
});


module.exports = router;
