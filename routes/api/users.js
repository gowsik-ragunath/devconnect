const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');

const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const config = require('config');

// @route   POST api/users
// @desc    Test route
// @access  Public
// Improvements need to check if body is undefined
router.post("/", [
    check(
        "name",
        "Name is required"
    ).not().isEmpty(),
    check(
        "email",
        "Please enter a valid email address"
    ).isEmail(),
    check(
        "password",
        "please enter a password with minium of 6 or more characters"
    ).isLength({ min: 6 })
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {  
        return res.status(400).json({ errors: errors.array() });
    }
   
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({ error: [{ msg: "User already exist" }] });
        }

        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm"
        });

        const salt = await bcrypt.genSalt(10);

        user = new User({
            name,
            email,
            password,
            avatar
        });

        user.password = await bcrypt.hash(password, salt);

        await user.save();

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