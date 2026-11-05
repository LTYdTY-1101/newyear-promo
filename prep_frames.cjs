/**
 * 预处理：把 ProRes 透明视频抽成带 alpha 的 PNG 序列（按时间线所需片段）
 * 运行: node prep_frames.cjs
 */
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const COMPOSITOR_DIR = path.join(
  __dirname,
  "node_modules/@remotion/compositor-darwin-arm64"
);
const COMPOSITOR = path.join(COMPOSITOR_DIR, "ffmpeg");
const A = path.join(__dirname, "public/assets");
const OUT = path.join(__dirname, "public/frames");

// [源视频, 输出目录, 需要的秒数]  —— 对应时间轴中每个视频实际出镜的长度
const JOBS = [
  ["video-1.mov", "video1", 2.6],
  ["video-2.mov", "video2", 2.1],
  ["video-3.mov", "video3", 2.1],
];

for (const [src, dir, seconds] of JOBS) {
  const outDir = path.join(OUT, dir);
  fs.mkdirSync(outDir, { recursive: true });
  execFileSync(COMPOSITOR, [
    "-y", "-v", "error",
    "-i", path.join(A, src),
    "-t", String(seconds),
    "-r", "30",
    "-pix_fmt", "rgba",
    path.join(outDir, "f%04d.png"),
  ], { cwd: COMPOSITOR_DIR });
  const n = fs.readdirSync(outDir).filter((f) => f.endsWith(".png")).length;
  console.log(`✓ ${dir}: ${n} frames`);
}
console.log("DONE");
