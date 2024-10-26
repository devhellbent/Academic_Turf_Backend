// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



// Secret key from .env
const SECRET_KEY = process.env.SECRET_KEY || 'mysecretkey';
// Import necessary libraries


exports.googleLogin = async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // If user doesn't exist, return a special response
            return res.status(200).send({
                isNewUser: true,
                email,
                name,
                profilePicture: picture
            });
        }

        // Generate JWT token
        const jwtToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            accessToken: jwtToken
        });
    } catch (error) {
        res.status(500).send({ message: 'Error with Google login', error: error.message });
    }
};

exports.completeGoogleSignup = async (req, res) => {
    const { email, name, profilePicture, role } = req.body;

    if (!['Student Client', 'Service Provider'].includes(role)) {
        return res.status(400).send({ message: 'Invalid role selected' });
    }

    try {
        const password = Math.random().toString(36).slice(-8); // Generate a random password
        const user = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, 8),
            profilePicture: profilePicture,
            role
        });

        const jwtToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        res.status(201).send({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            accessToken: jwtToken
        });
    } catch (error) {
        res.status(500).send({ message: 'Error completing Google signup', error: error.message });
    }
};




// Function to request password reset
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send({ message: 'User not found!' });
        }

        // Generate a reset token (crypto for security)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Save the reset token in the database and set expiration
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Send email to the user
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Link',
            text: `You are receiving this because you have requested to reset your password. Please click on the following link, or paste it into your browser, to complete the process: ${resetLink}`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).send({ message: 'Error sending email.' });
            }
            res.status(200).send({ message: 'Reset link sent to your email.' });
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
// Function to render the password reset form (if the token is valid)
exports.renderResetForm = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() } // Check if token is still valid
            }
        });

        if (!user) {
            return res.status(400).send({ message: 'Password reset token is invalid or has expired.' });
        }

        // Render a password reset form (Frontend handles this part, backend returns token check)
        res.status(200).send({ message: 'Valid token, render form.' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Function to handle the new password submission

exports.resetPassword = async (req, res) => {
    const { token } = req.params; // Get token from URL
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match!" });
    }

    try {
        // Validate the token, find the user, and update the password
        const user = await User.findOne({ where: { resetPasswordToken: token } });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token!" });
        }

        // Hash the new password before saving
        const hashedPassword = bcrypt.hashSync(newPassword, 8);
        user.password = hashedPassword; // Update user's password with hashed one

        // Clear the reset token
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong!" });
    }
};



// Signup function

exports.signup = async (req, res) => {
    const { name, email, password, role, profilePicture } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists!" });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Create the user with the hashed password and profile picture
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            profilePicture // Save the profile picture
        });

        // Generate JWT token for the newly created user (no expiration)
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);

        // Save the token in the database
        user.loginToken = token;
        await user.save();

        res.status(201).send({
            message: 'User registered successfully!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,  // Return profile picture in response
                accessToken: user.loginToken
            }
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


// Signin function


exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send({ message: 'User not found!' });
        }

        // Compare the entered password with the stored hashed password
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ accessToken: null, message: 'Invalid Password!' });
        }

        // Generate JWT token if password is valid
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        // Send the response with the access token and profile picture
        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture, // Return profile picture in response
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};







