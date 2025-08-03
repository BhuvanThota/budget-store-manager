// generate-pwa-icons.js

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// --- Configuration ---
// 1. Path to your source image.
const sourceImagePath = path.join(__dirname, 'public', 'logo-budget-removebg.png'); // <-- CHANGE 'logo.png' TO YOUR IMAGE FILE

// 2. Output directory for the icons.
const outputDir = path.join(__dirname, 'public');

// 3. Icon sizes to generate (as defined in manifest.json).
const iconSizes = [192, 256, 384, 512];
// ---------------------

// Ensure the output directory exists.
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Check if the source image exists.
if (!fs.existsSync(sourceImagePath)) {
  console.error(`Error: Source image not found at ${sourceImagePath}`);
  process.exit(1);
}

console.log(`Generating icons from ${sourceImagePath}...`);

// Generate each icon size.
Promise.all(
  iconSizes.map(size => {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    return sharp(sourceImagePath)
      .resize(size, size)
      .toFile(outputPath)
      .then(() => {
        console.log(`✓ Generated ${outputPath}`);
      });
  })
).then(() => {
  console.log('\nAll PWA icons generated successfully!');
}).catch(err => {
  console.error('\nAn error occurred during icon generation:');
  console.error(err);
});