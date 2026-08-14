import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const publicDir = path.join(root, 'public')
const iconsDir = path.join(publicDir, 'icons')
const assetsDir = path.join(root, 'src', 'assets')
const source = path.join(assetsDir, 'Spendly-logo.png')

// The source is a marketing lockup: a rounded-square app icon on top, with a
// "Spendly" wordmark + tagline underneath. Crop just the icon square, cutting
// well above the wordmark, then trim the transparent margin around it so we
// end up with a tight, roughly-square icon graphic.
async function extractIcon() {
  const meta = await sharp(source).metadata()
  const width = meta.width ?? 1250
  const height = meta.height ?? 1250

  const topRegion = await sharp(source)
    .extract({ left: 0, top: 0, width, height: Math.round(height * 0.66) })
    .png()
    .toBuffer()

  const trimmed = await sharp(topRegion).trim({ threshold: 8 }).png().toBuffer()
  const trimmedMeta = await sharp(trimmed).metadata()
  const size = Math.max(trimmedMeta.width ?? 1, trimmedMeta.height ?? 1)

  // Pad to a perfect square (centered) so every derived icon is non-distorted.
  return sharp(trimmed)
    .resize({
      width: size,
      height: size,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
}

const BRAND_BLUE = { r: 15, g: 91, b: 224, alpha: 1 }

async function main() {
  await mkdir(iconsDir, { recursive: true })
  await mkdir(assetsDir, { recursive: true })

  const icon = await extractIcon()

  // Transparent "any" purpose icons + a crisp in-app copy.
  await sharp(icon).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'))
  await sharp(icon).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'))
  await sharp(icon).resize(256, 256).png().toFile(path.join(assetsDir, 'logo-icon.png'))
  await sharp(icon).resize(128, 128).png().toFile(path.join(publicDir, 'favicon.png'))

  // Maskable / Apple icons must not rely on transparency.
  await sharp(icon)
    .flatten({ background: BRAND_BLUE })
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-192.png'))
  await sharp(icon)
    .flatten({ background: BRAND_BLUE })
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'))
  await sharp(icon)
    .flatten({ background: BRAND_BLUE })
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'))

  console.log('Generated PWA icons from Spendly-logo.png into public/icons, public/favicon.png, public/apple-touch-icon.png, and src/assets/logo-icon.png')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
