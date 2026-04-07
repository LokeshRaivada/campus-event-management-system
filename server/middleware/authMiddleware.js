const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        console.warn('[Auth] No token provided in header:', authHeader);
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(`[Auth] JWT Verification Error for token "${token.substring(0, 10)}...":`, err.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

// Role-based protection middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role === 'superadmin' ? 'super_admin' : req.user.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };
