// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const {
    checkEmail,
    verifyCode,
    completeRegistration,
    loginUser,
    getSetupInfo
} = require('../controllers/authController');

router.post('/check-email', checkEmail);
router.post('/verify-code', verifyCode);
router.post('/complete-registration', completeRegistration);
router.post('/login', loginUser);

router.get('/setup-info', getSetupInfo);

module.exports = router;