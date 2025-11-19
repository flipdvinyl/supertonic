import { existsSync, mkdirSync, symlinkSync, cpSync, lstatSync, unlinkSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

function downloadAssets(assetsDir) {
  console.log('📥 Downloading assets from Hugging Face...');
  try {
    execSync(`git clone https://huggingface.co/Supertone/supertonic ${assetsDir}`, {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..')
    });
    console.log('✅ Assets downloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to download assets:', error.message);
    console.warn('⚠️  Please ensure Git LFS is installed: brew install git-lfs && git lfs install');
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
  
  try {
    // Try symlink first (faster, uses less space)
    symlinkSync(assetsDir, assetsLink, 'dir');
    console.log('✅ Created symlink: public/assets -> ../assets');
  } catch (e) {
    // Fallback: copy files
    console.log('📦 Copying assets to public directory...');
    cpSync(assetsDir, assetsLink, { recursive: true });
    console.log('✅ Copied assets to public/assets');
  }
}

prepareAssets();

