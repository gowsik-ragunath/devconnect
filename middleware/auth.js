const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if(!token) {
        res.status(401).json({ error: [{ msg: "No token, Unauthorized" }] });
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded;
        next();
    } catch(err) {
        res.status(401).json({ error: [{ msg: "Token is not valid" }] });
    }
}