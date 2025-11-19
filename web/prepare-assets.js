import { existsSync, mkdirSync, symlinkSync, cpSync, lstatSync, unlinkSync, rmSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

function downloadAssets(assetsDir) {
  console.log('📥 Downloading assets from Hugging Face...');
  console.log(`   Target directory: ${assetsDir}`);
  
  // Check if git is available
  try {
    execSync('git --version', { stdio: 'pipe' });
  } catch (e) {
    console.error('❌ Git is not available');
    return false;
  }
  
  // Check if git-lfs is available (optional but recommended)
  let hasGitLFS = false;
  try {
    execSync('git lfs version', { stdio: 'pipe' });
    hasGitLFS = true;
    console.log('   Git LFS is available');
  } catch (e) {
    console.warn('   ⚠️  Git LFS not found, but continuing anyway...');
  }
  
  try {
    // Clone with depth 1 to speed up
    execSync(`git clone --depth 1 https://huggingface.co/Supertone/supertonic ${assetsDir}`, {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..'),
      env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '0' }
    });
    
    // If Git LFS is available, pull LFS files
    if (hasGitLFS) {
      console.log('   Pulling Git LFS files...');
      try {
        execSync('git lfs pull', {
          stdio: 'inherit',
          cwd: assetsDir
        });
      } catch (e) {
        console.warn('   ⚠️  Git LFS pull failed, but continuing...');
      }
    }
    
    console.log('✅ Assets downloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to download assets:', error.message);
    console.warn('   This might be due to network issues or Git LFS not being available');
    return false;
  }
}

function prepareAssets() {
  const assetsDir = resolve(__dirname, '../assets');
  const publicDir = resolve(__dirname, 'public');
  
  if (!existsSync(assetsDir)) {
    console.warn('⚠️  Assets directory not found.');
    // Try to download automatically
    if (!downloadAssets(assetsDir)) {
      console.warn('   Manual download: git clone https://huggingface.co/Supertone/supertonic assets');
      return;
    }
  }
  
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
    
    // Verify that onnx files exist
    const onnxDir = join(assetsLink, 'onnx');
    if (existsSync(onnxDir)) {
      const files = readdirSync(onnxDir);
      const onnxFiles = files.filter(f => f.endsWith('.onnx'));
      console.log(`   Found ${onnxFiles.length} ONNX model files`);
      if (onnxFiles.length === 0) {
        console.warn('   ⚠️  Warning: No ONNX files found! Models may not work.');
      }
    } else {
      console.warn('   ⚠️  Warning: onnx directory not found!');
    }
  } catch (e) {
    console.error('❌ Failed to copy assets:', e.message);
    throw e;
  }
}

prepareAssets();

