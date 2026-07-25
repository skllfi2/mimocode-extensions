#!/usr/bin/env node

/**
 * MiMoCode Extensions Test Suite
 * 
 * Runs basic validation tests for the extensions.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// Test results
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertFileExists(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  assert(fs.existsSync(fullPath), `File not found: ${filePath}`);
}

function assertDirectoryExists(dirPath) {
  const fullPath = path.join(ROOT_DIR, dirPath);
  assert(fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory(), `Directory not found: ${dirPath}`);
}

// Run tests
console.log('Running MiMoCode Extensions tests...\n');

// Core files
console.log('Core Files:');
test('package.json exists', () => assertFileExists('package.json'));
test('README.md exists', () => assertFileExists('README.md'));
test('LICENSE exists', () => assertFileExists('LICENSE'));
test('.gitignore exists', () => assertFileExists('.gitignore'));

// Documentation
console.log('\nDocumentation:');
test('CONTRIBUTING.md exists', () => assertFileExists('CONTRIBUTING.md'));
test('SECURITY.md exists', () => assertFileExists('SECURITY.md'));
test('INSTALL.md exists', () => assertFileExists('INSTALL.md'));
test('CHANGELOG.md exists', () => assertFileExists('CHANGELOG.md'));

// Directories
console.log('\nDirectories:');
test('hooks directory exists', () => assertDirectoryExists('hooks'));
test('tools directory exists', () => assertDirectoryExists('tools'));
test('skills directory exists', () => assertDirectoryExists('skills'));
test('rules directory exists', () => assertDirectoryExists('rules'));
test('workflows directory exists', () => assertDirectoryExists('workflows'));
test('tui directory exists', () => assertDirectoryExists('tui'));
test('mcp directory exists', () => assertDirectoryExists('mcp'));
test('docs directory exists', () => assertDirectoryExists('docs'));
test('tests directory exists', () => assertDirectoryExists('tests'));

// Components count
console.log('\nComponent Counts:');
test('At least 20 hooks', () => {
  const hooks = fs.readdirSync(path.join(ROOT_DIR, 'hooks')).filter(f => f.endsWith('.ts'));
  assert(hooks.length >= 20, `Only ${hooks.length} hooks found`);
});

test('At least 10 tools', () => {
  const tools = fs.readdirSync(path.join(ROOT_DIR, 'tools')).filter(f => f.endsWith('.ts'));
  assert(tools.length >= 10, `Only ${tools.length} tools found`);
});

test('At least 15 skills', () => {
  const skills = fs.readdirSync(path.join(ROOT_DIR, 'skills')).filter(f => fs.statSync(path.join(ROOT_DIR, 'skills', f)).isDirectory());
  assert(skills.length >= 15, `Only ${skills.length} skills found`);
});

test('At least 5 rules', () => {
  const rules = fs.readdirSync(path.join(ROOT_DIR, 'rules')).filter(f => f.endsWith('.md'));
  assert(rules.length >= 5, `Only ${rules.length} rules found`);
});

test('At least 3 workflows', () => {
  const workflows = fs.readdirSync(path.join(ROOT_DIR, 'workflows')).filter(f => f.endsWith('.js'));
  assert(workflows.length >= 3, `Only ${workflows.length} workflows found`);
});

test('At least 5 TUI plugins', () => {
  const tui = fs.readdirSync(path.join(ROOT_DIR, 'tui')).filter(f => f.endsWith('.tsx'));
  assert(tui.length >= 5, `Only ${tui.length} TUI plugins found`);
});

// GitHub
console.log('\nGitHub:');
test('.github directory exists', () => assertDirectoryExists('.github'));
test('Issue templates exist', () => assertDirectoryExists('.github/ISSUE_TEMPLATE'));
test('PR template exists', () => assertFileExists('.github/PULL_REQUEST_TEMPLATE.md'));
test('Workflow exists', () => assertFileExists('.github/workflows/test.yml'));

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
