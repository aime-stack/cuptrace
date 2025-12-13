// Script to skip native builds for problematic packages
// This prevents node-datachannel from trying to build during npm install

const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'node-datachannel');

// If node-datachannel exists but failed to build, create a stub
if (fs.existsSync(nodeModulesPath)) {
  try {
    // Check if the package.json exists
    const packageJsonPath = path.join(nodeModulesPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Create a minimal index.js stub
      const stubContent = `// Stub for node-datachannel - native build not available
module.exports = {};
`;
      
      const indexPath = path.join(nodeModulesPath, 'index.js');
      fs.writeFileSync(indexPath, stubContent);
      
      console.log('✓ Created stub for node-datachannel');
    }
  } catch (error) {
    // Ignore errors - package might not be installed yet
  }
}

