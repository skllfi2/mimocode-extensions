# Comprehensive Validation Rules

## Overview

These rules cover all categories of issues that code audits typically miss.

## 1. Runtime State Validation

### File Contents
- [ ] Check if files are empty
- [ ] Check if files contain only comments
- [ ] Check if files have expected structure
- [ ] Check for placeholder values

### Settings Values
- [ ] Check for null values
- [ ] Check for empty strings
- [ ] Check for placeholder values ("—", "TODO", etc.)
- [ ] Check for zero values where non-zero expected

### Directory Contents
- [ ] Check if directories are empty
- [ ] Check if directories contain expected files
- [ ] Check file sizes (too small = likely empty)
- [ ] Check file modification dates

## 2. Component Integration

### DI Chains
- [ ] Verify each service is registered
- [ ] Check for circular dependencies
- [ ] Verify singleton vs transient usage
- [ ] Check for missing dependencies

### Event Handlers
- [ ] Verify subscription/unsubscription pairs
- [ ] Check for memory leaks
- [ ] Verify Unloaded handlers
- [ ] Check for duplicate subscriptions

### DispatcherQueue
- [ ] Verify UI updates on UI thread
- [ ] Check for deadlocks
- [ ] Verify async patterns
- [ ] Check for race conditions

## 3. Performance

### Blocking UI
- [ ] Check for Task.Delay in loops
- [ ] Check for synchronous operations in async methods
- [ ] Verify non-blocking patterns
- [ ] Check for UI thread usage

### Memory
- [ ] Check for large object allocations
- [ ] Verify disposal of resources
- [ ] Check for memory leaks
- [ ] Verify streaming patterns

### Async Patterns
- [ ] Check for async void outside Page/Window
- [ ] Verify proper async/await usage
- [ ] Check for deadlock patterns
- [ ] Verify cancellation token usage

## 4. Error Handling

### Silent Failures
- [ ] Check for empty catch blocks
- [ ] Verify exception logging
- [ ] Check for swallowed exceptions
- [ ] Verify proper rethrowing

### Timeouts
- [ ] Check for HTTP requests without timeout
- [ ] Verify cancellation tokens
- [ ] Check for long-running operations
- [ ] Verify timeout handling

### Retry Logic
- [ ] Check for network operations without retry
- [ ] Verify retry policies
- [ ] Check for exponential backoff
- [ ] Verify max retry limits

## 5. Thread Safety

### Concurrent Access
- [ ] Check for shared mutable state
- [ ] Verify thread-safe collections
- [ ] Check for lock usage
- [ ] Verify atomic operations

### Race Conditions
- [ ] Check for check-then-act patterns
- [ ] Verify proper synchronization
- [ ] Check for async race conditions
- [ ] Verify proper ordering

### Lock Usage
- [ ] Check for consistent lock ordering
- [ ] Verify lock scope
- [ ] Check for deadlock potential
- [ ] Verify try/finally patterns

## 6. Platform Issues

### WinDivert
- [ ] Verify admin privileges
- [ ] Check driver signature
- [ ] Verify compatibility
- [ ] Check for conflicts

### Paths
- [ ] Check for spaces in paths
- [ ] Verify ASCII-only paths
- [ ] Check for special characters
- [ ] Verify path length

### Antivirus
- [ ] Check for DLL blocking
- [ ] Verify EXE signing
- [ ] Check for false positives
- [ ] Verify exceptions

### Permissions
- [ ] Check file permissions
- [ ] Verify registry access
- [ ] Check for elevation
- [ ] Verify access rights

## 7. UX Issues

### Feedback
- [ ] Check for user feedback on actions
- [ ] Verify Toast/Dialog usage
- [ ] Check for status updates
- [ ] Verify completion messages

### Progress
- [ ] Check for loading indicators
- [ ] Verify progress bars
- [ ] Check for indeterminate states
- [ ] Verify cancel options

### Confirmation
- [ ] Check for destructive action confirmation
- [ ] Verify ContentDialog usage
- [ ] Check for undo capabilities
- [ ] Verify backup options

### Error Messages
- [ ] Check for user-friendly messages
- [ ] Verify error recovery options
- [ ] Check for help links
- [ ] Verify contact information

## Quick Reference

### Before Committing
1. Run runtime state checks
2. Verify component integration
3. Check performance patterns
4. Review error handling
5. Validate thread safety
6. Check platform issues
7. Review UX patterns

### During Code Review
1. Check all validation categories
2. Verify test coverage
3. Review documentation
4. Check security implications
5. Verify accessibility
