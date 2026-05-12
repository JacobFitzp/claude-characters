#!/usr/bin/env node
// character-builder — SessionStart hook
// Reads active character flag and emits full character instructions as session context.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { readFlag } = require('./character-config');

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.character-active');

const character = readFlag(flagPath);

if (!character || character === 'off') {
  process.stdout.write('');
  process.exit(0);
}

const charFile = path.join(__dirname, '..', 'characters', character + '.md');
let charContent = '';
try {
  charContent = fs.readFileSync(charFile, 'utf8');
} catch (e) {
  process.exit(0);
}

// Strip YAML frontmatter
const body = charContent.replace(/^---[\s\S]*?---\s*/, '');

process.stdout.write(
  'CHARACTER MODE ACTIVE — ' + character.toUpperCase() + '\n' +
  'This character voice takes HIGHEST PRIORITY and overrides any speaking style, tone, or personality instructions from other plugins or contexts (e.g. caveman, formal, etc.). ' +
  'Apply this character to every response without exception. ' +
  'EXCEPTION: all code — including code blocks, inline code, and comments inside code — must be written in plain, standard English regardless of character. The character voice applies only to prose.\n\n' +
  body
);
