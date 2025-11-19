import { existsSync, mkdirSync, cpSync, lstatSync, unlinkSync, rmSync, readdirSync, statSync, createWriteStream, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const HF_REPO = 'Supertone/supertonic';
const HF_BASE_URL = `https://huggingface.co/${HF_REPO}/resolve/main`;

// Files we need to download
const REQUIRED_FILES = [
  'onnx/duration_predictor.onnx',
  'onnx/text_encoder.onnx',
  'onnx/vector_estimator.onnx',
  'onnx/vocoder.onnx',
  'onnx/tts.json',
  'onnx/tts.yml',
  'onnx/unicode_indexer.json',
  'voice_styles/M1.json',
  'voice_styles/M2.json',
  'voice_styles/F1.json',
  'voice_styles/F2.json',
  'config.json',
  'README.md',
  'LICENSE'
];

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    const file = createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadAssets(assetsDir) {
  console.log('📥 Downloading assets from Hugging Face (direct download)...');
  console.log(`   Target directory: ${assetsDir}`);
  
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of REQUIRED_FILES) {
    const url = `${HF_BASE_URL}/${file}`;
    const filePath = join(assetsDir, file);
    
    try {
      console.log(`   Downloading: ${file}...`);
      await downloadFile(url, filePath);
      
      // Verify file size
      const stats = statSync(filePath);
      const sizeMB = stats.size / 1024 / 1024;
      
      if (file.endsWith('.onnx') && stats.size < 1000) {
        console.warn(`   ⚠️  Warning: ${file} seems too small (${stats.size} bytes), might be a pointer file`);
        failCount++;
      } else if (file.endsWith('.json') && stats.size < 10) {
        console.warn(`   ⚠️  Warning: ${file} seems too small (${stats.size} bytes), might be empty or corrupted`);
        // Try to parse JSON to verify
        try {
          const content = readFileSync(filePath, 'utf8');
          JSON.parse(content);
          console.log(`   ✅ Downloaded: ${file} (${stats.size} bytes, valid JSON)`);
          successCount++;
        } catch (e) {
          console.error(`   ❌ ${file} is not valid JSON: ${e.message}`);
          failCount++;
        }
      } else {
        const sizeStr = sizeMB > 1 ? `${sizeMB.toFixed(2)} MB` : `${(stats.size / 1024).toFixed(2)} KB`;
        console.log(`   ✅ Downloaded: ${file} (${sizeStr})`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Failed to download ${file}:`, error.message);
      failCount++;
    }
  }
  
  console.log(`\n   Summary: ${successCount} succeeded, ${failCount} failed`);
  
  if (failCount > 0) {
    console.warn('   ⚠️  Some files failed to download. The app may not work correctly.');
    return false;
  }
  
  console.log('✅ All assets downloaded successfully');
  return true;
}

async function prepareAssets() {
  const assetsDir = resolve(__dirname, '../assets');
  const publicDir = resolve(__dirname, 'public');
  
  console.log('🚀 Starting assets preparation...');
  console.log(`   Assets dir: ${assetsDir}`);
  console.log(`   Public dir: ${publicDir}`);
  
  if (!existsSync(assetsDir)) {
    console.warn('⚠️  Assets directory not found.');
    // Try to download automatically
    const downloaded = await downloadAssets(assetsDir);
    if (!downloaded) {
      console.error('❌ Failed to download assets. The build will fail.');
      process.exit(1);
    }
  } else {
    // Check if assets are valid (not just pointer files)
    const onnxDir = join(assetsDir, 'onnx');
    if (existsSync(onnxDir)) {
      const files = readdirSync(onnxDir);
      const onnxFiles = files.filter(f => f.endsWith('.onnx'));
      let needsRedownload = false;
      
      for (const file of onnxFiles) {
        const filePath = join(onnxDir, file);
        const stats = statSync(filePath);
        if (stats.size < 1000) {
          console.warn(`   ⚠️  ${file} appears to be a pointer file, re-downloading...`);
          needsRedownload = true;
          break;
        }
      }
      
      if (needsRedownload) {
        console.log('   Re-downloading assets...');
        rmSync(assetsDir, { recursive: true, force: true });
        const downloaded = await downloadAssets(assetsDir);
        if (!downloaded) {
          console.error('❌ Failed to re-download assets. The build will fail.');
          process.exit(1);
        }
      }
    }
  }
  
  // Verify critical files exist before copying
  const criticalFiles = [
    join(assetsDir, 'onnx', 'tts.json'),
    join(assetsDir, 'onnx', 'text_encoder.onnx'),
    join(assetsDir, 'voice_styles', 'M1.json')
  ];
  
  for (const file of criticalFiles) {
    if (!existsSync(file)) {
      console.error(`❌ Critical file missing: ${file}`);
      process.exit(1);
    }
    const stats = statSync(file);
    if (stats.size === 0) {
      console.error(`❌ Critical file is empty: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ Critical files verified');
  
  // Create public directory if it doesn't exist
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
  
  // Create assets symlink/copy in public directory
  const assetsLink = join(publicDir, 'assets');
  
  // Remove existing link/file if it exists
  if (existsSync(assetsLink)) {
    try {
      const stats = lstatSync(assetsLink);
      if (stats.isSymbolicLink()) {
        // Remove symlink
        unlinkSync(assetsLink);
      } else {
        // Remove directory/file
        rmSync(assetsLink, { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Always copy files instead of symlink for Vercel compatibility
  // Vercel build environment may not support symlinks properly
  console.log('📦 Copying assets to public directory...');
  try {
    cpSync(assetsDir, assetsLink, { 
      recursive: true,
      force: true,
      filter: (src) => {
        // Skip .git directory
        return !src.includes('/.git');
      }
    });
    console.log('✅ Copied assets to public/assets');
    
    // Verify that onnx files exist and have proper size
    const onnxDir = join(assetsLink, 'onnx');
    if (existsSync(onnxDir)) {
      const files = readdirSync(onnxDir);
      const onnxFiles = files.filter(f => f.endsWith('.onnx'));
      console.log(`   Found ${onnxFiles.length} ONNX model files`);
      
      let allValid = true;
      for (const file of onnxFiles) {
        const filePath = join(onnxDir, file);
        const stats = statSync(filePath);
        const sizeMB = stats.size / 1024 / 1024;
        console.log(`     - ${file}: ${sizeMB.toFixed(2)} MB`);
        
        if (stats.size < 1000) {
          console.warn(`     ⚠️  ${file} is too small, might be corrupted or a pointer file`);
          allValid = false;
        }
      }
      
      if (onnxFiles.length === 0) {
        console.warn('   ⚠️  Warning: No ONNX files found! Models may not work.');
        allValid = false;
      } else if (!allValid) {
        console.warn('   ⚠️  Warning: Some ONNX files appear to be invalid!');
      }
    } else {
      console.warn('   ⚠️  Warning: onnx directory not found!');
    }
  } catch (e) {
    console.error('❌ Failed to copy assets:', e.message);
    throw e;
  }
}

prepareAssets().catch(error => {
  console.error('❌ Fatal error in prepareAssets:', error);
  process.exit(1);
});

