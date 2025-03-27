/**
 * This script helps test the GitHub Pages deployment locally.
 * It sets the NODE_ENV to 'production' and runs the Next.js build and export commands.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set environment variables
process.env.NODE_ENV = 'production';

// Log the current environment
console.log(`Building for environment: ${process.env.NODE_ENV}`);
console.log(`Base path: ${process.env.NODE_ENV === 'production' ? '/atomic-habits-agent' : ''}`);

try {
  // Run Next.js build and export
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  
  console.log('Build completed successfully.');
  console.log('Output directory: ./out');
  
  // Copy .nojekyll file to the out directory to prevent GitHub Pages from using Jekyll
  const nojekyllSource = path.resolve(__dirname, '..', '.nojekyll');
  const nojekyllDest = path.resolve(__dirname, '..', 'out', '.nojekyll');
  fs.copyFileSync(nojekyllSource, nojekyllDest);
  console.log('Copied .nojekyll file to the output directory.');
  
  console.log('To test the built site locally, you can use a simple HTTP server:');
  console.log('npx serve -s out');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
