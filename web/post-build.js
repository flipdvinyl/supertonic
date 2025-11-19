import { existsSync, cpSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

function postBuild() {
  console.log('🔧 Running post-build steps...');
  
  const publicAssetsDir = resolve(__dirname, 'public/assets');
  const distAssetsDir = resolve(__dirname, 'dist/assets');
  const distDir = resolve(__dirname, 'dist');
  
  // Check if public/assets exists
  if (!existsSync(publicAssetsDir)) {
    console.error('❌ public/assets does not exist!');
    process.exit(1);
  }
  
  // Ensure dist directory exists
  if (!existsSync(distDir)) {
    console.error('❌ dist directory does not exist!');
    process.exit(1);
  }
  
  // Check if dist/assets already exists
  if (existsSync(distAssetsDir)) {
    console.log('   dist/assets already exists, checking contents...');
    const files = readdirSync(distAssetsDir);
    console.log(`   Found ${files.length} items in dist/assets`);
  }
  
  // Copy assets from public to dist
  console.log('📦 Copying assets from public/assets to dist/assets...');
  try {
    cpSync(publicAssetsDir, distAssetsDir, {
      recursive: true,
      force: true,
      filter: (src) => {
        // Skip .git directory
        return !src.includes('/.git');
      }
    });
    console.log('✅ Assets copied to dist/assets');
    
    // Verify critical files
    const ttsJsonPath = join(distAssetsDir, 'onnx', 'tts.json');
    if (existsSync(ttsJsonPath)) {
      const stats = statSync(ttsJsonPath);
      console.log(`   ✅ tts.json exists: ${stats.size} bytes`);
      if (stats.size === 0) {
        console.error('   ❌ tts.json is empty!');
        process.exit(1);
      }
    } else {
      console.error('   ❌ tts.json does not exist in dist!');
      process.exit(1);
    }
    
    // List all files in dist/assets/onnx
    const onnxDir = join(distAssetsDir, 'onnx');
    if (existsSync(onnxDir)) {
      const files = readdirSync(onnxDir);
      console.log(`   Files in dist/assets/onnx: ${files.join(', ')}`);
      for (const file of files) {
        const filePath = join(onnxDir, file);
        const stats = statSync(filePath);
        console.log(`     - ${file}: ${stats.size} bytes`);
      }
    }
    
    console.log('✅ Post-build steps completed successfully');
  } catch (error) {
    console.error('❌ Failed to copy assets:', error.message);
    process.exit(1);
  }
}

postBuild();

