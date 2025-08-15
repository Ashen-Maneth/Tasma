const jwt = require('jsonwebtoken');

function auth(role) {
    return (req, res, next) => {
        const token = req.header('x-auth-token');

        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, 'your_jwt_secret');
            req.user = decoded.user;

            if (role && req.user.role !== role) {
                return res.status(403).json({ msg: 'Access denied' });
            }
            
            next();
        } catch (e) {
            res.status(400).json({ msg: 'Token is not valid' });
        }
    };
}

module.exports = auth;
