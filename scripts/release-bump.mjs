#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable no-undef */
import {execSync} from 'node:child_process';
import {readFileSync, existsSync} from 'node:fs';

/*
Unified release bump script.
Usage:
  CU_ID=CU-123abc node scripts/release-bump.mjs patch
  CU_ID=CU-123abc node scripts/release-bump.mjs minor
  CU_ID=CU-123abc node scripts/release-bump.mjs major

Behavior:
  - Ensures clean working tree
  - Requires CU_ID (unless ALLOW_PLACEHOLDER=1)
  - Runs npm version (patch/minor/major)
  - Regenerates changelog
  - Commits with conventional message chore(release): <version> <CU_ID>
  - Leaves pushing & GitHub release to caller.
*/

function run(cmd, inherit = true) {
  return execSync(cmd, {stdio: inherit ? 'inherit' : 'pipe'});
}
function get(cmd) {
  return execSync(cmd, {stdio: 'pipe'}).toString().trim();
}

const type = process.argv[2];
if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('Usage: release-bump.mjs <patch|minor|major>');
  process.exit(1);
}

const cuId = process.env.CU_ID || '';
if (!cuId && !process.env.ALLOW_PLACEHOLDER) {
  console.error(
    '✖ CU_ID env var required (e.g. CU_ID=CU-123abc). Set ALLOW_PLACEHOLDER=1 to bypass (discouraged).',
  );
  process.exit(1);
}

if (cuId && !/^CU-[A-Za-z0-9]+$/.test(cuId)) {
  console.error('✖ CU_ID must match pattern CU-<alphanum>.');
  process.exit(1);
}

const status = get('git status --porcelain');
if (status) {
  console.error('✖ Working tree not clean. Commit or stash changes first.');
  process.exit(1);
}

console.log(`🔢 Bumping ${type} version...`);
run(`npm version ${type}`);

console.log('📝 Generating changelog...');
run('npm run changelog:generate');

if (!existsSync('CHANGELOG.md')) {
  console.warn(
    '⚠️ CHANGELOG.md missing after generation; verify conventional-changelog setup.',
  );
}

console.log('📦 Staging artifacts...');
const filesToStage = [
  'package.json',
  'package-lock.json',
  'CHANGELOG.md',
].filter((file) => existsSync(file));
run(`git add ${filesToStage.join(' ')}`);

const newVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
const commitMsg = `chore(release): ${newVersion} ${cuId || 'CU-placeholder'}`;
console.log(`✅ Committing: ${commitMsg}`);
run(`git commit -m "${commitMsg}"`);

const tag = get('git describe --tags --abbrev=0');
console.log(`🏷  Tag created: ${tag}`);

console.log('\nNext steps:');
console.log('  git push && git push --tags');
console.log('  (Optional) Create GitHub Release from tag.');
