const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { email, message } = req.body;

    // Basic validation
    if (!email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // For now, simulate success and log to console
    console.log('=================================');
    console.log('📩 New Contact Form Submission');
    console.log('=================================');
    console.log(`📧 Email: ${email}`);
    console.log(`💬 Message: ${message}`);
    console.log('=================================');

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully. We will get back to you soon!' 
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
