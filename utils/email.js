const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendContactNotification(contactData) {
    const { name, email, subject, message } = contactData;
    
    const mailOptions = {
      from: `"Smart Money Guide" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: this.generateContactHTML(name, email, subject, message)
    };
    
    await this.transporter.sendMail(mailOptions);
  }

  async sendAutoReply(contactData) {
    const { name, email, message } = contactData;
    
    const mailOptions = {
      from: `"Smart Money Guide" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting Smart Money Guide',
      html: this.generateAutoReplyHTML(name, message)
    };
    
    await this.transporter.sendMail(mailOptions);
  }

  async sendNewPostNotification(post, subscribers) {
    // This would be for newsletter functionality
    // Implement if needed
  }

  generateContactHTML(name, email, subject, message) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2c3e50;">New Contact Form Submission</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Received at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;
  }

  generateAutoReplyHTML(name, message) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2c3e50;">Thank You for Contacting Us!</h2>
        <p>Hello ${name},</p>
        <p>We've received your message and will get back to you within 24-48 hours.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Your Message:</strong></p>
          <p style="font-style: italic;">"${message}"</p>
        </div>
        <p>In the meantime, feel free to browse our latest articles on 
          <a href="https://smartmoneyguide.com" style="color: #667eea;">Smart Money Guide</a>.
        </p>
        <p>Best regards,<br>The Smart Money Guide Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated response. Please do not reply to this email.
        </p>
      </div>
    `;
  }
}

module.exports = new EmailService();