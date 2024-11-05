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

    try {
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
    return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        return false;
    }

    
}

// Main route
router.post("/sportscard", async (req, res) => {
    try {
        const data = req.body.properties;
        console.log('Data received from the request:', data);

        const password = generateRandomPassword();
        const request_token = uuidv4();

        // Step 1: Register the user in Laravel
        const registerResponse = await registerUserInLaravel(data, password, request_token, res);

        console.log(registerResponse)

        // If registration is successful, proceed to Step 2
        if (registerResponse) {
            // Step 2: Send the generated password via email
            const emailResponse = await sendPasswordEmail(data.email, password, request_token);

            // If email sending is successful, proceed to Step 3
            if (emailResponse) {
                // Step 3: Add user to HubSpot
                const hubspotResponse = await addUserToHubSpot(req.body);
                console.log('HubSpot response:', hubspotResponse);

                // Step 4: Send a success response back to the client
                return res.json(hubspotResponse);
            } else {
                // If email fails, send an error response
                return res.status(500).json({ message: "Email sending failed" });
            }
        } else {
            // If registration fails, send an error response
            return res.status(400).json({ message: "User registration failed" });
        }
    } catch (error) {
        handleError(error, res);
    }
});

// Function to handle errors and provide feedback
function handleError(error, res) {
    console.log('Error:', error?.response?.data?.message || error.message);
    
    if (error?.response?.status !== 500) {
        return res.status(400).json({ message: "Request failed", details: error?.response?.data?.message || error.message });
    }
    
    res.status(500).json({ message: "Internal server error", details: error.message });
}

// Function to register a user in Laravel
async function registerUserInLaravel(data, password, request_token, res) {
    try {
        const response = await axios.post('https://demo.sportscard.icu/register', {
            form_type: data.form_type,
            first_name: data.firstname,
            last_name: data.lastname,
            is_admin: 1,
            region_code: 1,
            email: data.email,
            password: password,
            password_confirmation: password,
            term_policy_check: true,
            referral_code: data.referral_code || null,
            request_token: request_token,
            contact:data.mobilephone 
        }, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.data) {
            console.log('User registered in Laravel');
            return response.data;
        }
    } catch (error) {
        console.error('Error registering user in Laravel:', error?.response?.data?.message || error.message);
        return null;
    }
}

// Function to add user data to HubSpot
async function addUserToHubSpot(requestBody) {
    try {
        const config = {
            url: "https://api.hubapi.com/crm/v3/objects/contacts/",
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            data: JSON.stringify(requestBody),
        };

        const response = await axios.request(config);
        console.log('User added to HubSpot');
        return response.data;
    } catch (error) {
        console.error('Error adding user to HubSpot:', error?.response?.data?.message || error.message);
        throw error;
    }
}

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
