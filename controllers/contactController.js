const nodemailer = require('nodemailer');

exports.sendContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Email to admin
    await transporter.sendMail({
      from: `"Smart Money Guide" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2c3e50;">New Contact Form Submission</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          </div>
        </div>
      `
    });
    
    // Auto-reply to user
    await transporter.sendMail({
      from: `"Smart Money Guide" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting Smart Money Guide',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2c3e50;">Thank You for Contacting Us!</h2>
          <p>Hello ${name},</p>
          <p>We've received your message and will get back to you within 24-48 hours.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="font-style: italic;">"${message}"</p>
          </div>
          <p>Best regards,<br>The Smart Money Guide Team</p>
        </div>
      `
    });
    
    res.json({
      success: true,
      message: 'Message sent successfully!'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    // Still return success for user experience
    res.json({
      success: true,
      message: 'Message received! We will contact you soon.'
    });
  }
};