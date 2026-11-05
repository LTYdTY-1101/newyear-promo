import React from "react";
import { Img, staticFile, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { usePromo } from "../../PromoContext";

/* 对联素材比例 1024×1536（2:3） */
const COUPLET_ASPECT = 1024 / 1536;

/**
 * 对联：从卷起到展开（自上而下）
 * autoMatch 开启：尺寸/位置随开场萝卜自动匹配（挂屏幕两侧、顶部对齐萝卜头顶）
 * autoMatch 关闭：使用手动 leftX/rightX/topY/width/height
 */
export const Couplet: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { couplet: c, intro, background, canvas } = usePromo();

  // ---- 几何（自动匹配 / 手动） ----
  const mascotH = intro.finalHeightRatio * background.height;
  const headTop = intro.footY - mascotH;
  const h = c.autoMatch ? mascotH * c.sizeRatio : c.height;
  const w = c.autoMatch ? h * COUPLET_ASPECT : c.width;
  const leftX = c.autoMatch ? c.edgePad + w / 2 : c.leftX;
  const rightX = c.autoMatch ? canvas.width - c.edgePad - w / 2 : c.rightX;
  const topY = c.autoMatch ? headTop + c.headOffset : c.topY;

  const startF = c.startAt * fps;
  const endF = (c.startAt + c.duration) * fps;
  const fadeF = Math.min(Math.round(0.4 * fps), Math.round(c.duration * fps));

  const progress = spring({
    frame: frame - startF,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
    durationInFrames: Math.max(2, Math.round(c.unrollDuration * fps)),
  });

  const opacity = interpolate(frame, [startF, startF + 4, endF - fadeF, endF], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;

  const sway = Math.sin(frame * 0.05 * c.swaySpeed + (side === "left" ? 0 : 1.6)) * c.swayAmplitude;
  const baseTilt = side === "left" ? -4 : 4;
  const cx = side === "left" ? leftX : rightX;

  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: topY,
        width: w,
        height: h,
        opacity,
        transform: `translate(-50%, 0) rotate(${baseTilt + sway}deg)`,
        transformOrigin: "top center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          clipPath: `inset(0 0 ${(1 - progress) * 100}% 0 round 18px)`,
          filter: "drop-shadow(0 14px 24px rgba(120,10,10,0.4))",
        }}
      >
        <Img
          src={staticFile(side === "left" ? c.leftSrc : c.rightSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {progress < 0.98 && (
        <div
          style={{
            position: "absolute",
            left: "-4%",
            top: `${progress * 100}%`,
            width: "108%",
            height: Math.max(24, h * 0.09),
            transform: "translateY(-50%)",
            borderRadius: 17,
            background: "linear-gradient(180deg, #FFE9A8, #E89B1C)",
            boxShadow: "0 4px 12px rgba(160,90,0,0.5), 0 0 22px rgba(255,215,120,0.8)",
          }}
        />
      )}
    </div>
  );
};

export const Couplets: React.FC = () => {
  const c = usePromo().couplet;
  if (!c.enabled) return null;
  return (
    <>
      <Couplet side="left" />
      <Couplet side="right" />
    </>
  );
};
