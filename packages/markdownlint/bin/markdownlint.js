#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

function escapeRegex(text) {
  return text.replace(/[\\^$+?.()|[\]{}]/g, '\\$&').replace(/-/g, '\\-');
}

function matchesGlob(file, pattern) {
  const normalizedFile = file.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/').replace(/^\.\//, '');

  if (normalizedPattern === '**/*.md') {
    return normalizedFile.endsWith('.md');
  }

  const hasDoubleStar = normalizedPattern.includes('**/');
  const escaped = escapeRegex(normalizedPattern).replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
  const regex = new RegExp(`^${escaped}$`);

  if (hasDoubleStar) {
    return regex.test(normalizedFile);
  }

  return regex.test(path.basename(normalizedFile));
}

function collectMarkdownFiles(baseDir = process.cwd()) {
  const ignoredDirs = new Set(['node_modules', '.git']);
  const stack = [baseDir];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });

    entries.forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          stack.push(fullPath);
        }
        return;
      }

      if (/\.md$/i.test(entry.name)) {
        files.push(fullPath);
      }
    });
  }

  return files;
}

function resolveFilesFromPatterns(patterns) {
  const collected = collectMarkdownFiles();
  const files = new Set();

  patterns.forEach((pattern) => {
    const trimmed = pattern.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed.includes('*')) {
      collected.forEach((file) => {
        if (matchesGlob(file, trimmed)) {
          files.add(file);
        }
      });
      return;
    }

    files.add(trimmed);
  });

  return Array.from(files);
}

function lintFile(path, maxLength = 120) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split(/\r?\n/);
  const problems = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (line.length > maxLength) {
      problems.push({
        rule: 'MD013/line-length',
        message: `Line length [actual: ${line.length}, expected: ${maxLength}]`,
        lineNumber
      });
    }
    if (/\s+$/.test(line)) {
      problems.push({
        rule: 'MD009/no-trailing-spaces',
        message: 'Trailing spaces',
        lineNumber
      });
    }
    if (/\t/.test(line)) {
      problems.push({
        rule: 'MD010/no-hard-tabs',
        message: 'Hard tabs',
        lineNumber
      });
    }
    if (/^#+[^#\s]/.test(line)) {
      problems.push({
        rule: 'MD018/no-missing-space-atx',
        message: 'Missing space after hash in heading',
        lineNumber
      });
    }
  });

  return problems;
}

function formatProblem(file, problem) {
  return `${file}:${problem.lineNumber} ${problem.rule} ${problem.message}`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('No files specified. Usage: markdownlint <files...>');
    process.exit(1);
  }

  const files = resolveFilesFromPatterns(args);
  if (files.length === 0) {
    console.error('No Markdown files matched the provided patterns.');
    process.exit(1);
  }

  let errorCount = 0;

  files.forEach((file) => {
    try {
      const problems = lintFile(file);
      problems.forEach((problem) => {
        errorCount += 1;
        console.error(formatProblem(file, problem));
      });
    } catch (err) {
      errorCount += 1;
      console.error(`${file}: MD000/file-error ${err.message}`);
    }
  });

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

main();
