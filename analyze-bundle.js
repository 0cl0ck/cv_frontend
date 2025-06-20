const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if analyzer config exists
const analyzerConfigPath = path.join(__dirname, 'next.config.analyzer.js');
if (!fs.existsSync(analyzerConfigPath)) {
  console.error('Error: next.config.analyzer.js not found. Please create it first.');
  process.exit(1);
}

// Backup original next.config.js
const originalConfigPath = path.join(__dirname, 'next.config.js');
const backupConfigPath = path.join(__dirname, 'next.config.backup.js');

console.log('📊 Starting bundle analysis...');
console.log('1️⃣ Backing up original next.config.js...');
if (fs.existsSync(originalConfigPath)) {
  fs.copyFileSync(originalConfigPath, backupConfigPath);
}

try {
  console.log('2️⃣ Replacing with analyzer config...');
  fs.copyFileSync(analyzerConfigPath, originalConfigPath);
  
  console.log('3️⃣ Building with bundle analyzer...');
  console.log('⏳ This may take a minute or two...');
  execSync('pnpm build', { stdio: 'inherit' });
  
  console.log('✅ Bundle analysis complete!');
  console.log('📈 Check your browser for the analysis report.');
} catch (error) {
  console.error('❌ Error during bundle analysis:', error);
} finally {
  console.log('4️⃣ Restoring original next.config.js...');
  if (fs.existsSync(backupConfigPath)) {
    fs.copyFileSync(backupConfigPath, originalConfigPath);
    fs.unlinkSync(backupConfigPath);
  }
}
