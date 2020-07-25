const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const config = require('config');

const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get("/", auth, async (req,res) => {
    try {
        console.log(req.user);
        const user = await User.findById(req.user.id).select('-password');

        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   POST api/auth
// @desc    Test route
// @access  Public
// Improvements need to check if body is undefined
router.post("/", [
    check(
        "email",
        "Please enter a valid email address"
    ).isEmail(),
    check(
        "password",
        "please enter a password"
    ).not().isEmpty()
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {  
        return res.status(400).json({ errors: errors.array() });
    }
   
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if(!user) {
            return res.status(400).json({ error: [{ msg: "Invalid credentials" }] });
        }

       const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
           return res.status(400).json({ error: [{ msg: "Invalid credentials" }] });
        }

        const payload = {
            id: user.id
        }

        jwt.sign(
            payload,
            config.get("jwtSecret"),
            { expiresIn: 360000 },
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        )
    } catch(err) {
        console.error(err.message);
        res.status(500).json({ errors: [{ msg: "server error"}] })
    }
});


module.exports = router;