import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { usePromo } from "../../PromoContext";
import type { VideoLayerProps } from "../../schema";

/**
 * 画板内视频层
 * - 位置 x/y、宽高、圆角、裁剪、缩放、倍速、起止时间、淡入淡出 —— 全部来自 Props
 * - 素材用预先抽好的 PNG 序列（保留透明通道），按「秒」定位到帧，
 *   所以改 fps / 倍速 / 起始秒数都能正确对应画面
 * - 画板内垫一层对齐的背景图：保证画板区域是实色，避免透明被压成黑底
 */
export const VideoBox: React.FC<{ cfg: VideoLayerProps }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { background } = usePromo();

  const durFrames = Math.max(1, Math.round(cfg.duration * fps));

  // 淡入 / 淡出
  const fadeInF = Math.round(cfg.fadeIn * fps);
  const fadeOutF = Math.round(cfg.fadeOut * fps);
  const opacityIn = fadeInF > 0 ? interpolate(frame, [0, fadeInF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const opacityOut =
    fadeOutF > 0
      ? interpolate(frame, [durFrames - fadeOutF, durFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;
  const scaleIn = fadeInF > 0 ? interpolate(frame, [0, fadeInF], [1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  // 序列取帧：以「秒」为基准换算，序列素材固定 30fps 抽帧
  const tSec = (frame / fps) * cfg.playbackRate + cfg.startFrom;
  const raw = Math.floor(tSec * 30);
  const idx = cfg.loop
    ? ((raw % cfg.seqFrames) + cfg.seqFrames) % cfg.seqFrames
    : Math.min(cfg.seqFrames - 1, Math.max(0, raw));

  const imgSrc = cfg.seqDir && cfg.seqFrames > 0
    ? staticFile(`${cfg.seqDir}/f${String(idx + 1).padStart(4, "0")}.png`)
    : staticFile(cfg.src);

  return (
    <div
      style={{
        position: "absolute",
        left: cfg.x,
        top: cfg.y,
        width: cfg.width,
        height: cfg.height,
        borderRadius: cfg.radius,
        overflow: "hidden",
        opacity: opacityIn * opacityOut * cfg.opacity,
        transform: `scale(${scaleIn})`,
        boxShadow: "0 18px 50px rgba(80,10,10,0.35)",
        backgroundImage: `url(${staticFile(background.src)})`,
        backgroundSize: `${background.width}px ${background.height}px`,
        backgroundPosition: `${-cfg.x + background.x}px ${-cfg.y + background.y}px`,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#FFF3E4",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${cfg.cropX}px, ${cfg.cropY}px) scale(${cfg.zoom})`,
        }}
      >
        <Img
          src={imgSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
};
