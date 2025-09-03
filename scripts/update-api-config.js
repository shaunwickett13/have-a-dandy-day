#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Amplify outputs file
const outputsPath = path.join(__dirname, '..', 'amplify_outputs.json');
const configPath = path.join(__dirname, '..', 'api-config.js');

try {
  const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
  const apiUrl = outputs.custom?.API_URL;
  
  if (!apiUrl) {
    console.error('API_URL not found in amplify_outputs.json');
    process.exit(1);
  }
  
  // Update the api-config.js file
  const configContent = `// This file is auto-generated - do not edit manually
// Generated from amplify_outputs.json
window.API_CONFIG = {
  apiUrl: '${apiUrl}'
};`;
  
  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Updated api-config.js with API URL: ${apiUrl}`);
  
} catch (error) {
  console.error('Error updating API config:', error);
  process.exit(1);
}