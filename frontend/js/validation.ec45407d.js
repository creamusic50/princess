// Form Validation Utilities
class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = {
            validateOnSubmit: true,
            validateOnBlur: true,
            validateOnInput: false,
            showErrors: true,
            scrollToError: true,
            ...options
        };
        
        this.errors = {};
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // Add validation attributes
        this.setupValidationAttributes();
        
        // Add event listeners
        if (this.options.validateOnSubmit) {
            this.form.addEventListener('submit', this.validateForm.bind(this));
        }
        
        if (this.options.validateOnBlur) {
            this.setupBlurValidation();
        }
        
        if (this.options.validateOnInput) {
            this.setupInputValidation();
        }
    }
    
    setupValidationAttributes() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Add ARIA attributes
            if (!input.hasAttribute('aria-describedby')) {
                const errorId = `${input.id}-error` || `${input.name}-error`;
                input.setAttribute('aria-describedby', errorId);
            }
            
            // Add validation classes based on type
            if (input.type === 'email') {
                input.setAttribute('data-validate', 'email');
            }
            
            if (input.hasAttribute('required')) {
                input.setAttribute('data-validate', 'required');
            }
            
            if (input.type === 'password') {
                input.setAttribute('data-validate', 'password');
            }
            
            if (input.hasAttribute('minlength')) {
                input.setAttribute('data-validate', 'minlength');
            }
            
            if (input.hasAttribute('maxlength')) {
                input.setAttribute('data-validate', 'maxlength');
            }
        });
    }
    
    setupBlurValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }
    
    setupInputValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });
    }
    
    validateForm(e) {
        if (e) {
            e.preventDefault();
        }
        
        this.errors = {};
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            const fieldValid = this.validateField(input);
            if (!fieldValid) {
                isValid = false;
                
                if (this.options.scrollToError) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    input.focus();
                    return; // Stop at first error for scrolling
                }
            }
        });
        
        if (isValid) {
            // Remove error styles
            this.clearAllErrors();
            
            // Submit form
            if (e && this.form.reportValidity) {
                this.form.submit();
            }
            
            return true;
        }
        
        return false;
    }
    
    validateField(input) {
        const value = input.value.trim();
        const name = input.name || input.id;
        const type = input.type;
        const rules = input.getAttribute('data-validate') || '';
        
        // Clear previous error
        this.clearError(input);
        
        // Required validation
        if (rules.includes('required') && !value) {
            this.addError(input, 'This field is required');
            return false;
        }
        
        // Email validation
        if (rules.includes('email') && value && !this.isValidEmail(value)) {
            this.addError(input, 'Please enter a valid email address');
            return false;
        }
        
        // Password validation
        if (rules.includes('password') && value) {
            const passwordValidation = this.validatePassword(value);
            if (!passwordValidation.isValid) {
                this.addError(input, passwordValidation.issues[0]);
                return false;
            }
        }
        
        // Min length validation
        if (rules.includes('minlength')) {
            const minLength = parseInt(input.getAttribute('minlength')) || 0;
            if (value.length < minLength) {
                this.addError(input, `Minimum ${minLength} characters required`);
                return false;
            }
        }
        
        // Max length validation
        if (rules.includes('maxlength')) {
            const maxLength = parseInt(input.getAttribute('maxlength')) || 255;
            if (value.length > maxLength) {
                this.addError(input, `Maximum ${maxLength} characters allowed`);
                return false;
            }
        }
        
        // URL validation
        if (type === 'url' && value && !this.isValidUrl(value)) {
            this.addError(input, 'Please enter a valid URL');
            return false;
        }
        
        // Phone validation
        if (type === 'tel' && value && !this.isValidPhone(value)) {
            this.addError(input, 'Please enter a valid phone number');
            return false;
        }
        
        // Number validation
        if (type === 'number') {
            const min = parseFloat(input.getAttribute('min'));
            const max = parseFloat(input.getAttribute('max'));
            
            if (!isNaN(min) && parseFloat(value) < min) {
                this.addError(input, `Minimum value is ${min}`);
                return false;
            }
            
            if (!isNaN(max) && parseFloat(value) > max) {
                this.addError(input, `Maximum value is ${max}`);
                return false;
            }
        }
        
        // Match validation (for confirm password, etc.)
        const matchField = input.getAttribute('data-match');
        if (matchField) {
            const matchInput = this.form.querySelector(`[name="${matchField}"]`);
            if (matchInput && value !== matchInput.value) {
                this.addError(input, 'Values do not match');
                return false;
            }
        }
        
        // Custom validation via data-validate
        const customValidation = input.getAttribute('data-validation');
        if (customValidation) {
            try {
                const validationFn = new Function('value', customValidation);
                const result = validationFn(value);
                if (result !== true) {
                    this.addError(input, result || 'Invalid value');
                    return false;
                }
            } catch (error) {
                console.error('Custom validation error:', error);
            }
        }
        
        // Mark as valid
        this.markValid(input);