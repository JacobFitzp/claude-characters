# Character Builder

![Character Builder](banner.svg)

[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-7c3aed?style=flat-square)](https://claude.ai/code)
[![License](https://img.shields.io/badge/license-MIT-f97316?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/JacobFitzp/claude-character-builder?style=flat-square&color=484f58)](https://github.com/JacobFitzp/claude-character-builder/stargazers)

Personality characters for Claude Code. Toggle a character and every response comes in that voice — full technical accuracy preserved, just with a lot more *arr* (or *forsooth*, or *PROCESSING*).

## Characters

| Character | Personality | Sample |
|-----------|-------------|--------|
| `pirate` | Salty sea buccaneer | *"Arrr, this function be broken, matey!"* |
| `gangster` | Hip-hop street energy | *"Yo fam, this bug deadass not workin'. No cap."* |
| `shakespeare` | Elizabethan bard | *"Forsooth! Thy function doth fail most grievously!"* |
| `surfer` | California surfer dude | *"Duuude, this bug is totally gnarly bro!"* |
| `cowboy` | Wild West gunslinger | *"Reckon I've wrangled that varmint, pardner."* |
| `butler` | Stuffy British butler | *"If I may, sir — a minor irregularity has been detected."* |
| `yoda` | Wise Jedi Master | *"Broken, this function is. Fix it, you must."* |
| `noir` | Hardboiled detective | *"There it was. Line 42. Hiding in the shadows."* |
| `robot` | Cold mechanical AI | *"[ERROR DETECTED] FUNCTION STATUS: NON-OPERATIONAL."* |
| `chef` | Gordon Ramsay-style chef | *"This code is RAW! Come ON!"* |

## Install

**From GitHub** (recommended):
```bash
/plugin marketplace add JacobFitzp/claude-character-builder
/plugin install character-builder@JacobFitzp/claude-character-builder
```

**Locally** (development / offline):
```bash
git clone https://github.com/JacobFitzp/claude-character-builder
claude --plugin-dir ./claude-character-builder
```

## Usage

```
/character pirate       # Activate a character
/character off          # Back to normal
/character list         # Show all characters with descriptions
```

Characters persist across sessions. The active character survives context compression and long conversations.

You can also trigger characters naturally — say "talk like a pirate" or "respond like Yoda" and the skill activates automatically.

## How It Works

A flag file at `~/.claude/.character-active` stores the active character name. Two hooks fire on every session:

- **SessionStart** — reads the flag and injects the full character ruleset into session context
- **UserPromptSubmit** — watches for `/character` commands, updates the flag, and sends a compact per-turn reminder to keep the character from drifting

Each character is defined in `characters/<name>.md` — a markdown file with speaking rules, vocabulary, metaphors, example translations, and boundary conditions (code blocks, security warnings, and destructive operations always get plain language).

## Adding Characters

Drop a new file in `characters/`. Register the name in the `VALID_CHARACTERS` array in `hooks/character-config.js`. That's it.

Character files follow this structure:

```markdown
---
name: yourcharacter
tagline: One-line summary shown in per-turn context reminders
---

## Speaking Style
[vocabulary, grammar rules, catchphrases]

## Example Translations
[before → after examples for common code situations]

## Persistence
[how aggressively to maintain the voice]

## Boundaries
[what stays plain — code, security warnings, destructive ops]
```

## Notes

- Code blocks are always written normally — characters don't touch syntax
- Technical terms stay exact regardless of character
- Security warnings and destructive operation confirmations use plain language first, then resume character voice
- `/character off` or saying "normal mode" deactivates

---

Built for [Claude Code](https://claude.ai/code).
