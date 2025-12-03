const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class Security {
  /**
   * Generate secure random token
   */
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash string (for passwords, etc.)
   */
  static async hashString(str, rounds = 10) {
    return await bcrypt.hash(str, rounds);
  }

  /**
   * Compare hash with string
   */
  static async compareHash(str, hash) {
    return await bcrypt.compare(str, hash);
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>"'`;]/g, '') // Remove dangerous characters
      .substring(0, 5000); // Limit length
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      issues: [
        password.length < minLength && `Minimum ${minLength} characters`,
        !hasUpperCase && 'At least one uppercase letter',
        !hasLowerCase && 'At least one lowercase letter',
        !hasNumbers && 'At least one number',
        !hasSpecialChar && 'At least one special character'
      ].filter(Boolean)
    };
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token, sessionToken) {
    return token && sessionToken && token === sessionToken;
  }

  /**
   * Encrypt text (for sensitive data)
   */
  static encrypt(text, key = process.env.ENCRYPTION_KEY || 'default-key') {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt text
   */
  static decrypt(encryptedText, key = process.env.ENCRYPTION_KEY || 'default-key') {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Generate secure filename
   */
  static generateSecureFilename(originalName) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Prevent NoSQL injection
   */
  static sanitizeMongoQuery(query) {
    if (typeof query !== 'object' || query === null) return query;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMongoQuery(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(windowMs, maxRequests) {
    const requests = new Map();
    
    return (identifier) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old entries
      for (const [key, timestamp] of requests.entries()) {
        if (timestamp < windowStart) {
          requests.delete(key);
        }
      }
      
      // Count requests in current window
      const userRequests = Array.from(requests.entries())
        .filter(([key, timestamp]) => key.startsWith(identifier) && timestamp > windowStart)
        .length;
      
      if (userRequests >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      requests.set(`${identifier}-${now}`, now);
      return true; // Request allowed
    };
  }
}

module.exports = Security;