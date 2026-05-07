const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');
const envDevFile = path.join(projectRoot, 'src', 'environments', 'environment.ts');
const envProdFile = path.join(projectRoot, 'src', 'environments', 'environment.prod.ts');

function parseEnv(content) {
  const map = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    map[key] = value;
  }

  return map;
}

function readEnvFile() {
  if (fs.existsSync(envPath) && fs.statSync(envPath).isFile()) {
    return fs.readFileSync(envPath, 'utf8');
  }

  if (fs.existsSync(envExamplePath) && fs.statSync(envExamplePath).isFile()) {
    return fs.readFileSync(envExamplePath, 'utf8');
  }

  return '';
}

function escapeForTsString(input) {
  return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function updateEnvironmentFile(filePath, apiBaseUrl) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const replacement = `apiBaseUrl: '${escapeForTsString(apiBaseUrl)}',`;

  let updated;
  if (/apiBaseUrl\s*:\s*['"][^'"]*['"]\s*,?/m.test(original)) {
    updated = original.replace(/apiBaseUrl\s*:\s*['"][^'"]*['"]\s*,?/m, replacement);
  } else {
    updated = original.replace(/production\s*:\s*(true|false)\s*,?/m, (match) => `${match}\n  ${replacement}`);
  }

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
}

function main() {
  const envContent = readEnvFile();
  const env = parseEnv(envContent);
  const apiBaseUrl = env.API_BASE_URL || 'http://localhost:3000';

  updateEnvironmentFile(envDevFile, apiBaseUrl);
  updateEnvironmentFile(envProdFile, apiBaseUrl);

  console.log(`[env-sync] API_BASE_URL applied: ${apiBaseUrl}`);
}

main();
