import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertToWebP(inputPath, outputPath, quality = 80) {
  try {
    await sharp(inputPath)
      .webp({ quality, effort: 6 })  // effort 6 is a good balance between speed and file size
      .toFile(outputPath);
    
    const originalSize = (await fs.stat(inputPath)).size / 1024;
    const newSize = (await fs.stat(outputPath)).size / 1024;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    
    console.log(`Converted ${path.basename(inputPath)} to WebP:`);
    console.log(`  Original: ${originalSize.toFixed(2)} KB`);
    console.log(`  WebP:     ${newSize.toFixed(2)} KB`);
    console.log(`  Savings:  ${savings}%\n`);
    
    return true;
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
    return false;
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const files = await fs.readdir(publicDir);
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (imageExtensions.includes(ext)) {
      const inputPath = path.join(publicDir, file);
      const outputPath = path.join(publicDir, `${path.parse(file).name}.webp`);
      await convertToWebP(inputPath, outputPath);
    }
  }
  
  console.log('Conversion complete!');
}

main().catch(console.error);
