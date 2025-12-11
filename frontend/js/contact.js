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
// ============================================================
// CONTACT FORM HANDLER
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
});

// Initialize contact form with event listener
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', handleContactFormSubmit);
}

// Handle contact form submission
async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const contactForm = e.target;
    const formMessage = document.getElementById('formMessage');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = getContactFormData(contactForm);
    
    // Validate form data
    const validation = validateContactForm(formData);
    if (!validation.valid) {
        showFormMessage(formMessage, validation.error, 'error');
        return;
    }
    
    // Submit form
    setSubmitButtonState(submitBtn, true, 'Sending...');
    
    try {
        const response = await submitContactForm(formData);
        handleContactResponse(response, formMessage, contactForm);
    } catch (error) {
        console.error('Contact form error:', error);
        showFormMessage(
            formMessage, 
            'Unable to send message. Please check that the backend server is running and try again.', 
            'error'
        );
    } finally {
        setSubmitButtonState(submitBtn, false);
    }
}

// ============================================================
// FORM HELPER FUNCTIONS
// ============================================================

// Get form field values
function getContactFormData(form) {
    return {
        name: form.querySelector('#name')?.value.trim() || '',
        email: form.querySelector('#email')?.value.trim() || '',
        subject: form.querySelector('#subject')?.value.trim() || '',
        message: form.querySelector('#message')?.value.trim() || ''
    };
}

// Validate all required fields
function validateContactForm(formData) {
    const MIN_MESSAGE_LENGTH = 10;
    
    // Check required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        return {
            valid: false,
            error: 'Please fill in all required fields.'
        };
    }
    
    // Check message length
    if (formData.message.length < MIN_MESSAGE_LENGTH) {
        return {
            valid: false,
            error: `Message must be at least ${MIN_MESSAGE_LENGTH} characters long.`
        };
    }
    
    return { valid: true };
}

// Submit form data to API
async function submitContactForm(formData) {
    const apiUrl = `${CONFIG.API_BASE_URL}/contact`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    return { ok: response.ok, ...data };
}

// Handle API response
function handleContactResponse(response, formMessage, contactForm) {
    if (response.ok && response.success) {
        const successMsg = response.message || 'Thank you for your message! We will get back to you soon.';
        showFormMessage(formMessage, successMsg, 'success');
        contactForm.reset();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            clearFormMessage(formMessage);
        }, 5000);
    } else {
        let errorMsg = response.message || 'There was an error sending your message. Please try again.';
        if (response.errors && response.errors.length > 0) {
            errorMsg = response.errors.map(err => err.msg).join(', ');
        }
        showFormMessage(formMessage, errorMsg, 'error');
    }
}

// ============================================================
// FORM MESSAGE DISPLAY
// ============================================================

// Show form message with appropriate styling
function showFormMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

// Clear form message
function clearFormMessage(element) {
    element.textContent = '';
    element.className = 'form-message';
}

// Update submit button state
function setSubmitButtonState(btn, isLoading, loadingText = 'Sending...') {
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = loadingText;
        btn.disabled = true;
    } else {
        btn.textContent = btn.dataset.originalText || 'Send Message';
        btn.disabled = false;
    }
}
