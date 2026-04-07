const db = require('../config/db');

const otpStore = new Map();

const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOTP = async (req, res) => {
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ success: false, message: 'Email and role are required' });
    }

    try {
        // Normalize role for DB query
        const dbRole = role === 'super_admin' ? 'superadmin' : role;
        
        // Verify user exists in DB before sending OTP
        const [rows] = await db.execute(
            'SELECT id FROM users WHERE email = ? AND role = ?', 
            [email, dbRole]
        );

        if (rows.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: `No ${role} account found with this email. Please check your details.` 
            });
        }
    } catch (dbErr) {
        console.error('[OTP DB Error]', dbErr);
        return res.status(500).json({ success: false, message: 'Server verification error' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { otp, role, expiresAt });

    console.log(`\n📧 OTP for ${email} (${role}): ${otp}\n`);

    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"GMRIT Events" <${EMAIL_USER}>`,
                to: email,
                subject: 'Your Login OTP — GMRIT Events',
                html: `<h1>OTP: ${otp}</h1>`,
            });
        } catch (err) {
            console.error('❌ Failed to send email:', err.message);
        }
    }

    res.json({ success: true, message: 'OTP sent successfully' });
};

const verifyOTP = (req, res) => {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and role are required' });
    }

    const entry = otpStore.get(email);

    if (!entry || entry.expiresAt < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({ success: false, message: 'OTP invalid or expired.' });
    }

    if (entry.otp !== otp || entry.role !== role) {
        return res.status(400).json({ success: false, message: 'Invalid OTP or Role mismatch.' });
    }

    otpStore.delete(email);

    const routes = {
        student: '/student/dashboard',
        admin: '/admin',
        superadmin: '/superadmin',
    };

    res.json({
        success: true,
        message: 'OTP verified successfully',
        redirectTo: routes[role] || '/',
    });
};

module.exports = { sendOTP, verifyOTP };
