import { ensureDir, outputFile } from "fs-extra"
import puppeteer from "puppeteer"
import sharp from "sharp"
import { crypto_filenameFriendlyHash } from "src/x/crypto/crypto_filenameFriendlyHash"
import { wait } from "src/x/Promise/wait"

export async function puppeteer_get_thumb(url: string, thumbsDir: string) {
  if (url.includes("{")) return undefined
  const browser = await puppeteer.launch({
    // defaultViewport: { width: 1920, height: 1080 },
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "domcontentloaded" })
  await wait(100)
  // and let's take a screenshot
  //const thumbsDir = ctx.storagePath + "/thumbs"
  await ensureDir(thumbsDir)
  const fname_noext = thumbsDir + "/" + crypto_filenameFriendlyHash(url)
  const fname = fname_noext + ".png"
  const fname2x = fname_noext + "@2x.png"
  const screenshot = await page.screenshot()
  /*await*/ browser.close()

  const buffer = await sharp(screenshot)
    .resize({ width: 200, withoutEnlargement: true })
    .toBuffer()
  await outputFile(fname, buffer)

  const buffer2x = await sharp(screenshot)
    .resize({ width: 400, withoutEnlargement: true })
    .toBuffer()
  await outputFile(fname2x, buffer2x)

  return fname
}
