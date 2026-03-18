import {execFileSync} from 'node:child_process';

const packOutput = execFileSync(
  'npm',
  ['pack', '--json', '--dry-run', '--ignore-scripts'],
  {
    encoding: 'utf8',
  },
);

const jsonStart = packOutput.lastIndexOf('[\n');
const packJson = jsonStart >= 0 ? packOutput.slice(jsonStart) : packOutput;
const packResult = JSON.parse(packJson);

if (!Array.isArray(packResult) || packResult.length === 0) {
  throw new Error('npm pack did not return package metadata.');
}

const [artifact] = packResult;
const filePaths = new Set(
  Array.isArray(artifact.files)
    ? artifact.files.map((file) => file.path)
    : [],
);

const requiredPaths = ['app.plugin.js', 'plugin/build/index.js', 'build/index.js'];

for (const requiredPath of requiredPaths) {
  if (!filePaths.has(requiredPath)) {
    throw new Error(
      `Published package is missing required file: ${requiredPath}`,
    );
  }
}

console.log(
  `Package check passed for ${artifact.filename} with ${artifact.entryCount} files.`,
);
