import { build } from 'vite';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

async function buildExtension() {
  try {
    // Build the extension
    await build({
      configFile: 'vite.config.js',
      mode: process.argv.includes('--watch') ? 'development' : 'production',
    });

    // Copy manifest and icons
    mkdirSync('dist/icons', { recursive: true });
    copyFileSync('manifest.json', 'dist/manifest.json');
    
    // Copy popup.html to root of dist
    copyFileSync('dist/src/popup/popup.html', 'dist/popup.html');
    
    console.log('✅ Extension built successfully!');
    console.log('📂 Output directory: dist/');
    console.log('🔧 Load the extension from Chrome Extensions page');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildExtension();