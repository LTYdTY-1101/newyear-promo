/**
 * 渲染脚本 v2：先渲 PNG 帧序列，再编码成 MP4（避开 renderMedia 截图路径的黑底问题）
 * 用法: node render2.cjs [输出文件名]
 */
const path = require("path");
const fs = require("fs");

const TMP = path.join(__dirname, ".tmp");
fs.mkdirSync(TMP, { recursive: true });
process.env.TMPDIR = TMP;
process.env.TMP = TMP;
process.env.TEMP = TMP;

const { bundle } = require("@remotion/bundler");
const {
  selectComposition,
  renderFrames,
  stitchFramesToVideo,
  makeDownloadMap,
} = require("@remotion/renderer");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function main() {
  const outName = process.argv[2] || "newyear-promo.mp4";
  const outPath = path.join(__dirname, "output", outName);
  const frameDir = path.join(__dirname, "frames-out", String(Date.now()));

  const serveUrl = await bundle({
    entryPoint: path.join(__dirname, "src/index.ts"),
    publicDir: path.join(__dirname, "public"),
    outDir: path.join(__dirname, "build-" + Date.now()),
  });

  const composition = await selectComposition({ serveUrl, id: "newyear-promo", browserExecutable: CHROME });
  console.log(`→ ${composition.width}x${composition.height} @${composition.fps}fps, ${composition.durationInFrames} frames`);

  await renderFrames({
    composition,
    serveUrl,
    outputDir: frameDir,
    imageFormat: "png",
    browserExecutable: CHROME,
    concurrency: 4,
    frameRange: process.env.FRAME_LIMIT ? [0, Number(process.env.FRAME_LIMIT)] : null,
    onStart: () => console.log("→ rendering frames..."),
    onFrameUpdate: (done) => process.stdout.write(`\r  frames ${done}   `),
  });

  const frames = fs.readdirSync(frameDir).filter((f) => f.endsWith(".png"));
  console.log(`\n→ ${frames.length} frames rendered, encoding with ffmpeg...`);

  // 用 Remotion 自带 ffmpeg 把 PNG 帧序列编码成 H.264 MP4
  const compositorDir = path.join(__dirname, "node_modules/@remotion/compositor-darwin-arm64");
  const ffmpeg = path.join(compositorDir, "ffmpeg");
  const tmpOut = outPath.replace(/\.mp4$/, ".tmp.mp4");
  fs.mkdirSync(path.dirname(tmpOut), { recursive: true });
  const { execFileSync } = require("child_process");
  execFileSync(ffmpeg, [
    "-y", "-v", "error",
    "-framerate", String(composition.fps),
    "-i", path.join(frameDir, "element-%03d.png"),
    "-c:v", "libx264", "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    tmpOut,
  ], { cwd: compositorDir });

  // 环境限制：改名可能被拦截，改为复制
  fs.copyFileSync(tmpOut, outPath);
  console.log("✓ done:", outPath);
}

main().catch((e) => {
  console.error("RENDER FAILED:", e && (e.message || e));
  process.exit(1);
});
