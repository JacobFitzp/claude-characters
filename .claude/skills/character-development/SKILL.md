---
name: character-development
description: >
  Add a new personality character to the Claude Characters plugin. Use when the user says
  "add a [character] character", "create a new character", "make a [personality] mode",
  or describes a speaking style they want Claude to adopt. Covers the full workflow:
  character file, hook whitelist, command list, skill table, and README.
---

You are adding a new personality character to the Claude Characters plugin. There are 5 places to update. Work through them in order.

Before starting, count the current number of characters:
```bash
ls characters/ | wc -l
```
You'll need this number + 1 for the badge update in Step 5.

## Step 1 — Create the character file

Create `characters/<name>.md` using this exact structure:

```markdown
---
name: <name>
tagline: <short description> — <signature catchphrase>
---

<One or two sentences setting the scene — who this character is and what flavour they bring.>

## Speaking Style

- **<Feature>**: list of vocab, grammar rules, catchphrases
- **Affirmations**: what they say for yes/agreement
- **Negation**: how they say no/disagree
- **Address**: what they call the user
- **Pronouns**: any non-standard pronoun usage
- **Intensifiers**: their power words
- **Exclamations**: their signature exclamations

## Example Translations

Show 5–6 before → after pairs covering common code situations:
- "The function is broken" → <character voice>
- "I found the bug" → <character voice>
- "Here's how to fix it" → <character voice>
- "Tests are passing" → <character voice>
- "This will delete your data" → <character voice> (must keep the warning clear)
- "I don't understand" → <character voice>

## Persistence

ACTIVE EVERY RESPONSE. [Instructions on how aggressively to hold the voice, and what a minimal reply looks like.]

## Boundaries

Code blocks: write normal. Technical terms: exact. Security warnings: plain English first, then resume character. Multi-step instructions: keep order clear, speak character between steps. Comments inside code: always plain English — no character voice.
```

**Quality bar**: the speaking style section must give enough vocabulary and grammar rules that the character is self-contained — no outside knowledge required to perform it accurately.

## Step 2 — Register in the hook whitelist

Open `hooks/character-config.js` and add the character name to the `VALID_CHARACTERS` array.

```js
// Before
const VALID_CHARACTERS = [
  'off', 'pirate', ..., 'conspiracy'
];

// After
const VALID_CHARACTERS = [
  'off', 'pirate', ..., 'conspiracy', '<name>'
];
```

This is a security whitelist — without it, the flag file validation will reject the character and activation will silently fail.

## Step 3 — Add to the list command

Open `commands/list.md` and append a row to the characters table:

```markdown
| <name> | <short personality description> — <catchphrase> |
```

Keep the catchphrase short (under 60 chars total for the cell). Match the tone of the existing rows.

## Step 4 — Add to the character skill

Open `skills/character/SKILL.md` and make two edits:

1. Add the character to the `description` frontmatter list (the comma-separated names on line 4–5).
2. Add a row to the **Available Characters** table:

```markdown
| `<name>` | <One-line voice summary> — "<short example quote>" |
```

## Step 5 — Add to README.md

Open `README.md` and make two edits:

**1. Append a row to the Characters table** under the `## Characters` section:

```markdown
| `<name>` | <Personality label> | *"<Sample quote in character voice>"* |
```

The sample quote should be a realistic one-liner — ideally one of the example translations from Step 1, showing the character at their most distinctive.

**2. Increment the characters badge count** in the badge row at the top of the file:

```markdown
[![Characters](https://img.shields.io/badge/characters-<new count>-22c55e?style=flat-square)](#characters)
```

Replace the number after `characters-` with the new total (current count + 1).

---

## Checklist

Before finishing, confirm all 5 are done:

- [ ] `characters/<name>.md` created with all four sections
- [ ] `hooks/character-config.js` — name added to `VALID_CHARACTERS`
- [ ] `commands/list.md` — row added to table
- [ ] `skills/character/SKILL.md` — name in description + row in table
- [ ] `README.md` — row added to Characters table + badge count incremented

Then confirm activation works: `/characters:set <name>`
