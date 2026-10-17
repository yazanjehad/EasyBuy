'use strict';
/**
 * One-shot codemod: append `.js` to relative import/export specifiers in
 * apps/api so Node's ESM resolver (which does not do extension guessing)
 * can find the compiled files in dist/.
 *
 * Usage: node fix-esm-imports.cjs           (dry run)
 *        node fix-esm-imports.cjs --apply   (write changes)
 */
const fs = require('fs');
const path = require('path');

const ROOTS = [
  path.join(__dirname, 'apps', 'api', 'src'),
  path.join(__dirname, 'apps', 'api', 'test'),
];
const SKIP_EXT = ['.js', '.mjs', '.cjs', '.json', '.node', '.css', '.ts', '.tsx'];
const APPLY = process.argv.includes('--apply');

// Matches quoted relative specifiers that follow `from`, `import`, `import(`,
// or `require(` — e.g. `from './x'`, `import './x'`, `import('../x')`.
const RE = /\b(?:from|import|require)\s*(?:\(\s*)?(['"])(\.[^'"]+)\1/g;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

let totalFiles = 0;
let totalChanges = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (!file.endsWith('.ts')) continue;
    const original = fs.readFileSync(file, 'utf8');
    let count = 0;
    const updated = original.replace(RE, (match, quote, spec) => {
      if (SKIP_EXT.includes(path.extname(spec))) return match;
      count += 1;
      return match.replace(spec, `${spec}.js`);
    });
    if (count > 0) {
      totalFiles += 1;
      totalChanges += count;
      console.log(`${path.relative(__dirname, file)}: ${count}`);
      if (APPLY && updated !== original) {
        fs.writeFileSync(file, updated, 'utf8');
      }
    }
  }
}

console.log(
  `${APPLY ? 'Applied' : 'Dry run — would change'} ${totalChanges} specifiers in ${totalFiles} files.`,
);
