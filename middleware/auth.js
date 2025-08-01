const jwt = require('jsonwebtoken');

const auth = async(req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).send('No token provided');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send('Invalid token');
    }
};

module.exports = auth;