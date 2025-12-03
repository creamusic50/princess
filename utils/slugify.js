const slugify = require('slugify');

/**
 * Generate SEO-friendly slug from title
 */
exports.generateSlug = (title, uniqueId = null) => {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  // Add unique identifier if provided
  if (uniqueId) {
    return `${baseSlug}-${uniqueId}`;
  }
  
  // Add timestamp for uniqueness
  return `${baseSlug}-${Date.now().toString().slice(-6)}`;
};

/**
 * Validate if slug already exists
 */
exports.isSlugUnique = async (slug, postId = null) => {
  // This would check database
  // Implement based on your database setup
  return true;
};

/**
 * Clean string for SEO
 */
exports.cleanString = (str) => {
  return str
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^\w\s-]/g, '');
};