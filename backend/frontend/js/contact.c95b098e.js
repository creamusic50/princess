// Contact Form Handler with proper API URL handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Clear previous messages
            formMessage.textContent = '';
            formMessage.className = 'form-message';

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Validate required fields
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Please fill in all required fields.';
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Validate message length (minimum 10 characters)
            if (formData.message.length < 10) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Message must be at least 10 characters long.';
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }

            try {
                // Determine API URL based on environment
                const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://localhost:5000'  // Local development
                    : '';  // Production (same origin)

                console.log('Submitting to:', `${API_BASE_URL}/api/contact`);
                console.log('Form data:', formData);

                const response = await fetch(`${API_BASE_URL}/api/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok && data.success) {
                    formMessage.className = 'form-message success';
                    formMessage.textContent = data.message || 'Thank you for your message! We will get back to you soon.';
                    contactForm.reset();
                    
                    // Auto-hide success message after 5 seconds
                    setTimeout(() => {
                        formMessage.textContent = '';
                        formMessage.className = 'form-message';
                    }, 5000);
                } else {
                    formMessage.className = 'form-message error';
                    if (data.errors && data.errors.length > 0) {
                        formMessage.textContent = data.errors.map(err => err.msg).join(', ');
                    } else {
                        formMessage.textContent = data.message || 'There was an error sending your message. Please try again.';
                    }
                }
            } catch (error) {
                console.error('Contact form error:', error);
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Unable to send message. Please check that the backend server is running and try again.';
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
