import { execSync } from 'child_process';
import fs from 'fs';

try {
  const stdout = execSync('npx eslint "packages/**/*.{ts,tsx}"', { encoding: 'utf8' });
  fs.writeFileSync('eslint_out.txt', stdout);
} catch (e) {
  fs.writeFileSync('eslint_out.txt', e.stdout || e.message);
}
