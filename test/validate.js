#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

function runHook(script, { env, input } = {}) {
  const result = spawnSync('node', [path.join(root, 'hooks', script)], {
    cwd: root,
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`exited ${result.status}: ${result.stderr}`);
  return result.stdout;
}

// --- Manifests ---
console.log('\nManifests');
const plugin = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin/plugin.json'), 'utf8'));
test('plugin.json: name', () => assert.ok(plugin.name));
test('plugin.json: version', () => assert.ok(plugin.version));
test('plugin.json: description', () => assert.ok(plugin.description));
test('plugin.json: SessionStart hook', () => assert.ok(plugin.hooks?.SessionStart));
test('plugin.json: UserPromptSubmit hook', () => assert.ok(plugin.hooks?.UserPromptSubmit));

const market = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin/marketplace.json'), 'utf8'));
test('marketplace.json: name', () => assert.ok(market.name));
test('marketplace.json: plugins array', () => assert.ok(Array.isArray(market.plugins) && market.plugins.length > 0));
test('marketplace.json: source repo', () => assert.ok(market.plugins[0]?.source?.repo));

// --- Character coverage ---
console.log('\nCharacters');
const { VALID_CHARACTERS } = require(path.join(root, 'hooks/character-config'));
const characters = VALID_CHARACTERS.filter(c => c !== 'off');

for (const char of characters) {
  const file = path.join(root, 'characters', `${char}.md`);
  test(`${char}.md exists`, () => assert.ok(fs.existsSync(file), `missing: ${file}`));
  if (fs.existsSync(file)) {
    test(`${char}.md has frontmatter`, () =>
      assert.ok(fs.readFileSync(file, 'utf8').startsWith('---'), 'missing frontmatter'));
  }
}

// --- Commands ---
console.log('\nCommands');
for (const cmd of ['set.md', 'off.md', 'list.md']) {
  const file = path.join(root, 'commands', cmd);
  test(`${cmd} exists`, () => assert.ok(fs.existsSync(file)));
  if (fs.existsSync(file)) {
    test(`${cmd} has frontmatter`, () =>
      assert.ok(fs.readFileSync(file, 'utf8').startsWith('---'), 'missing frontmatter'));
  }
}

// --- Skill ---
console.log('\nSkills');
test('skills/character/SKILL.md exists', () =>
  assert.ok(fs.existsSync(path.join(root, 'skills/character/SKILL.md'))));

// --- Hooks ---
console.log('\nHooks');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chars-ci-'));

try {
  test('character-activate: exits cleanly with no active character', () => {
    const out = runHook('character-activate.js', { env: { CLAUDE_CONFIG_DIR: tmpDir } }).trim();
    assert.strictEqual(out, '');
  });

  test('character-tracker: activates character and emits context', () => {
    const out = runHook('character-tracker.js', {
      env: { CLAUDE_CONFIG_DIR: tmpDir },
      input: JSON.stringify({ prompt: '/characters:set pirate' }),
    }).trim();
    const json = JSON.parse(out);
    assert.ok(
      json.hookSpecificOutput?.additionalContext?.includes('PIRATE'),
      'expected PIRATE in context'
    );
  });

  test('character-activate: injects character instructions after set', () => {
    const out = runHook('character-activate.js', { env: { CLAUDE_CONFIG_DIR: tmpDir } });
    assert.ok(out.includes('PIRATE'), 'expected character instructions in output');
  });

  test('character-tracker: deactivates on /characters:off', () => {
    runHook('character-tracker.js', {
      env: { CLAUDE_CONFIG_DIR: tmpDir },
      input: JSON.stringify({ prompt: '/characters:off' }),
    });
    const out = runHook('character-activate.js', { env: { CLAUDE_CONFIG_DIR: tmpDir } }).trim();
    assert.strictEqual(out, '', 'expected empty output after deactivation');
  });
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
