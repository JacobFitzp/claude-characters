#!/usr/bin/env node
// character-builder — shared config and safe flag file utilities

const fs = require('fs');
const path = require('path');
const os = require('os');

const VALID_CHARACTERS = [
  'off', 'pirate', 'gangster', 'shakespeare', 'surfer', 'cowboy',
  'butler', 'yoda', 'noir', 'robot', 'chef',
  'sergeant', 'naturalist', 'therapist', 'commentator', 'conspiracy', 'cockney',
  'wizard', 'infomercial', 'australian', 'corporate', 'peasant'
];

const MAX_FLAG_BYTES = 64;

// Symlink-safe atomic write. Refuses symlinks at target and immediate parent.
function safeWriteFlag(flagPath, content) {
  try {
    const flagDir = path.dirname(flagPath);
    fs.mkdirSync(flagDir, { recursive: true });

    try {
      if (fs.lstatSync(flagDir).isSymbolicLink()) return;
    } catch (e) { return; }

    try {
      if (fs.lstatSync(flagPath).isSymbolicLink()) return;
    } catch (e) {
      if (e.code !== 'ENOENT') return;
    }

    const tempPath = path.join(flagDir, `.character-active.${process.pid}.${Date.now()}`);
    const O_NOFOLLOW = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
    const openFlags = fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | O_NOFOLLOW;
    let fd;
    try {
      fd = fs.openSync(tempPath, openFlags, 0o600);
      fs.writeSync(fd, String(content));
      try { fs.fchmodSync(fd, 0o600); } catch (e) {}
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
    }
    fs.renameSync(tempPath, flagPath);
  } catch (e) {}
}

// Symlink-safe, size-capped, whitelist-validated flag read. Returns null on any anomaly.
function readFlag(flagPath) {
  try {
    let st;
    try {
      st = fs.lstatSync(flagPath);
    } catch (e) { return null; }

    if (st.isSymbolicLink() || !st.isFile()) return null;
    if (st.size > MAX_FLAG_BYTES) return null;

    const O_NOFOLLOW = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
    const openFlags = fs.constants.O_RDONLY | O_NOFOLLOW;
    let fd, out;
    try {
      fd = fs.openSync(flagPath, openFlags);
      const buf = Buffer.alloc(MAX_FLAG_BYTES);
      const n = fs.readSync(fd, buf, 0, MAX_FLAG_BYTES, 0);
      out = buf.slice(0, n).toString('utf8');
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
    }

    const raw = out.trim().toLowerCase();
    if (!VALID_CHARACTERS.includes(raw)) return null;
    return raw;
  } catch (e) { return null; }
}

module.exports = { VALID_CHARACTERS, safeWriteFlag, readFlag };
