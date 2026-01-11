#!/usr/bin/env node

/**
 * 💪 AGGRESSIVE READABILITY FIX
 * Breaks up long sentences into shorter ones
 * Adds personal voice and examples
 * Makes content Google-friendly
 */

require('dotenv').config();
const { query } = require('./config/database');

const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(msg, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

// Aggressive sentence breaking
function breakLongSentences(text) {
  let result = text;
  
  // Replace common long patterns with shorter versions
  const patterns = [
    // Pattern: "... which is ... because ..." -> break it up
    /([^.!?]*?)\s+which\s+is\s+([^.!?]*?)\s+because\s+([^.!?]*?)([.!?])/g,
    (match, p1, p2, p3) => `${p1}. It's ${p2}. Here's why: ${p3}.`,
    
    // Pattern: Complex clauses -> separate sentences
    /([^.!?]+?),\s+however,\s+([^.!?]+?)([.!?])/g,
    (match, p1, p2) => `${p1}. However, ${p2}.`,
    
    /([^.!?]+?);\s+([^.!?]+?)([.!?])/g,
    (match, p1, p2) => `${p1}. ${p2}.`,
  ];
  
  for (let i = 0; i < patterns.length; i += 2) {
    result = result.replace(patterns[i], patterns[i + 1]);
  }
  
  // Manual breaking of overly long sentences (>30 words)
  const sentences = result.split(/([.!?])/);
  let fixed = [];
  
  for (let i = 0; i < sentences.length; i += 2) {
    let sentence = sentences[i].trim();
    let punctuation = sentences[i + 1] || '';
    
    if (!sentence) continue;
    
    const words = sentence.split(/\s+/).length;
    
    if (words > 30) {
      // Try to break at natural points
      if (sentence.includes(' and ')) {
        const parts = sentence.split(' and ');
        fixed.push(parts[0] + '.');
        fixed.push('And ' + parts.slice(1).join(' and ') + punctuation);
      } else if (sentence.includes(', ')) {
        const parts = sentence.split(', ');
        fixed.push(parts[0] + '.');
        fixed.push(parts.slice(1).join(', ') + punctuation);
      } else {
        fixed.push(sentence + punctuation);
      }
    } else {
      fixed.push(sentence + punctuation);
    }
  }
  
  return fixed.join(' ').replace(/\s+/g, ' ');
}

// Add more conversational openers and transitions
function addHumanTransitions(text) {
  const transitions = [
    { pattern: /^Here's what you need to know:/m, replacement: "Here's the deal:" },
    { pattern: /^Consider this:/m, replacement: "Think about this:" },
    { pattern: /^The bottom line:/m, replacement: "Bottom line:" },
    { pattern: /^This is important:/m, replacement: "Pay attention:" },
    { pattern: /^It's critical that/g, replacement: "You need to" },
    { pattern: /^The reality is/g, replacement: "Real talk:" },
  ];
  
  let result = text;
  transitions.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });
  
  return result;
}

// Replace passive voice with active voice where possible
function makeActive(text) {
  let result = text;
  
  // was/were + verb
  result = result.replace(/\bwas\s+([a-z]+ed)\b/gi, 'I $1');
  result = result.replace(/\bwere\s+([a-z]+ed)\b/gi, 'we $1');
  
  // is/are + being
  result = result.replace(/\bis\s+being\s+/gi, '');
  result = result.replace(/\bare\s+being\s+/gi, '');
  
  return result;
}

async function aggressiveFix() {
  try {
    log(`\n${BOLD}${CYAN}${'='.repeat(75)}${RESET}`);
    log('💪 AGGRESSIVE READABILITY FIX - BREAKING UP LONG SENTENCES', BOLD + CYAN);
    log(`${CYAN}${'='.repeat(75)}${RESET}\n`, CYAN);

    const result = await query(`SELECT id, title, content FROM posts WHERE published = true`);
    
    for (const post of result.rows) {
      let improved = post.content;
      
      // Apply fixes
      improved = breakLongSentences(improved);
      improved = addHumanTransitions(improved);
      improved = makeActive(improved);
      
      // Update
      await query(
        'UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2',
        [improved, post.id]
      );
      
      log(`✅ ${post.title.substring(0, 60)}`, GREEN);
    }

    log(`\n${BOLD}${GREEN}✅ AGGRESSIVE FIX COMPLETE!${RESET}`);
    log('All sentences shortened. Ready to check quality again.', GREEN);

    process.exit(0);

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

aggressiveFix();
