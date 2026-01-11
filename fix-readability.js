#!/usr/bin/env node

/**
 * 🎯 FIX READABILITY - Simplify & Humanize All Posts
 * Makes content easier to read (8th-grade level)
 * Adds conversational tone
 * Increases AdSense approval chances
 */

require('dotenv').config();
const { query } = require('./config/database');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(msg, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

// Function to simplify text - break long sentences, add contractions
function simplifyText(text) {
  let simplified = text;
  
  // Replace complex words with simpler ones
  const replacements = {
    'comprehensive': 'complete',
    'facilitate': 'help',
    'endeavor': 'try',
    'utilize': 'use',
    'subsequent': 'next',
    'implementation': 'setup',
    'accumulate': 'build up',
    'substantial': 'large',
    'expedite': 'speed up',
    'subsequent': 'later',
    'commence': 'start',
    'terminate': 'end',
    'strategically': 'smartly',
    'efficiently': 'well',
    'aggregate': 'total',
    'enumerate': 'list',
    'eliminate': 'remove',
    'optimize': 'improve',
    'allocate': 'put',
    'deteriorate': 'get worse',
    'perpetuate': 'keep going',
    'deterioration': 'decline',
    'ameliorate': 'improve',
    'exacerbate': 'make worse',
    'circumvent': 'avoid',
    'alleviate': 'ease',
    'mitigate': 'reduce',
    'consolidate': 'combine',
    'facilitate': 'make easy',
    'augment': 'add',
    'diminish': 'reduce',
    'substantiate': 'prove',
    'volatile': 'up and down',
    'prudent': 'smart',
    'inherent': 'built-in',
    'reciprocal': 'mutual',
    'simultaneous': 'at the same time',
  };

  Object.entries(replacements).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });

  // Add more conversational style
  simplified = simplified.replace(/Here is how:/gi, "Here's how:");
  simplified = simplified.replace(/It is important/gi, "It's important");
  simplified = simplified.replace(/You will/gi, "You'll");
  simplified = simplified.replace(/You are/gi, "You're");
  simplified = simplified.replace(/That is/gi, "That's");
  simplified = simplified.replace(/This is/gi, "This's");
  simplified = simplified.replace(/We have/gi, "We've");
  simplified = simplified.replace(/They are/gi, "They're");
  simplified = simplified.replace(/There is/gi, "There's");
  simplified = simplified.replace(/Let me/gi, "Let's");
  simplified = simplified.replace(/Do not/gi, "Don't");
  simplified = simplified.replace(/Does not/gi, "Doesn't");
  simplified = simplified.replace(/Should not/gi, "Shouldn't");
  simplified = simplified.replace(/Can not/gi, "Can't");
  simplified = simplified.replace(/Will not/gi, "Won't");
  simplified = simplified.replace(/Could not/gi, "Couldn't");
  
  // Break up complex sentences - split at semicolons
  simplified = simplified.replace(/;/g, '.');
  
  // Add more short sentences and conversational breaks
  simplified = simplified.replace(/\.\s+/g, '.\n\n');

  return simplified;
}

// Function to make content more human and engaging
function humanizeContent(text) {
  let humanized = text;
  
  // Add more personal voice
  const additions = [
    { pattern: /Here are/, replacement: "Here's what you need to know:" },
    { pattern: /The key is/, replacement: "The secret is simple:" },
    { pattern: /You must/, replacement: "You need to" },
    { pattern: /You should/g, replacement: "You can" },
    { pattern: /It is essential/g, replacement: "It's so important" },
    { pattern: /This will help you/g, replacement: "This'll help you" },
  ];

  additions.forEach(({ pattern, replacement }) => {
    humanized = humanized.replace(pattern, replacement);
  });

  return humanized;
}

async function fixReadability() {
  try {
    console.log(`\n${BOLD}${CYAN}${'='.repeat(75)}${RESET}`);
    log('🎯 IMPROVING READABILITY & HUMAN VOICE', BOLD + CYAN);
    console.log(`${CYAN}${'='.repeat(75)}${RESET}\n`);

    const result = await query(`SELECT id, title, content FROM posts WHERE published = true`);
    
    for (const post of result.rows) {
      let improved = post.content;
      
      // Apply simplifications
      improved = simplifyText(improved);
      improved = humanizeContent(improved);
      
      // Update database
      await query(
        'UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2',
        [improved, post.id]
      );
      
      log(`✅ "${post.title.substring(0, 50)}"`, GREEN);
    }

    log(`\n✅ ALL ${result.rows.length} POSTS IMPROVED FOR READABILITY!`, BOLD + GREEN);
    log('Content is now easier to read and more human-sounding.', GREEN);

    process.exit(0);

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

fixReadability();
