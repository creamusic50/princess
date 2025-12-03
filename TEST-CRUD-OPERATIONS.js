#!/usr/bin/env node

/**
 * ================================================================
 * CRUD OPERATIONS TEST SCRIPT
 * ================================================================
 * This script tests all CRUD operations for the finance blog:
 * - CREATE: New post creation
 * - READ: Get posts, get single post
 * - UPDATE: Edit existing post
 * - DELETE: Remove post
 * ================================================================
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;
let authToken = '';
let testPostId = '';
let testPostSlug = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}\n${colors.blue}${msg}${colors.reset}\n${colors.blue}${'='.repeat(60)}${colors.reset}\n`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Helper to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Step 1: Login to get authentication token
 */
async function testLogin() {
  log.header('STEP 1: AUTHENTICATION TEST');
  
  try {
    log.info('Attempting login...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: process.env.ADMIN_EMAIL || 'admin@smartmoneyguide.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123'
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log.success('Login successful!');
      log.info(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      log.error('Login failed: No token received');
      return false;
    }
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Step 2: CREATE - Test creating a new post
 */
async function testCreatePost() {
  log.header('STEP 2: CREATE POST TEST');
  
  try {
    log.info('Creating new test post...');
    
    const postData = {
      title: `Test Post - ${new Date().toISOString()}`,
      category: 'investing',
      excerpt: 'This is a test post excerpt for CRUD testing',
      content: `<h2>Introduction</h2>
                <p>This is a comprehensive test article with over 1000 words to ensure proper validation.</p>
                ${Array(50).fill('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>').join('\n')}
                <h2>Conclusion</h2>
                <p>This completes our test article with sufficient word count.</p>`,
      published: true,
      meta_description: 'Test meta description',
      keywords: 'test, crud, finance, blog'
    };
    
    const response = await axios.post(`${BASE_URL}/posts`, postData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && response.data.post) {
      testPostId = response.data.post.id;
      testPostSlug = response.data.post.slug;
      log.success('Post created successfully!');
      log.info(`Post ID: ${testPostId}`);
      log.info(`Post Slug: ${testPostSlug}`);
      log.info(`Title: ${response.data.post.title}`);
      return true;
    } else {
      log.error('Post creation failed: No post data received');
      return false;
    }
  } catch (error) {
    log.error(`Post creation failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => log.error(`  - ${err.msg}`));
    }
    return false;
  }
}

/**
 * Step 3: READ - Test getting all posts
 */
async function testGetAllPosts() {
  log.header('STEP 3: READ ALL POSTS TEST');
  
  try {
    log.info('Fetching all posts...');
    
    const response = await axios.get(`${BASE_URL}/posts?page=1&limit=10`);
    
    if (response.data.success && Array.isArray(response.data.posts)) {
      log.success(`Retrieved ${response.data.posts.length} posts`);
      log.info(`Total posts: ${response.data.total}`);
      log.info(`Total pages: ${response.data.totalPages}`);
      log.info(`Current page: ${response.data.currentPage}`);
      
      if (response.data.posts.length > 0) {
        log.info('\nFirst post:');
        log.info(`  - ID: ${response.data.posts[0].id}`);
        log.info(`  - Title: ${response.data.posts[0].title}`);
        log.info(`  - Category: ${response.data.posts[0].category}`);
      }
      
      return true;
    } else {
      log.error('Failed to get posts: Invalid response format');
      return false;
    }
  } catch (error) {
    log.error(`Get all posts failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Step 4: READ - Test getting single post by slug
 */
async function testGetSinglePost() {
  log.header('STEP 4: READ SINGLE POST TEST');
  
  if (!testPostSlug) {
    log.warning('Skipping test: No test post slug available');
    return false;
  }
  
  try {
    log.info(`Fetching post by slug: ${testPostSlug}`);
    
    const response = await axios.get(`${BASE_URL}/posts/${testPostSlug}`);
    
    if (response.data.success && response.data.post) {
      log.success('Post retrieved successfully!');
      log.info(`Title: ${response.data.post.title}`);
      log.info(`Category: ${response.data.post.category}`);
      log.info(`Views: ${response.data.post.views}`);
      log.info(`Published: ${response.data.post.published ? 'Yes' : 'No'}`);
      log.info(`Created: ${new Date(response.data.post.created_at).toLocaleDateString()}`);
      return true;
    } else {
      log.error('Failed to get post: No post data received');
      return false;
    }
  } catch (error) {
    log.error(`Get single post failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Step 5: UPDATE - Test updating an existing post
 */
async function testUpdatePost() {
  log.header('STEP 5: UPDATE POST TEST');
  
  if (!testPostId) {
    log.warning('Skipping test: No test post ID available');
    return false;
  }
  
  try {
    log.info(`Updating post ID: ${testPostId}`);
    
    const updateData = {
      title: `Updated Test Post - ${new Date().toISOString()}`,
      content: `<h2>Updated Content</h2>
                <p>This post has been updated to test the UPDATE operation.</p>
                ${Array(50).fill('<p>Updated Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>').join('\n')}`,
      published: true
    };
    
    const response = await axios.put(`${BASE_URL}/posts/${testPostId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && response.data.post) {
      log.success('Post updated successfully!');
      log.info(`New Title: ${response.data.post.title}`);
      log.info(`Updated At: ${new Date(response.data.post.updated_at).toLocaleString()}`);
      return true;
    } else {
      log.error('Post update failed: No post data received');
      return false;
    }
  } catch (error) {
    log.error(`Post update failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Step 6: DELETE - Test deleting a post
 */
async function testDeletePost() {
  log.header('STEP 6: DELETE POST TEST');
  
  if (!testPostId) {
    log.warning('Skipping test: No test post ID available');
    return false;
  }
  
  try {
    log.info(`Deleting post ID: ${testPostId}`);
    
    const response = await axios.delete(`${BASE_URL}/posts/${testPostId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      log.success('Post deleted successfully!');
      log.info(`Message: ${response.data.message}`);
      return true;
    } else {
      log.error('Post deletion failed');
      return false;
    }
  } catch (error) {
    log.error(`Post deletion failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Step 7: Verify deletion
 */
async function testVerifyDeletion() {
  log.header('STEP 7: VERIFY DELETION TEST');
  
  if (!testPostSlug) {
    log.warning('Skipping test: No test post slug available');
    return false;
  }
  
  try {
    log.info(`Attempting to fetch deleted post: ${testPostSlug}`);
    
    const response = await axios.get(`${BASE_URL}/posts/${testPostSlug}`);
    
    // If we get here, post still exists (shouldn't happen)
    log.error('Post still exists after deletion!');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      log.success('Verification passed: Post is deleted (404)');
      return true;
    } else {
      log.error(`Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n');
  log.header('🚀 FINANCE BLOG - CRUD OPERATIONS TEST SUITE');
  log.info(`Testing API at: ${BASE_URL}`);
  log.info(`Started at: ${new Date().toLocaleString()}`);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Run all tests sequentially
  const tests = [
    { name: 'Authentication', fn: testLogin },
    { name: 'Create Post', fn: testCreatePost },
    { name: 'Get All Posts', fn: testGetAllPosts },
    { name: 'Get Single Post', fn: testGetSinglePost },
    { name: 'Update Post', fn: testUpdatePost },
    { name: 'Delete Post', fn: testDeletePost },
    { name: 'Verify Deletion', fn: testVerifyDeletion }
  ];
  
  for (const test of tests) {
    const passed = await test.fn();
    results.tests.push({ name: test.name, passed });
    
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    await sleep(1000); // Wait 1 second between tests
  }
  
  // Print summary
  log.header('📊 TEST SUMMARY');
  log.info(`Total Tests: ${results.tests.length}`);
  log.success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed}`);
  }
  
  console.log('\n📋 Test Results:');
  results.tests.forEach((test, index) => {
    const status = test.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`  ${index + 1}. ${test.name}: ${status}`);
  });
  
  log.header('✅ TEST SUITE COMPLETED');
  log.info(`Finished at: ${new Date().toLocaleString()}`);
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    log.success('Server is running and healthy!');
    return true;
  } catch (error) {
    log.error('Server is not responding!');
    log.warning('Please start the server first using: npm start');
    process.exit(1);
  }
}

// Run the tests
(async () => {
  await checkServer();
  await runAllTests();
})();
