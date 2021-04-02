import express from "express"
import { LazyGetter as lazy } from "lazy-get-decorator"
import { memoize } from "lodash"
import { Memoize as memo } from "lodash-decorators"
import puppeteer from "puppeteer"
import sharp from "sharp"
import { AddressInfo_cast_getPort_orThrow } from "src/x/net/AddressInfo"
import { wait } from "src/x/Promise/wait"

interface Opts {
  port?: number
}

export function puppeteer_thumb_server(opts: Opts = {}) {
  return new ThumbServer(opts)
}

export const puppeteer_thumb_server_singleton = memoize(() =>
  puppeteer_thumb_server()
)

class ThumbServer {
  constructor(private opts: Opts) {
    this.app()
  }
  @memo() private app() {
    const app = express()
    //  localhost:7777/thumb?url=http://localhost:6543/docs/mypage
    app.get("/thumb", async (req, res) => {
      const url = typeof req.query.url === "string" ? req.query.url : ""
      const isLocal = url.startsWith("http://localhost:")
      if (!isLocal) {
        return res
          .status(400)
          .send("Accepts only local URLs for thumbnail generation")
      }
      const browser = await puppeteer.launch({
        headless: true,
        // defaultViewport: { width: 1920, height: 1080 },
      })
      const page = await browser.newPage()
      try {
        await page.goto(url, { waitUntil: "domcontentloaded" })
        await wait(100)
        const screenshot = await page.screenshot()
        if (!(screenshot instanceof Buffer))
          throw new Error("page.screenshot() failed")
        /*await*/ browser.close()
        sharp(screenshot)
          .resize({
            width: 400,
            withoutEnlargement: true,
          })
          .pipe(res)
      } catch (e) {
        res.status(500).send("cannot reach URL for thumb generation")
      }
    })
    const server = app.listen(this.opts.port)
    return { app, server }
  }
  @lazy() get port(): number {
    return AddressInfo_cast_getPort_orThrow(this.app().server.address())
  }
  @memo() stop() {
    this.app().server.close()
  }
}
