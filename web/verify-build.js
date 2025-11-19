import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

function verifyBuild() {
  console.log('🔍 Verifying build...');
  
  const distDir = resolve(__dirname, 'dist');
  const assetsDir = join(distDir, 'assets');
  const onnxDir = join(assetsDir, 'onnx');
  const voiceStylesDir = join(assetsDir, 'voice_styles');
  
  let hasErrors = false;
  
  // Check if dist directory exists
  if (!existsSync(distDir)) {
    console.error('❌ dist directory does not exist!');
    return false;
  }
  
  // Check if assets directory exists
  if (!existsSync(assetsDir)) {
    console.error('❌ assets directory does not exist in dist!');
    return false;
  }
  
  // Check ONNX files
  if (!existsSync(onnxDir)) {
    console.error('❌ assets/onnx directory does not exist in dist!');
    hasErrors = true;
  } else {
    const onnxFiles = readdirSync(onnxDir);
    const requiredOnnxFiles = [
      'duration_predictor.onnx',
      'text_encoder.onnx',
      'vector_estimator.onnx',
      'vocoder.onnx',
      'tts.json',
      'tts.yml',
      'unicode_indexer.json'
    ];
    
    console.log('   Checking ONNX files...');
    for (const file of requiredOnnxFiles) {
      const filePath = join(onnxDir, file);
      if (!existsSync(filePath)) {
        console.error(`   ❌ Missing: ${file}`);
        hasErrors = true;
      } else {
        const stats = statSync(filePath);
        if (stats.size === 0) {
          console.error(`   ❌ Empty file: ${file}`);
          hasErrors = true;
        } else if (file.endsWith('.json')) {
          // Verify JSON is valid
          try {
            const content = readFileSync(filePath, 'utf8');
            if (content.trim().length === 0) {
              console.error(`   ❌ Empty JSON file: ${file}`);
              hasErrors = true;
            } else {
              JSON.parse(content);
              console.log(`   ✅ ${file} (${stats.size} bytes)`);
            }
          } catch (e) {
            console.error(`   ❌ Invalid JSON: ${file} - ${e.message}`);
            hasErrors = true;
          }
        } else if (file.endsWith('.onnx') && stats.size < 1000) {
          console.error(`   ❌ Suspiciously small ONNX file: ${file} (${stats.size} bytes)`);
          hasErrors = true;
        } else {
          const sizeMB = stats.size / 1024 / 1024;
          console.log(`   ✅ ${file} (${sizeMB.toFixed(2)} MB)`);
        }
      }
    }
  }
  
  // Check voice style files
  if (!existsSync(voiceStylesDir)) {
    console.error('❌ assets/voice_styles directory does not exist in dist!');
    hasErrors = true;
  } else {
    const voiceStyleFiles = readdirSync(voiceStylesDir);
    const requiredVoiceStyles = ['M1.json', 'M2.json', 'F1.json', 'F2.json'];
    
    console.log('   Checking voice style files...');
    for (const file of requiredVoiceStyles) {
      const filePath = join(voiceStylesDir, file);
      if (!existsSync(filePath)) {
        console.error(`   ❌ Missing: ${file}`);
        hasErrors = true;
      } else {
        const stats = statSync(filePath);
        if (stats.size === 0) {
          console.error(`   ❌ Empty file: ${file}`);
          hasErrors = true;
        } else {
          try {
            const content = readFileSync(filePath, 'utf8');
            if (content.trim().length === 0) {
              console.error(`   ❌ Empty JSON file: ${file}`);
              hasErrors = true;
            } else {
              JSON.parse(content);
              console.log(`   ✅ ${file} (${stats.size} bytes)`);
            }
          } catch (e) {
            console.error(`   ❌ Invalid JSON: ${file} - ${e.message}`);
            hasErrors = true;
          }
        }
      }
    }
  }
  
  // Additional check: verify tts.json specifically
  const ttsJsonPath = join(onnxDir, 'tts.json');
  if (existsSync(ttsJsonPath)) {
    const stats = statSync(ttsJsonPath);
    const content = readFileSync(ttsJsonPath, 'utf8');
    console.log(`\n   tts.json details:`);
    console.log(`     - Size: ${stats.size} bytes`);
    console.log(`     - Content length: ${content.length} chars`);
    console.log(`     - Is empty: ${content.trim().length === 0}`);
    
    if (content.trim().length === 0) {
      console.error('   ❌ tts.json is empty!');
      hasErrors = true;
    } else {
      try {
        const parsed = JSON.parse(content);
        console.log(`     - Valid JSON: ✅`);
        console.log(`     - Keys: ${Object.keys(parsed).join(', ')}`);
      } catch (e) {
        console.error(`   ❌ tts.json is not valid JSON: ${e.message}`);
        hasErrors = true;
      }
    }
  } else {
    console.error('   ❌ tts.json does not exist!');
    hasErrors = true;
  }
  
  if (hasErrors) {
    console.error('\n❌ Build verification failed! Some files are missing or invalid.');
    console.error('   This will cause runtime errors. Please check the build logs above.');
    process.exit(1);
  } else {
    console.log('\n✅ Build verification passed! All files are present and valid.');
    console.log('   The application should work correctly.');
  }
}

verifyBuild();

