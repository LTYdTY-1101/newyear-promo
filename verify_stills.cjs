const path = require("path");
const fs = require("fs");
const TMP = path.join(__dirname, ".tmp");
fs.mkdirSync(TMP, { recursive: true });
process.env.TMPDIR = TMP;
process.env.TMP = TMP;
process.env.TEMP = TMP;

const { bundle } = require("@remotion/bundler");
const { selectComposition, renderStill } = require("@remotion/renderer");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function main() {
  const frames = (process.argv[2] || "40,130,190,250,340").split(",").map(Number);
  const serveUrl = await bundle({
    entryPoint: path.join(__dirname, "src/index.ts"),
    publicDir: path.join(__dirname, "public"),
    outDir: path.join(__dirname, "build-verify-" + Date.now()),
  });
  const composition = await selectComposition({ serveUrl, id: "newyear-promo", browserExecutable: CHROME });
  console.log("composition:", composition.width, composition.height, composition.fps, composition.durationInFrames);
  for (const f of frames) {
    await renderStill({
      composition,
      serveUrl,
      frame: f,
      output: path.join(__dirname, "output", `verify-f${f}.png`),
      browserExecutable: CHROME,
      imageFormat: "png",
    });
    console.log("ok", f);
  }
  console.log("VERIFY DONE");
}
main().catch((e) => {
  console.error("FAILED:", e.message || e);
  process.exit(1);
});
