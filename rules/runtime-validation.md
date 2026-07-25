# Runtime State Validation Rules

## Overview

These rules ensure that audits check runtime state, not just code correctness.

## Core Principle

**Always verify file contents and settings values, not just code structure.**

## Validation Checklist

### 1. File Contents

- [ ] Check if files are empty
- [ ] Check if files contain only comments
- [ ] Check if files have expected structure
- [ ] Check for placeholder values

### 2. Settings Values

- [ ] Check for null values
- [ ] Check for empty strings
- [ ] Check for placeholder values ("—", "TODO", etc.)
- [ ] Check for zero values where non-zero expected

### 3. Directory Contents

- [ ] Check if directories are empty
- [ ] Check if directories contain expected files
- [ ] Check file sizes (too small = likely empty)
- [ ] Check file modification dates

### 4. Runtime State

- [ ] Verify file paths exist
- [ ] Verify file permissions
- [ ] Verify file accessibility
- [ ] Verify file encoding

## Common Issues

### Issue: Version Shows "—"

**Cause**: `installed_zapret2_version = null` in settings.json

**Fix**: 
```json
{
  "installed_zapret2_version": "2.0.0"
}
```

### Issue: Lua Files Empty

**Cause**: `mod_lua/` is empty, `lua/` has files

**Fix**: Copy files from `lua/` to `mod_lua/` or update file paths

### Issue: Lists Empty

**Cause**: Files contain only comments

**Fix**: Add actual entries to list files

### Issue: Toggle Mode Unclear

**Cause**: UX not documented

**Fix**: Add documentation explaining how to switch modes

## Audit Commands

### Check File Contents
```bash
# Check for empty files
find . -empty -type f

# Check for files with only comments
grep -r "^#" --include="*.txt" .
grep -r "^//" --include="*.ts" .
```

### Check Settings
```bash
# Check for null values
grep -r "null" --include="*.json" .

# Check for placeholder values
grep -r '"—"' --include="*.json" .
grep -r '"TODO"' --include="*.json" .
```

### Check Directories
```bash
# Check for empty directories
find . -type d -empty

# Check directory sizes
du -sh */
```

## Integration

This rule works with:
- `runtime-state-validator.ts` hook
- `config-validator.ts` hook
- `error-audit` skill

## Example Usage

Before committing:
1. Run `find . -empty -type f` to find empty files
2. Run `grep -r "null" --include="*.json" .` to find null settings
3. Verify all placeholder values are replaced
4. Check directory contents match expectations
