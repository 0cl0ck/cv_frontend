/**
 * Bundle Analyzer Script
 * 
 * This script runs the Next.js bundle analyzer to help identify bundle size issues.
 * It uses the ANALYZE environment variable to enable the @next/bundle-analyzer.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('📊 Starting bundle analysis...');
console.log('⏳ Building with bundle analyzer...');

try {
  // Windows uses a different way to set environment variables in commands
  const isWindows = os.platform() === 'win32';
  const analyzeCmd = isWindows
    ? 'set ANALYZE=true && pnpm build'
    : 'ANALYZE=true pnpm build';
  
  // Run the build with ANALYZE=true
  console.log('🔨 Running build with environment variable ANALYZE=true');
  execSync(analyzeCmd, { 
    stdio: 'inherit',
    env: { ...process.env, ANALYZE: 'true' } 
  });
  
  console.log('✅ Bundle analysis complete!');
  
  // Automatically open the bundle reports
  const clientBundleReport = path.join(__dirname, '.next', 'analyze', 'client.html');
  const serverBundleReport = path.join(__dirname, '.next', 'analyze', 'nodejs.html');
  
  if (fs.existsSync(clientBundleReport)) {
    console.log('📈 Opening client bundle report...');
    const openCmd = isWindows ? 'start' : (os.platform() === 'darwin' ? 'open' : 'xdg-open');
    execSync(`${openCmd} ${clientBundleReport}`);
    
    if (fs.existsSync(serverBundleReport)) {
      console.log('📊 Server bundle report is also available at:', serverBundleReport);
    }
  } else {
    console.log('❌ Bundle reports not found. Check for build errors.');
  }
} catch (error) {
  console.error('❌ Error during bundle analysis:', error.message);
  process.exit(1);
}
