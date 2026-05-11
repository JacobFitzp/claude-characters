#!/usr/bin/env node
// character-builder — UserPromptSubmit hook
// Watches for /character commands, updates flag file, emits per-turn context reminder.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { VALID_CHARACTERS, safeWriteFlag, readFlag } = require('./character-config');

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.character-active');

// Read tagline from character file for compact per-turn context
function getTagline(character) {
  try {
    const charFile = path.join(__dirname, '..', 'characters', character + '.md');
    const content = fs.readFileSync(charFile, 'utf8');
    const match = content.match(/^---[\s\S]*?tagline:\s*["']?(.+?)["']?\n/m);
    return match ? match[1].trim() : character.toUpperCase();
  } catch (e) {
    return character.toUpperCase();
  }
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim();
    const lower = prompt.toLowerCase();

    // Handle /character commands
    if (lower.startsWith('/character')) {
      const parts = lower.split(/\s+/);
      const arg = parts[1] || '';

      if (arg === 'off' || arg === 'none' || arg === 'normal') {
        try { fs.unlinkSync(flagPath); } catch (e) {}
      } else if (arg === 'list') {
        // No flag change needed — command handler shows the list
      } else if (VALID_CHARACTERS.includes(arg) && arg !== 'off') {
        safeWriteFlag(flagPath, arg);
      }
    }

    // Natural language deactivation
    if (/\b(stop|disable|deactivate|turn off)\b.*\bcharacter\b/i.test(prompt) ||
        /\bnormal mode\b/i.test(prompt)) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }

    // Per-turn reinforcement — keeps character active across context compression
    const active = readFlag(flagPath);
    if (active && active !== 'off') {
      const tagline = getTagline(active);
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext:
            'CHARACTER MODE ACTIVE — ' + active.toUpperCase() + ': ' + tagline + '. ' +
            'Maintain this character\'s speaking style in every response. ' +
            'Code blocks, technical terms, and security warnings: write normal. ' +
            'Resume character voice immediately after any plain-language section.'
        }
      }));
    }
  } catch (e) {
    // Silent fail — never block user prompt
  }
});
