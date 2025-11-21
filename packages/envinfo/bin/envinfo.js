#!/usr/bin/env node
const os = require('os');
const { execSync } = require('child_process');

const args = new Set(process.argv.slice(2));
const needsSystem = args.has('--system');
const needsBinaries = args.has('--binaries');
const pkgFlagIndex = process.argv.indexOf('--npmPackages');
let packageList = [];
if (pkgFlagIndex !== -1 && process.argv[pkgFlagIndex + 1]) {
  const raw = process.argv[pkgFlagIndex + 1].replace(/[{}'\"]/g, '');
  packageList = raw.split(',').map((name) => name.trim()).filter(Boolean);
}

function safeExec(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (error) {
    return 'Unavailable';
  }
}

function renderSystem() {
  return {
    OS: `${os.type()} ${os.release()} (${os.platform()} ${os.arch()})`,
    CPU: os.cpus()?.[0]?.model || 'Unknown',
    Memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`
  };
}

function renderBinaries() {
  return {
    Node: process.version,
    npm: safeExec('npm -v')
  };
}

function renderPackages() {
  const results = {};
  packageList.forEach((pkg) => {
    try {
      // Try to resolve the package.json relative to current working directory
      const pkgPath = require.resolve(`${pkg}/package.json`, {
        paths: [process.cwd()]
      });
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const pkgJson = require(pkgPath);
      results[pkg] = pkgJson.version || 'Unknown';
    } catch (error) {
      results[pkg] = 'Not installed';
    }
  });
  return results;
}

function printSection(title, entries) {
  const keys = Object.keys(entries);
  if (!keys.length) return;
  console.log(`${title}:`);
  keys.forEach((key) => {
    console.log(`  ${key}: ${entries[key]}`);
  });
  console.log('');
}

printSection('System', needsSystem ? renderSystem() : {});
printSection('Binaries', needsBinaries ? renderBinaries() : {});
printSection('npmPackages', packageList.length ? renderPackages() : {});
