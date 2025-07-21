const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const userRoutes = express.Router();

// POST /api/users/register - Register a new user
userRoutes.post(
    '/register', 
    [
        // Validation middleware for request body
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, email, password } = req.body;

        try {
            // Check if email is already in use
            const existingUser = await User.findOne({ email }); // Queries MongoDB for a existing user email
            if(existingUser) return res.status(400).json({ error: 'Email already in use' });

            // Hash user password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create new user instance
            const user = new User({
                email,
                password: hashedPassword,
                username,
                createdAt: new Date()
            });
            await user.save();

            // Generate JWT
            const payload = {
                userId: user._id,
                email: user.email
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Return success resonse
            res.status(201).json({
                token,
                user: { id: user._id, username: user.username, email: user.email }
            });
        } catch (error) {
            console.log('Registration error', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
);

userRoutes.post(
    '/login',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
    ],
    async( req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if(!user) return res.status(400).send('Invalid username');

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).send('Invalid password');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ user: {id: user._id, email: user.email, username: user.username}, token, loggedIn: true})
    }
)

module.exports = userRoutes;