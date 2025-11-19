import { existsSync, cpSync, readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

async function postBuild() {
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
    
    // Verify critical files with content check
    const ttsJsonPath = join(distAssetsDir, 'onnx', 'tts.json');
    if (existsSync(ttsJsonPath)) {
      const stats = statSync(ttsJsonPath);
      console.log(`   ✅ tts.json exists: ${stats.size} bytes`);
      
      if (stats.size === 0) {
        console.error('   ❌ tts.json is empty!');
        console.error('   Checking source file...');
        const sourcePath = join(publicAssetsDir, 'onnx', 'tts.json');
        if (existsSync(sourcePath)) {
          const sourceStats = statSync(sourcePath);
          console.error(`   Source file size: ${sourceStats.size} bytes`);
          if (sourceStats.size > 0) {
            console.error('   Source file has content but copy failed!');
            // Try to read and write manually
            try {
              const content = readFileSync(sourcePath, 'utf8');
              console.log(`   Source content length: ${content.length} chars`);
              mkdirSync(dirname(ttsJsonPath), { recursive: true });
              writeFileSync(ttsJsonPath, content, 'utf8');
              console.log('   ✅ Manually wrote tts.json');
            } catch (e) {
              console.error('   ❌ Failed to manually write:', e.message);
            }
          }
        }
        process.exit(1);
      } else {
        // Verify content is valid JSON
        try {
          const content = readFileSync(ttsJsonPath, 'utf8');
          if (content.trim().length === 0) {
            console.error('   ❌ tts.json content is empty after reading!');
            process.exit(1);
          }
          JSON.parse(content);
          console.log(`   ✅ tts.json is valid JSON (${content.length} chars)`);
        } catch (e) {
          console.error(`   ❌ tts.json is not valid: ${e.message}`);
          process.exit(1);
        }
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

postBuild().catch(error => {
  console.error('❌ Fatal error in postBuild:', error);
  process.exit(1);
});

